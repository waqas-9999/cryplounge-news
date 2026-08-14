import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AgentPublishMode, AuditAction, ContentStatus, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService } from '../content-core/audit.service';
import { PublishingService } from '../content-core/publishing.service';
import { checkAgentPermissions, describeRejections } from './agent-permissions';
import { SlugService } from '../content-core/slug.service';
import type { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';
import type { SubmitArticleDto } from './dto/submit-article.dto';
import { WebhooksService } from '../webhooks/webhooks.service';

const PUBLISH_MODE_TO_STATUS: Record<AgentPublishMode, ContentStatus> = {
  DRAFT: ContentStatus.DRAFT,
  REVIEW: ContentStatus.REVIEW,
  SCHEDULED: ContentStatus.SCHEDULED,
  IMMEDIATE: ContentStatus.PUBLISHED,
};

export interface AgentContext {
  id: string;
  name: string;
  environment: string;
  permissions: string[];
  defaultPublishMode: AgentPublishMode;
}

/**
 * Trusted external publishers.
 *
 * The platform never generates content — an agent authenticates with a key
 * and a secret (never a user session), submits content within the
 * permissions it was granted, and every call is logged whether it succeeds
 * or not. `apiSecretHash` is Argon2id, exactly like a user password; the
 * plaintext secret is shown once, at creation or regeneration, and never
 * again.
 */
@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly audit: AuditService,
    private readonly webhooks: WebhooksService
  ) {}

  async list() {
    return this.prisma.aiAgent.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        environment: true,
        isActive: true,
        apiKey: true,
        allowedIps: true,
        defaultPublishMode: true,
        permissions: true,
        rateLimitPerMinute: true,
        lastConnectedAt: true,
        lastPublishedAt: true,
        lastError: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    const agent = await this.prisma.aiAgent.findUniqueOrThrow({ where: { id } });
    const { apiSecretHash: _hash, ...safe } = agent;
    return safe;
  }

  /** Returns the plaintext secret once. It cannot be recovered afterwards. */
  async create(dto: CreateAgentDto) {
    await this.assertKnownPermissions(dto.permissions);

    const slug = await this.uniqueAgentSlug(dto.name);
    const apiKey = `agt_${randomBytes(16).toString('hex')}`;
    const apiSecret = randomBytes(32).toString('base64url');

    const agent = await this.prisma.aiAgent.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        environment: dto.environment,
        defaultPublishMode: dto.defaultPublishMode,
        allowedIps: dto.allowedIps ?? [],
        permissions: dto.permissions ?? [],
        rateLimitPerMinute: dto.rateLimitPerMinute,
        apiKey,
        apiSecretHash: await argon2.hash(apiSecret, { type: argon2.argon2id }),
      },
    });

    const { apiSecretHash: _hash, ...safe } = agent;
    return { ...safe, apiSecret };
  }

  async update(id: string, dto: UpdateAgentDto) {
    await this.assertKnownPermissions(dto.permissions);
    const agent = await this.prisma.aiAgent.update({ where: { id }, data: dto });
    const { apiSecretHash: _hash, ...safe } = agent;
    return safe;
  }

  /** Issues a new secret, invalidating the old one immediately. */
  async regenerateSecret(id: string) {
    const apiSecret = randomBytes(32).toString('base64url');
    await this.prisma.aiAgent.update({
      where: { id },
      data: { apiSecretHash: await argon2.hash(apiSecret, { type: argon2.argon2id }) },
    });
    return { apiSecret };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.aiAgent.delete({ where: { id } });
  }

  /**
   * Verifies the `X-Agent-Key` / `X-Agent-Secret` pair.
   *
   * Failures are all `UnauthorizedException` regardless of cause — an
   * unknown key and a wrong secret must look the same to a caller probing
   * for valid keys.
   */
  async verifyCredentials(apiKey: string, apiSecret: string, ipAddress?: string) {
    const agent = await this.prisma.aiAgent.findUnique({ where: { apiKey } });

    if (!agent || !agent.isActive) {
      throw new UnauthorizedException('Invalid agent credentials');
    }

    if (agent.allowedIps.length > 0 && ipAddress && !agent.allowedIps.includes(ipAddress)) {
      throw new UnauthorizedException('Invalid agent credentials');
    }

    const valid = await argon2.verify(agent.apiSecretHash, apiSecret).catch(() => false);
    if (!valid) {
      throw new UnauthorizedException('Invalid agent credentials');
    }

    await this.prisma.aiAgent.update({
      where: { id: agent.id },
      data: { lastConnectedAt: new Date() },
    });

    /**
     * Defence in depth: the allow-list is enforced on write, but rows created
     * before it existed — or written by any future code path that forgets to
     * validate — could still carry a forbidden grant. Filtering here means a
     * dangerous permission sitting in the database is inert at request time
     * rather than merely hard to create.
     */
    const check = checkAgentPermissions(agent.permissions);
    if (!check.allowed) {
      const stripped = check.rejected.map(item => item.key);
      this.logger.error(
        { agentId: agent.id, agent: agent.name, stripped },
        'Agent holds permissions that are forbidden for agents; ignoring them for this request'
      );
      return { ...agent, permissions: agent.permissions.filter(key => !stripped.includes(key)) };
    }

    return agent;
  }

  /** Throws 429 once the agent has exceeded its per-minute call budget. */
  async assertWithinRateLimit(agent: AgentContext): Promise<void> {
    const since = new Date(Date.now() - 60_000);
    const recent = await this.prisma.agentRequestLog.count({
      where: { agentId: agent.id, createdAt: { gte: since } },
    });

    const limit = await this.prisma.aiAgent
      .findUniqueOrThrow({ where: { id: agent.id }, select: { rateLimitPerMinute: true } })
      .then(row => row.rateLimitPerMinute);

    if (recent >= limit) {
      throw new HttpException('Agent rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async logRequest(entry: {
    agentId: string | null;
    agentName?: string | null;
    endpoint: string;
    method: string;
    statusCode: number;
    ipAddress?: string;
    contentType?: string;
    resultEntity?: string;
    resultEntityId?: string;
    validationErrors?: unknown;
    durationMs: number;
  }): Promise<void> {
    await this.prisma.agentRequestLog
      .create({
        data: {
          ...entry,
          validationErrors: entry.validationErrors as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined); // logging must never break the response it describes
  }

  /**
   * Creates an article on an agent's behalf.
   *
   * There is no `createdById` here: an agent is not a `User` row, and the
   * column stays null rather than pointed at a fabricated account.
   * Attribution instead lives in the audit entry's `actorLabel` and in
   * `AgentRequestLog`.
   */
  async submitArticle(agent: AgentContext, dto: SubmitArticleDto) {
    if (!agent.permissions.includes('news.create')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to create articles',
        code: 'FORBIDDEN',
      });
    }

    let status = PUBLISH_MODE_TO_STATUS[agent.defaultPublishMode];
    if (this.publishing.requiresPublishPermission(status) && !agent.permissions.includes('news.publish')) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to publish articles',
        code: 'FORBIDDEN',
      });
    }

    if (status === ContentStatus.SCHEDULED && !dto.scheduledFor) {
      throw new BadRequestException('scheduledFor is required for scheduled publish mode');
    }

    const slug = await this.slugs.unique('article', dto.slug ?? dto.title);
    const { publishedAt, scheduledFor } = this.publishing.resolveDates({
      status,
      currentPublishedAt: null,
      scheduledFor: dto.scheduledFor,
    });

    const article = await this.prisma.article.create({
      data: {
        slug,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        status,
        publishedAt,
        scheduledFor,
        featured: dto.featured,
        priority: dto.priority,
        readMinutes: dto.readMinutes,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.authorId ? { authorId: dto.authorId } : {}),
        ...(dto.featuredImageId ? { featuredImageId: dto.featuredImageId } : {}),
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map(id => ({ id })) } } : {}),
        ...(dto.labelIds ? { labels: { connect: dto.labelIds.map(id => ({ id })) } } : {}),
        versions: {
          create: { title: dto.title, summary: dto.summary, content: dto.content },
        },
      },
      include: { category: true, author: true },
    });

    await this.prisma.aiAgent.update({
      where: { id: agent.id },
      data: { lastPublishedAt: new Date() },
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Article',
      entityId: article.id,
      summary: `Agent "${agent.name}" submitted article "${article.title}"`,
      context: { actorLabel: `Agent: ${agent.name}` },
    });

    this.webhooks.dispatch('PUBLISH_COMPLETED', {
      entity: 'Article',
      entityId: article.id,
      slug: article.slug,
      status: article.status,
    }, agent.id);

    return article;
  }

  /** AiAgent isn't in `SlugService.SluggableModel`, so uniqueness is checked directly here. */
  private async uniqueAgentSlug(name: string): Promise<string> {
    const base = this.slugs.slugify(name) || 'agent';
    const taken = await this.prisma.aiAgent.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const used = new Set(taken.map(row => row.slug));
    if (!used.has(base)) return base;
    for (let suffix = 2; suffix < 1000; suffix += 1) {
      if (!used.has(`${base}-${suffix}`)) return `${base}-${suffix}`;
    }
    return `${base}-${Date.now()}`;
  }

  async recentRequests(agentId: string, limit = 50) {
    return this.prisma.agentRequestLog.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
  }

  /**
   * Validates a requested permission set in two stages.
   *
   * Existence alone is not enough: `users.manage` and `roles.manage` are real
   * catalogue keys, so a check for "does this key exist" passes them happily
   * and an agent ends up able to alter staff accounts or grant itself
   * anything. The second stage is an allow-list, so a permission added to the
   * catalogue later is refused for agents until explicitly opted in.
   */
  private async assertKnownPermissions(keys?: string[]): Promise<void> {
    if (!keys?.length) return;

    const known = await this.prisma.permission.findMany({
      where: { key: { in: keys } },
      select: { key: true },
    });
    const knownKeys = new Set(known.map(row => row.key));
    const unknown = keys.filter(key => !knownKeys.has(key));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown permission key(s): ${unknown.join(', ')}`);
    }

    const check = checkAgentPermissions(keys);
    if (!check.allowed) {
      throw new ForbiddenException({
        message: `An AI agent may not hold these permissions: ${describeRejections(check)}`,
        code: 'AGENT_PERMISSION_FORBIDDEN',
        errors: { permissions: check.rejected.map(item => item.key) },
      });
    }
  }
}
