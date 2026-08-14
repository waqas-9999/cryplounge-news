import { BadRequestException, Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { IdempotencyService } from './idempotency.service';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AgentsService, type AgentContext } from './agents.service';
import { CurrentAgent } from './decorators/current-agent.decorator';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentAuthGuard } from './guards/agent-auth.guard';

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
    private readonly idempotency: IdempotencyService
  ) {}

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
