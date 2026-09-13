import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { IdempotencyService } from './idempotency.service';
import { NewsroomTelemetryService } from './newsroom-telemetry.service';
import { Public } from '@/common/decorators/public.decorator';
import { AttachVisualDto } from './dto/attach-visual.dto';
import { SubmitTelemetryDto } from './dto/submit-telemetry.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AgentsService, type AgentContext } from './agents.service';
import { AiNewsroomService } from '../ai-newsroom/ai-newsroom.service';
import { CurrentAgent } from './decorators/current-agent.decorator';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentAuthGuard } from './guards/agent-auth.guard';
import { AutoPublishService, type PublishGateEvidence } from '../ai-newsroom/auto-publish.service';
import { NewsroomRecoveryService } from '../ai-newsroom/newsroom-recovery.service';
import { AcknowledgeRecoveryDto } from '../ai-newsroom/dto/newsroom-recovery.dto';
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
    private readonly automation: AiNewsroomService,
    private readonly telemetry: NewsroomTelemetryService,
    private readonly recoveries: NewsroomRecoveryService
  ) {}

  /**
   * Editor recovery requests waiting for the newsroom, oldest first.
   *
   * Why the newsroom pulls: the CMS reads the newsroom database with a
   * read-only role and must never write to it, so an editor's decision is
   * stored here and the newsroom applies it to its own database.
   *
   * Requires `news.create`, which the newsroom already holds, rather than a new
   * permission: the strongest outcome of any recovery is that the story runs
   * through every gate again and is filed as a draft — exactly what
   * `news.create` already covers. The response carries no editor identity.
   */
  @Get('newsroom/recoveries')
  @ResponseMessage('Pending recovery requests')
  @ApiOperation({ summary: 'Editor recovery requests for the newsroom to apply. Read-only.' })
  async pendingRecoveries(@CurrentAgent() agent: AgentContext) {
    this.assertCanFile(agent);
    return this.recoveries.pendingForNewsroom();
  }

  /**
   * The newsroom reports what it did with a request. Idempotent: a repeat with
   * the same outcome returns the stored request, and only a PENDING request
   * can be settled.
   */
  @Post('newsroom/recoveries/:id/ack')
  @ResponseMessage('Recovery acknowledged')
  @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'Accepted for symmetry; acknowledgement is idempotent by request id.' })
  @ApiOperation({ summary: 'Acknowledge a recovery request as queued, applied or rejected' })
  async acknowledgeRecovery(
    @Param('id') id: string,
    @Body() dto: AcknowledgeRecoveryDto,
    @CurrentAgent() agent: AgentContext,
    @Req() request: Request
  ) {
    this.assertCanFile(agent);
    readIdempotencyKey(request);
    return this.recoveries.acknowledge(id, dto, agent.name);
  }

  private assertCanFile(agent: AgentContext): void {
    if (!agent.permissions.includes('news.create')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to handle newsroom recovery requests',
        code: 'FORBIDDEN',
      });
    }
  }

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
  /**
   * Places an already-uploaded asset in an article.
   *
   * The upload endpoint stores the file; this one says where it goes. Kept
   * apart so a retried cycle that re-uploads cannot create a second placement,
   * and so the agent never needs a route that both writes files and edits
   * articles.
   */
  @Post('articles/:id/visuals')
  @ResponseMessage('Visual attached')
  @ApiOperation({ summary: 'Attach an uploaded media asset to a draft as an inline visual' })
  async attachVisual(
    @Param('id') id: string,
    @Body() dto: AttachVisualDto,
    @CurrentAgent() agent: AgentContext
  ) {
    return this.agents.attachVisual(agent, id, dto);
  }

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

  /**
   * Asks the CMS to reconsider the drafts it already holds.
   *
   * Called once per newsroom cycle. Without it, a draft filed before auto mode
   * was turned on would never be looked at again — turning the mode on would
   * only affect stories written afterwards, which is not what "auto publish"
   * means to anyone reading the setting.
   */
  @Post('articles/publish-pending')
  @ResponseMessage('Pending drafts considered')
  @ApiOperation({ summary: 'Reconsider existing drafts for publication, subject to the CMS gates' })
  async publishPending(@CurrentAgent() agent: AgentContext) {
    if (!agent.permissions.includes('news.create')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to submit articles',
        code: 'FORBIDDEN',
      });
    }

    return this.autoPublish.sweepPendingDrafts();
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

  /**
   * Operational telemetry from the newsroom.
   *
   * Exists because the newsroom's own `emit()` wrote only to its local logger,
   * so nothing outside the VPS could see what the pipeline was doing. This is
   * the ingestion half of that path: the newsroom batches events and posts them
   * here, and the admin dashboard reads the table.
   *
   * Deliberately cheap to call and impossible to misuse for anything else. It
   * requires `telemetry.write`, which grants no read of editorial data, and the
   * service behind it only inserts.
   *
   * Two layers of idempotency, answering different questions. `Idempotency-Key`
   * replays a whole HTTP request, which is what a caller retrying a timeout
   * needs. Event ids deduplicate at row level, which is what a caller retrying
   * a *partially delivered batch* needs — the two overlap and neither covers
   * the other.
   */
  @Post('telemetry')
  @ResponseMessage('Telemetry received')
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Stable identifier for this batch. Repeating a request with the same key replays ' +
      'the original result. Event ids deduplicate individual rows regardless.',
  })
  @ApiOperation({ summary: 'Record newsroom operational events' })
  async submitTelemetry(
    @Body() dto: SubmitTelemetryDto,
    @CurrentAgent() agent: AgentContext,
    @Req() request: Request
  ) {
    if (!agent.permissions.includes('telemetry.write')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to write telemetry',
        code: 'FORBIDDEN',
      });
    }

    const idempotencyKey = readIdempotencyKey(request);

    if (!idempotencyKey) return this.telemetry.ingest(dto.events, agent.name);

    return (
      await this.idempotency.execute(
        {
          agentId: agent.id,
          operation: 'agents.telemetry.submit',
          key: idempotencyKey,
          requestBody: dto,
        },
        async () => {
          const result = await this.telemetry.ingest(dto.events, agent.name);
          return { entity: 'NewsroomEvent', entityId: dto.events[0]?.id, response: result };
        }
      )
    ).result;
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
