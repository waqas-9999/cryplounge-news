import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { IdempotencyService } from './idempotency.service';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AgentsService, type AgentContext } from './agents.service';
import { AiNewsroomService } from '../ai-newsroom/ai-newsroom.service';
import { CurrentAgent } from './decorators/current-agent.decorator';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentAuthGuard } from './guards/agent-auth.guard';
import { AutoPublishService, type PublishGateEvidence } from '../ai-newsroom/auto-publish.service';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * The surface agents actually call. Kept separate from `AgentsController`
 * (which is admin-only) so the two authentication schemes never mix on one
 * controller.
 */
@ApiTags('AI Agents')
@Controller('agents')
@Public()
@UseGuards(AgentAuthGuard)
@ApiSecurity('agent-key')
@ApiSecurity('agent-secret')
export class AgentSubmissionController {
  constructor(
    private readonly agents: AgentsService,
    private readonly autoPublish: AutoPublishService,
    private readonly idempotency: IdempotencyService,
    private readonly automation: AiNewsroomService
  ) {}

  /**
   * The automation state an agent must obey.
   *
   * Exists because the admin dashboard is the source of truth for whether
   * automation runs, and an external newsroom had no way to read it: the
   * `admin/ai/automation` routes require a *user* permission
   * (`ai.automation.read`), and the agent allow-list deliberately excludes
   * every `ai.*` permission. Rather than widen that allow-list — which would
   * let an agent reach admin surfaces — this is a read-only projection of the
   * three fields an agent needs, on the authentication scheme it already has.
   *
   * Returns no secrets and nothing writable. An agent can learn whether it
   * may run; it cannot change whether it may run.
   */
  @Get('automation')
  @ResponseMessage('Automation settings')
  @ApiOperation({
    summary: "Automation state for this agent. Read-only; the dashboard is authoritative.",
  })
  async automationSettings(@CurrentAgent() agent: AgentContext) {
    const settings = await this.automation.forAgent();

    return {
      ...settings,
      // The agent's own configuration, so a newsroom can report honestly at
      // startup whether anything it submits could become public.
      agent: {
        publishMode: agent.defaultPublishMode,
        permissions: agent.permissions,
        canPublish: agent.permissions.includes('news.publish'),
        environment: agent.environment,
      },
    };
  }

  /**
   * Stores an editorial banner the newsroom generated.
   *
   * A separate call from the article submission on purpose. The CMS needs a
   * `Media` row before an article can reference one, and combining the two
   * would mean either a multipart article payload or an image inlined as
   * base64 in JSON — both awkward, and both making a retry of the article
   * re-upload the image.
   *
   * The returned id goes into the article's `featuredImageId`.
   */
  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Media stored')
  @ApiOperation({ summary: 'Store an image for use as an article banner' })
  async submitMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { altText?: string; title?: string },
    @CurrentAgent() agent: AgentContext
  ) {
    return this.agents.submitMedia(file, agent, body);
  }

  /**
   * Asks the CMS to consider a draft for publication.
   *
   * Deliberately a *request*, not an instruction. The agent cannot publish —
   * it holds neither `news.publish` nor any route that sets a status. This
   * hands the CMS an article id and the newsroom's gate evidence, and the CMS
   * decides using its own settings and its own re-checks.
   *
   * A refusal is a 200 with `published: false` and the reasons, because a
   * draft that does not qualify is the expected outcome and must be left
   * exactly where it is for a human.
   */
  @Post('articles/:id/request-publish')
  @ResponseMessage('Publication considered')
  @ApiOperation({ summary: 'Ask the CMS to publish a draft, subject to its own gates' })
  async requestPublish(
    @Param('id') id: string,
    @Body() evidence: PublishGateEvidence,
    @CurrentAgent() agent: AgentContext
  ) {
    if (!agent.permissions.includes('news.create')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to submit articles',
        code: 'FORBIDDEN',
      });
    }

    return this.autoPublish.consider(id, evidence);
  }

  @Post('articles')
  @ResponseMessage('Article submitted')
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Stable identifier for this submission, e.g. "newsroom-job-20260813-001". ' +
      'Repeating a request with the same key returns the original result instead ' +
      'of creating a second article. Strongly recommended for any automated caller, ' +
      'which will retry on timeouts and restarts.',
  })
  @ApiOperation({ summary: 'Submit an article; status follows the agent\'s publish mode' })
  async submitArticle(
    @Body() dto: SubmitArticleDto,
    @CurrentAgent() agent: AgentContext,
    @Req() request: Request
  ) {
    const startedAt = Date.now();
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? request.ip;

    const idempotencyKey = readIdempotencyKey(request);

    try {
      /**
       * Without a key the behaviour is exactly as before, so existing callers
       * are unaffected. With one, the submission runs at most once: a retry
       * replays the stored article rather than creating another.
       */
      const article = idempotencyKey
        ? (
            await this.idempotency.execute(
              {
                agentId: agent.id,
                operation: 'agents.articles.submit',
                key: idempotencyKey,
                requestBody: dto,
              },
              async () => {
                const created = await this.agents.submitArticle(agent, dto);
                return { entity: 'Article', entityId: created.id, response: created };
              }
            )
          ).result
        : await this.agents.submitArticle(agent, dto);

      await this.agents.logRequest({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: 'agents/articles',
        method: 'POST',
        statusCode: 201,
        ipAddress,
        contentType: request.headers['content-type'],
        resultEntity: 'Article',
        resultEntityId: article.id,
        durationMs: Date.now() - startedAt,
      });

      return article;
    } catch (error) {
      const statusCode = (error as { status?: number }).status ?? 500;

      await this.agents.logRequest({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: 'agents/articles',
        method: 'POST',
        statusCode,
        ipAddress,
        contentType: request.headers['content-type'],
        validationErrors: (error as { response?: unknown }).response,
        durationMs: Date.now() - startedAt,
      });

      throw error;
    }
  }
}

/**
 * Reads and validates the `Idempotency-Key` header.
 *
 * Bounded and character-restricted because the value becomes part of a unique
 * index: an unbounded or exotic key is a way to bloat the table or to make two
 * keys that look identical in a log compare unequal.
 *
 * Absent is legal — the endpoint keeps its previous behaviour. Present but
 * malformed is refused, because silently ignoring a key a caller believed was
 * protecting them is worse than telling them it was wrong.
 */
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,200}$/;

export function readIdempotencyKey(request: Request): string | null {
  const raw = request.headers['idempotency-key'];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  if (!value) return null;

  if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
    throw new BadRequestException({
      message:
        'Idempotency-Key must be 8-200 characters of letters, digits, dot, underscore, colon or hyphen',
      code: 'INVALID_IDEMPOTENCY_KEY',
    });
  }

  return value;
}
