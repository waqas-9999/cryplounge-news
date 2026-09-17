import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AiNewsroomService, type AiPublishMode } from './ai-newsroom.service';

/**
 * The one set of rules for publication that no human performs directly.
 *
 * ## Why this exists
 *
 * Content reached PUBLISHED by four routes that each carried their own checks:
 * an agent's submission (whose status followed the agent's configured publish
 * mode), `request-publish`, the `publish-pending` sweep, and the scheduled
 * publishing job. They disagreed. The request routes required only
 * `news.create`, identified AI content as "created by no user", checked no
 * ownership and ignored the per-category switch; the scheduled job checked
 * nothing at all. Each was a way round the others.
 *
 * Every automated route now asks this service, so there is one definition of:
 *
 *   - **origin** — who created the article, from `createdByAgentId` and
 *     `createdById`, never from the absence of a user;
 *   - **agent authority** — `news.publish` *and* ownership of the article;
 *   - **automation state** — emergency pause, global switch, publish mode,
 *     daily limit and the per-category switch.
 *
 * ## What it does not govern
 *
 * A human editor publishing through the admin UI. That path is authorised by
 * the editor's own `news.publish` permission, and the automation controls are
 * — by design, decision B8 — controls over automation, not over editors.
 */

export type ArticleOrigin = 'AGENT' | 'HUMAN' | 'UNKNOWN';

export interface OriginFields {
  createdById: string | null;
  createdByAgentId: string | null;
}

/**
 * Where an article came from.
 *
 * `UNKNOWN` — neither a user nor an agent recorded — is deliberately its own
 * value. Treating it as "probably the newsroom" is exactly the assumption that
 * let a draft with no recorded creator be swept into publication; every rule
 * below fails closed on it.
 */
export function originOf(article: OriginFields): ArticleOrigin {
  if (article.createdByAgentId) return 'AGENT';
  if (article.createdById) return 'HUMAN';
  return 'UNKNOWN';
}

/** The permission an agent needs before any publication path will listen to it. */
export const PUBLISH_PERMISSION = 'news.publish';

export interface AgentIdentity {
  id: string;
  permissions: string[];
}

export interface AutomationVerdict {
  /** True when the emergency pause is engaged; nothing else was evaluated. */
  paused: boolean;
  reasons: string[];
  mode: AiPublishMode;
  publishedToday: number;
  dailyLimit: number;
}

@Injectable()
export class PublicationGateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly newsroom: AiNewsroomService
  ) {}

  /**
   * May this agent use a publication route at all?
   *
   * Thrown rather than returned: a caller without the permission is not asking
   * a question the gates can answer, and must not learn anything about the
   * article or the automation state.
   */
  assertAgentMayPublish(agent: AgentIdentity): void {
    if (!agent.permissions.includes(PUBLISH_PERMISSION)) {
      throw new ForbiddenException({
        message: 'This agent is not permitted to request publication',
        code: 'AGENT_PUBLISH_FORBIDDEN',
      });
    }
  }

  /**
   * May this agent ask for *this* article to be published?
   *
   * Only an article the agent itself created. Not a human's draft, not another
   * agent's, and not one whose origin was never recorded.
   */
  assertAgentOwns(agent: AgentIdentity, article: OriginFields & { id: string }): void {
    this.assertAgentMayPublish(agent);
    if (article.createdByAgentId !== agent.id) {
      throw new ForbiddenException({
        message: 'This agent did not create that article and may not request its publication',
        code: 'NOT_ARTICLE_OWNER',
      });
    }
  }

  /**
   * Whether automation may publish right now, for an article in this category.
   *
   * The emergency pause is checked first and alone: when an operator has hit
   * the stop, no further reasoning matters and none is reported.
   */
  async automationVerdict(categorySlug: string | null | undefined): Promise<AutomationVerdict> {
    const [mode, enabled, paused, dailyLimit, enabledCategories] = await Promise.all([
      this.newsroom.publishMode(),
      this.newsroom.isEnabled(),
      this.newsroom.isEmergencyPaused(),
      this.newsroom.autoPublishDailyLimit(),
      this.newsroom.enabledCategorySlugs(),
    ]);

    if (paused) {
      return { paused: true, reasons: ['emergency pause is active'], mode, publishedToday: 0, dailyLimit };
    }

    const reasons: string[] = [];
    if (!enabled) reasons.push('AI automation is switched off');
    if (mode !== 'AUTO_PUBLISH') reasons.push(`publish mode is ${mode}, not AUTO_PUBLISH`);

    const publishedToday = await this.automatedPublicationsToday();
    if (publishedToday >= dailyLimit) {
      reasons.push(`daily auto-publish limit reached (${publishedToday}/${dailyLimit})`);
    }

    // The per-category switch, which the request path never consulted. The
    // map is fail-closed: a category is allowed only when explicitly enabled.
    if (!categorySlug) {
      reasons.push('the article has no category');
    } else if (!enabledCategories.includes(categorySlug)) {
      reasons.push(`AI automation is disabled for the "${categorySlug}" category`);
    }

    return { paused: false, reasons, mode, publishedToday, dailyLimit };
  }

  /**
   * Automated publications since midnight UTC.
   *
   * Counted from the PUBLISH audit entries automation writes, which carry no
   * user. A human publishing drafts by hand writes their own email and does
   * not consume the automation quota.
   */
  async automatedPublicationsToday(): Promise<number> {
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);

    return this.prisma.auditLog.count({
      where: {
        entity: 'Article',
        action: AuditAction.PUBLISH,
        createdAt: { gte: midnight },
        userEmail: null,
      },
    });
  }

  /**
   * Whether a scheduled article may be published now.
   *
   * Human-created articles were scheduled by an editor holding `news.publish`
   * — that is the only route that sets SCHEDULED on them — and publish on
   * time as they always have.
   *
   * Everything else must clear the full automation gate. An agent's article
   * reaching SCHEDULED by any route must not become a way round the emergency
   * pause, draft-only mode, the daily limit or the category switches, and an
   * article of unrecorded origin is held rather than trusted.
   */
  async scheduledVerdict(article: OriginFields & { categorySlug: string | null }): Promise<{
    publish: boolean;
    origin: ArticleOrigin;
    reasons: string[];
  }> {
    const origin = originOf(article);
    if (origin === 'HUMAN') return { publish: true, origin, reasons: [] };

    const verdict = await this.automationVerdict(article.categorySlug);
    const reasons =
      origin === 'UNKNOWN'
        ? ['the article has no recorded creator, so it cannot be published automatically', ...verdict.reasons]
        : verdict.reasons;

    return { publish: origin === 'AGENT' && reasons.length === 0, origin, reasons };
  }
}
