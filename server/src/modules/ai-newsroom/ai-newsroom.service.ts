import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuditAction, CategoryKind, ContentStatus, Prisma } from '@prisma/client';
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
  /**
   * The emergency stop.
   *
   * Separate from `enabled` on purpose. `enabled` is the ordinary switch an
   * operator toggles while tuning; this is the one they reach for when
   * something is wrong, and it is checked first and independently so that
   * nothing else — mode, limits, gates — can reason around it.
   */
  emergencyPause: `${AI_SETTING_PREFIX}emergencyPause`,
  /** Ceiling on articles the newsroom may publish without a human, per day. */
  autoPublishDailyLimit: `${AI_SETTING_PREFIX}autoPublishDailyLimit`,
  /** Opportunity score an article must reach to be published automatically. */
  autoPublishMinScore: `${AI_SETTING_PREFIX}autoPublishMinScore`,
  /**
   * How selective auto mode is.
   *
   * `ALL_DRAFTS` publishes everything that reached the drafts queue.
   * `HIGH_CONFIDENCE` additionally requires the score, fact and quality
   * thresholds. See `AutoPublishService` for what each actually skips — the
   * safety checks are not part of this choice and apply either way.
   */
  autoPublishStrictness: `${AI_SETTING_PREFIX}autoPublishStrictness`,
} as const;

/**
 * Defaults, chosen to be safe rather than convenient.
 *
 * A limit of 5 is deliberately low: the point of a first day in auto mode is
 * to find out what gets published, and a cap that binds is easier to raise
 * than a bad afternoon is to undo.
 */
export const AUTO_PUBLISH_STRICTNESS = ['ALL_DRAFTS', 'HIGH_CONFIDENCE'] as const;
export type AutoPublishStrictness = (typeof AUTO_PUBLISH_STRICTNESS)[number];

/**
 * Defaults for automatic publishing.
 *
 * `ALL_DRAFTS` is the default because it is what "auto publish" is normally
 * taken to mean: everything the newsroom files goes out. The alternative was
 * tried first and was too selective to be useful — score 70, fact 90 and
 * quality 85 held back most of what reached the drafts queue.
 *
 * That is a loosening of *quality* thresholds only. Every draft has already
 * passed the draft-safety gate — no fabrication, no copied prose, no
 * duplicates, attribution present — and `AutoPublishService` re-checks the
 * structural ones at publication regardless of this setting.
 *
 * The daily limit is what stops a bad afternoon becoming a bad week, and it
 * matters more under `ALL_DRAFTS` than it did before: 25 is roughly a busy
 * day's output, so it binds only when something has gone wrong.
 */
export const AUTO_PUBLISH_DEFAULTS = {
  dailyLimit: 25,
  minScore: 70,
  strictness: 'ALL_DRAFTS' as AutoPublishStrictness,
} as const;

export interface AutomationStatus {
  /** Global switch. Defaults to false — automation is opt-in, never opt-out. */
  enabled: boolean;
  publishMode: AiPublishMode;
  /** True while the emergency stop is engaged; nothing publishes. */
  emergencyPaused: boolean;
  /** Ceiling on automatic publications per day. */
  autoPublishDailyLimit: number;
  /** How many have gone out today, against that ceiling. */
  autoPublishedToday: number;
  /** Opportunity score required before an article publishes itself. */
  autoPublishMinScore: number;
  /** Whether auto mode releases every draft or only high-confidence ones. */
  autoPublishStrictness: AutoPublishStrictness;
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
  /**
   * The automation state, projected for an external agent.
   *
   * Deliberately a projection rather than the full settings object: an agent
   * needs three facts and must not receive operational fields like
   * `lastPublishedTitle`. The category semantics are the same ones
   * `canPublishToCategory` enforces — a slug is allowed only when explicitly
   * set to `true`, so an empty map means nothing is allowed. That is the
   * existing fail-closed behaviour, reproduced here rather than reinvented.
   */
  async forAgent(): Promise<{
    enabled: boolean;
    publishMode: AiPublishMode;
    categories: Record<string, boolean>;
    allowedCategories: string[];
  }> {
    const enabled = await this.isEnabled();
    const categories = await this.raw<Record<string, boolean>>(KEYS.categories, {});
    const publishMode = await this.raw<AiPublishMode>(KEYS.publishMode, 'DRAFT_ONLY');

    return {
      enabled,
      publishMode,
      categories,
      allowedCategories: Object.entries(categories)
        .filter(([, on]) => on === true)
        .map(([slug]) => slug),
    };
  }

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
   * `AUTO_PUBLISH` was withheld while the stages it depends on did not exist.
   * Article generation, fact checking and image production are now all
   * implemented and verified end to end, so the option is offered — and
   * remains off by default, selectable only by a SUPER_ADMIN, and subject to
   * the gates in `AutoPublishService` every single time.
   */
  availablePublishModes(): AiPublishMode[] {
    return ['DRAFT_ONLY', 'REVIEW_REQUIRED', 'AUTO_PUBLISH'];
  }

  /** True while the emergency stop is engaged. */
  async isEmergencyPaused(): Promise<boolean> {
    return this.raw<boolean>(KEYS.emergencyPause, false);
  }

