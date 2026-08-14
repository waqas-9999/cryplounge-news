import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuditAction, CategoryKind, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';

/**
 * AI newsroom automation controls.
 *
 * State is stored in the existing `Setting` table so there is no new model and
 * no migration, and every change goes through the existing audit log.
 *
 * Two access rules are enforced here rather than left to the controller,
 * because they are the whole point of the feature:
 *
 *  1. These keys are **not** reachable through the generic `PUT /settings`
 *     endpoint, which `settings.manage` (held by ADMIN) unlocks. Automatic
 *     publishing is Super-Admin-only, and a second write path would quietly
 *     undo that. See `AI_SETTING_PREFIX` and its use in `SiteService`.
 *  2. These keys are stripped from the public `GET /settings` payload, which
 *     is world-readable.
 */

/** Every automation key lives under this prefix, which is what makes both rules enforceable. */
export const AI_SETTING_PREFIX = 'ai.automation.';

/**
 * How far the newsroom may take a story on its own.
 *
 * Ordered by increasing autonomy. `AUTO_PUBLISH` is defined but **refused** —
 * see `assertPublishModeAllowed`. It exists in the type so the admin screen can
 * show the intended end state rather than pretending it does not exist.
 */
export const AI_PUBLISH_MODES = ['DRAFT_ONLY', 'REVIEW_REQUIRED', 'AUTO_PUBLISH'] as const;
export type AiPublishMode = (typeof AI_PUBLISH_MODES)[number];

const KEYS = {
  /** The global kill switch. Authoritative; nothing publishes while it is false. */
  enabled: `${AI_SETTING_PREFIX}enabled`,
  /** Per-category switches, keyed by CrypLounge category slug. */
  categories: `${AI_SETTING_PREFIX}categories`,
  /** How far automation may go. Defaults to the most restrictive value. */
  publishMode: `${AI_SETTING_PREFIX}publishMode`,
  /** Observability for the admin screen. */
  lastRunAt: `${AI_SETTING_PREFIX}lastRunAt`,
  lastPublishedAt: `${AI_SETTING_PREFIX}lastPublishedAt`,
  lastPublishedTitle: `${AI_SETTING_PREFIX}lastPublishedTitle`,
  lastError: `${AI_SETTING_PREFIX}lastError`,
} as const;

export interface AutomationStatus {
  /** Global switch. Defaults to false — automation is opt-in, never opt-out. */
  enabled: boolean;
  publishMode: AiPublishMode;
  /**
   * Modes the admin screen may currently offer. `AUTO_PUBLISH` is absent until
   * the generation, fact-check and image stages exist — the UI greys it out
   * rather than accepting a setting the server would reject.
   */
  availablePublishModes: AiPublishMode[];
  /** slug → enabled, for every NEWS category that exists. */
  categories: Array<{ slug: string; name: string; id: string; enabled: boolean }>;
  lastRunAt: string | null;
  lastPublishedAt: string | null;
  lastPublishedTitle: string | null;
  lastError: string | null;
  /**
   * Whether anything could publish right now. Reported separately from
   * `enabled` so the screen can say *why* nothing is running.
   */
  effective: {
    canPublish: boolean;
    reason: string;
  };
}

@Injectable()
export class AiNewsroomService {
  private readonly logger = new Logger(AiNewsroomService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  private async raw<T>(key: string, fallback: T): Promise<T> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return (row?.value as T) ?? fallback;
  }

  /**
   * Reads the global switch.
   *
   * Defaults to **false**. A missing row must never be read as "enabled" — the
   * safe default for a control that publishes to the public site is off.
   */
  async isEnabled(): Promise<boolean> {
    return (await this.raw<boolean>(KEYS.enabled, false)) === true;
  }

  async enabledCategorySlugs(): Promise<string[]> {
    const map = await this.raw<Record<string, boolean>>(KEYS.categories, {});
    return Object.entries(map)
      .filter(([, enabled]) => enabled === true)
      .map(([slug]) => slug);
  }

  /**
   * The single question the publishing path asks.
   *
   * Both switches must be on, and the category must still exist. Returns the
   * reason as well as the verdict so a refusal is explainable in the audit log
   * rather than silent.
   */
  async canPublishToCategory(slug: string): Promise<{ allowed: boolean; reason: string }> {
    if (!(await this.isEnabled())) {
      return { allowed: false, reason: 'AI automation is disabled globally' };
    }

    const category = await this.prisma.category.findUnique({
      where: { kind_slug: { kind: CategoryKind.NEWS, slug } },
    });
    if (!category) {
      return { allowed: false, reason: `No NEWS category "${slug}" exists` };
    }

    const map = await this.raw<Record<string, boolean>>(KEYS.categories, {});
    if (map[slug] !== true) {
      return { allowed: false, reason: `AI automation is disabled for "${slug}"` };
    }

    return { allowed: true, reason: 'Global and category automation are both enabled' };
  }

  async publishMode(): Promise<AiPublishMode> {
    const stored = await this.raw<string>(KEYS.publishMode, 'DRAFT_ONLY');
    // An unrecognised stored value falls back to the safest mode rather than
    // being trusted — a corrupted setting must not widen what automation may do.
    return (AI_PUBLISH_MODES as readonly string[]).includes(stored)
      ? (stored as AiPublishMode)
      : 'DRAFT_ONLY';
  }