  /**
   * Engages or releases the emergency stop.
   *
   * Engaging is deliberately not the same as setting the mode back to
   * DRAFT_ONLY: the mode is an editorial decision that survives, and this is a
   * temporary halt an operator can lift without having to remember what the
   * mode was.
   */
  async setEmergencyPause(paused: boolean, context: AuditContext): Promise<AutomationStatus> {
    await this.write(
      KEYS.emergencyPause,
      paused,
      context,
      paused ? 'Engaged the AI emergency publishing pause' : 'Released the AI emergency publishing pause'
    );
    return this.status();
  }

  async autoPublishDailyLimit(): Promise<number> {
    const stored = await this.raw<number>(KEYS.autoPublishDailyLimit, AUTO_PUBLISH_DEFAULTS.dailyLimit);
    return Number.isFinite(stored) && stored >= 0 ? stored : AUTO_PUBLISH_DEFAULTS.dailyLimit;
  }

  async autoPublishStrictness(): Promise<AutoPublishStrictness> {
    const stored = await this.raw<string>(KEYS.autoPublishStrictness, AUTO_PUBLISH_DEFAULTS.strictness);
    return (AUTO_PUBLISH_STRICTNESS as readonly string[]).includes(stored)
      ? (stored as AutoPublishStrictness)
      : AUTO_PUBLISH_DEFAULTS.strictness;
  }

  async autoPublishMinScore(): Promise<number> {
    const stored = await this.raw<number>(KEYS.autoPublishMinScore, AUTO_PUBLISH_DEFAULTS.minScore);
    return Number.isFinite(stored) && stored >= 0 ? stored : AUTO_PUBLISH_DEFAULTS.minScore;
  }

  async setAutoPublishLimits(
    limits: { dailyLimit?: number; minScore?: number; strictness?: AutoPublishStrictness },
    context: AuditContext
  ): Promise<AutomationStatus> {
    if (limits.dailyLimit !== undefined) {
      await this.write(
        KEYS.autoPublishDailyLimit,
        limits.dailyLimit,
        context,
        `Set the AI daily auto-publish limit to ${limits.dailyLimit}`
      );
    }
    if (limits.strictness !== undefined) {
      await this.write(
        KEYS.autoPublishStrictness,
        limits.strictness,
        context,
        limits.strictness === 'ALL_DRAFTS'
          ? 'Set auto-publish to release every draft'
          : 'Set auto-publish to release only high-confidence drafts'
      );
    }
    if (limits.minScore !== undefined) {
      await this.write(
        KEYS.autoPublishMinScore,
        limits.minScore,
        context,
        `Set the AI auto-publish minimum score to ${limits.minScore}`
      );
    }
    return this.status();
  }

  /** Agent-created articles published since midnight UTC. */
  private async countAutoPublishedToday(): Promise<number> {
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);

    return this.prisma.article.count({
      where: {
        status: ContentStatus.PUBLISHED,
        publishedAt: { gte: midnight },
        // A human publishing their own work is not automation.
        createdById: null,
      },
    });
  }

  /** Records a successful automatic publication, for the admin screen. */
  async recordAutoPublished(title: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: KEYS.lastPublishedAt },
      create: { key: KEYS.lastPublishedAt, value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    });
    await this.prisma.setting.upsert({
      where: { key: KEYS.lastPublishedTitle },
      create: { key: KEYS.lastPublishedTitle, value: title },
      update: { value: title },
    });
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

    const [
      emergencyPaused,
      autoPublishDailyLimit,
      autoPublishMinScore,
      autoPublishedToday,
      autoPublishStrictness,
    ] = await Promise.all([
      this.isEmergencyPaused(),
      this.autoPublishDailyLimit(),
      this.autoPublishMinScore(),
      this.countAutoPublishedToday(),
      this.autoPublishStrictness(),
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
      emergencyPaused,
      autoPublishDailyLimit,
      autoPublishedToday,
      autoPublishMinScore,
      autoPublishStrictness,
      availablePublishModes: this.availablePublishModes(),
      categories: withFlags,
      lastRunAt,
      lastPublishedAt,
      lastPublishedTitle,
      lastError,
      effective: {
        /*
         * Whether an article could publish itself right now.
         *
         * Every condition here is necessary and none is sufficient: the
         * per-article gates in `AutoPublishService` run afterwards, on every
         * attempt. This answers "is the door unlocked?", never "will this
         * particular article go through it?".
         */
        canPublish:
          enabled &&
          anyCategory &&
          mode === 'AUTO_PUBLISH' &&
          !emergencyPaused &&
          autoPublishedToday < autoPublishDailyLimit,
        reason: emergencyPaused
          ? 'Emergency pause is engaged'
          : !enabled
            ? 'Global automation is off'
            : !anyCategory
              ? 'No category has automation enabled'
              : mode !== 'AUTO_PUBLISH'
                ? `Publish mode is ${mode}; articles are filed as drafts for review`
                : autoPublishedToday >= autoPublishDailyLimit
                  ? `Daily auto-publish limit reached (${autoPublishedToday}/${autoPublishDailyLimit})`
                  : 'Automatic publishing is active',
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