  /**
   * Modes that may currently be selected.
   *
   * `AUTO_PUBLISH` is withheld because the stages it depends on — article
   * generation, fact checking and image production — are not implemented. An
   * admin who selected it would enable nothing while believing otherwise,
   * which is worse than the option being visibly unavailable.
   */
  availablePublishModes(): AiPublishMode[] {
    return ['DRAFT_ONLY', 'REVIEW_REQUIRED'];
  }

  private assertPublishModeAllowed(mode: AiPublishMode): void {
    if (!this.availablePublishModes().includes(mode)) {
      throw new BadRequestException({
        message:
          `"${mode}" is not available yet. Article generation, fact checking and ` +
          'image production must be implemented and verified before automation may publish.',
        code: 'PUBLISH_MODE_UNAVAILABLE',
      });
    }
  }

  async setPublishMode(mode: AiPublishMode, context: AuditContext): Promise<AutomationStatus> {
    this.assertPublishModeAllowed(mode);
    await this.write(KEYS.publishMode, mode, context, `Set AI publishing mode to ${mode}`);
    return this.status();
  }

  async status(): Promise<AutomationStatus> {
    const [enabled, mode, map, categories, lastRunAt, lastPublishedAt, lastPublishedTitle, lastError] =
      await Promise.all([
        this.isEnabled(),
        this.publishMode(),
        this.raw<Record<string, boolean>>(KEYS.categories, {}),
        this.prisma.category.findMany({
          where: { kind: CategoryKind.NEWS },
          orderBy: { position: 'asc' },
          select: { id: true, slug: true, name: true },
        }),
        this.raw<string | null>(KEYS.lastRunAt, null),
        this.raw<string | null>(KEYS.lastPublishedAt, null),
        this.raw<string | null>(KEYS.lastPublishedTitle, null),
        this.raw<string | null>(KEYS.lastError, null),
      ]);

    // Driven by the real category list, so a category deleted in the CMS
    // disappears from the screen instead of lingering as an orphaned toggle.
    const withFlags = categories.map(category => ({
      ...category,
      enabled: map[category.slug] === true,
    }));

    const anyCategory = withFlags.some(category => category.enabled);

    return {
      enabled,
      publishMode: mode,
      availablePublishModes: this.availablePublishModes(),
      categories: withFlags,
      lastRunAt,
      lastPublishedAt,
      lastPublishedTitle,
      lastError,
      effective: {
        // Publishing is not implemented at all yet; this reports the *setting*
        // state, and the publication adapter refuses regardless.
        canPublish: enabled && anyCategory,
        reason: !enabled
          ? 'Global automation is off'
          : !anyCategory
            ? 'No category has automation enabled'
            : 'Global and at least one category are enabled',
      },
    };
  }

  /* --------------------------------------------------------------- writes -- */

  private async write(key: string, value: unknown, context: AuditContext, summary: string) {
    const previous = await this.prisma.setting.findUnique({ where: { key } });

    await this.prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });

    // Enabling automated publishing is among the highest-consequence actions
    // in the product, so before/after is always recorded with the actor.
    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'Setting',
      entityId: key,
      summary,
      context,
      metadata: { before: previous?.value ?? null, after: value } as Prisma.InputJsonValue,
    });
  }

  async setEnabled(enabled: boolean, context: AuditContext): Promise<AutomationStatus> {
    await this.write(
      KEYS.enabled,
      enabled,
      context,
      `${enabled ? 'Enabled' : 'Disabled'} AI news automation globally`
    );

    this.logger.warn(
      { enabled, actor: context.user?.email ?? context.actorLabel },
      'AI automation global switch changed'
    );

    return this.status();
  }

  /**
   * Toggles one category.
   *
   * The slug is validated against the real category table: automation must
   * never be enabled for a category that does not exist, which would produce a
   * flag nothing honours and a screen that lies.
   */
  async setCategoryEnabled(
    slug: string,
    enabled: boolean,
    context: AuditContext
  ): Promise<AutomationStatus> {
    const category = await this.prisma.category.findUnique({
      where: { kind_slug: { kind: CategoryKind.NEWS, slug } },
    });
    if (!category) {
      throw new BadRequestException({
        message: `No NEWS category "${slug}" exists`,
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    const map = await this.raw<Record<string, boolean>>(KEYS.categories, {});
    const next = { ...map, [slug]: enabled };

    await this.write(
      KEYS.categories,
      next,
      context,
      `${enabled ? 'Enabled' : 'Disabled'} AI automation for category "${slug}"`
    );

    return this.status();
  }

  /** Recorded by the newsroom after a run. Not a user-facing control. */
  async recordRun(
    result: { publishedTitle?: string; error?: string },
    context: AuditContext
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.write(KEYS.lastRunAt, now, context, 'AI newsroom run completed');

    if (result.publishedTitle) {
      await this.write(KEYS.lastPublishedAt, now, context, 'AI newsroom published an article');
      await this.write(KEYS.lastPublishedTitle, result.publishedTitle, context, 'AI newsroom published an article');
    }
    await this.write(KEYS.lastError, result.error ?? null, context, 'AI newsroom run status recorded');
  }
}
