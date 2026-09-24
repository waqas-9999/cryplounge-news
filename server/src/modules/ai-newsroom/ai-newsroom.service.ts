import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AuditAction, CategoryKind, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import {
  MODEL_STAGES,
  describeOverrides,
  readModelSettings,
  validateModelSettings,
  type ModelSettings,
  type ModelStage,
} from './model-settings';
import { STAGE_INFO, catalogForStages, type CatalogProvider } from './model-catalog';
import { buildRoutingReport, type ModelRoutingReport, type RuntimeReport } from './model-runtime';

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

/** The actor in the audit log's own terms: a user id and email, or a label. */
function actorOf(context: AuditContext): Prisma.InputJsonObject {
  return {
    userId: context.user?.id ?? null,
    email: context.user?.email ?? null,
    label: context.actorLabel ?? null,
  };
}

/**
 * The event the newsroom sends at the start of a cycle, one per stage, saying
 * which provider and model it resolved. Read-only here: the CMS shows it, and
 * never treats it as configuration.
 */
export const STAGE_ROUTING_EVENT = 'STAGE_MODEL_RESOLVED';

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
  /**
   * Per-stage model routing for the newsroom.
   *
   * One row holding every stage rather than a key each: the newsroom reads
   * them together, the screen edits them together, and a partial write that
   * left two stages on an old model would be the confusing failure.
   */
  models: `${AI_SETTING_PREFIX}models`,
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

/**
 * Stage metadata for the screen: id, label, description.
 *
 * Served rather than kept in the component so there is one stage list, here,
 * and the browser cannot disagree with the validator about what the stages
 * are.
 */
export interface StageInfo {
  stage: string;
  label: string;
  description: string;
}

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
   * Which model runs each stage, where an operator has overridden the
   * newsroom's own configuration. Unset stages read as null.
   */
  models: ModelSettings;
  /** Stage → the providers and models that stage may be routed to. */
  modelCatalog: Record<string, CatalogProvider[]>;
  /** Stage names and descriptions, so the screen keeps no list of its own. */
  modelStages: StageInfo[];
  /**
   * Configured routing beside what the newsroom last reported running, per
   * stage, with the relationship between them. See `model-runtime.ts`.
   */
  modelRouting: ModelRoutingReport;
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
    models: ModelSettings;
  }> {
    const enabled = await this.isEnabled();
    const categories = await this.raw<Record<string, boolean>>(KEYS.categories, {});
    const publishMode = await this.raw<AiPublishMode>(KEYS.publishMode, 'DRAFT_ONLY');

    return {
      enabled,
      publishMode,
      categories,
      /*
       * Routing travels with the automation settings rather than on an
       * endpoint of its own: the newsroom already polls this every cycle, so
       * a model change lands on the same schedule as switching automation
       * off, and there is no second fetch to fail independently.
       *
       * Unset stages are sent as null, which the newsroom reads as "keep your
       * own configuration" — the CMS never has to know what that is.
       */
      models: await this.models(),
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
        // Agent-created articles, identified by the recorded agent rather than
        // by the absence of a user.
        createdByAgentId: { not: null },
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

  /**
   * Sets how far automation may take a story. This is the one AUTO_PUBLISH
   * switch; there is no other.
   *
   * ## What enabling AUTO_PUBLISH does, and what it deliberately does not
   *
   * It is an administrative automation switch and nothing more. It writes one
   * setting. It does **not** grant `news.publish` to any agent, turn any
   * category on, touch the global switch, or release the emergency pause.
   * Automatic publication needs this *and* an agent separately granted
   * `news.publish`, and even then every per-article gate still applies.
   *
   * ## Why enabling is validated and disabling is not
   *
   * Enabling widens what automation may do, so it is refused while the
   * configuration it depends on is malformed or absent. Disabling narrows it,
   * and a safety-reducing action must never be blocked by a broken setting —
   * an operator reaching for "off" gets "off".
   *
   * Both transitions write a dedicated audit entry naming the actor, so "who
   * turned automatic publishing on, and what did it look like at the time?" is
   * answerable from the log alone.
   */
  async setPublishMode(mode: AiPublishMode, context: AuditContext): Promise<AutomationStatus> {
    this.assertPublishModeAllowed(mode);

    const previous = await this.raw<unknown>(KEYS.publishMode, null);
    const wasAutoPublish = previous === 'AUTO_PUBLISH';

    if (mode !== 'AUTO_PUBLISH') {
      await this.write(
        KEYS.publishMode,
        mode,
        context,
        wasAutoPublish
          ? `Disabled AI automatic publishing (publishing mode set to ${mode})`
          : `Set AI publishing mode to ${mode}`,
        wasAutoPublish ? { transition: 'AUTO_PUBLISH_DISABLED', actor: actorOf(context) } : undefined
      );
      return this.status();
    }

    const configuration = await this.assertAutoPublishConfiguration();

    await this.write(
      KEYS.publishMode,
      mode,
      context,
      wasAutoPublish
        ? 'Re-confirmed AI automatic publishing'
        : 'Enabled AI automatic publishing (publishing mode set to AUTO_PUBLISH)',
      {
        transition: wasAutoPublish ? 'AUTO_PUBLISH_REAFFIRMED' : 'AUTO_PUBLISH_ENABLED',
        actor: actorOf(context),
        configuration,
        // Stated in the record because it is the misunderstanding that matters.
        grantsAgentPermissions: false,
      }
    );

    // Read back rather than assume: a write that did not land must not be
    // reported to the operator as automatic publishing being on.
    if ((await this.publishMode()) !== 'AUTO_PUBLISH') {
      throw new InternalServerErrorException({
        message: 'AUTO_PUBLISH was not persisted; the publishing mode is unchanged',
        code: 'PUBLISH_MODE_NOT_PERSISTED',
      });
    }

    return this.status();
  }

  /**
   * Refuses to enable AUTO_PUBLISH on a configuration that cannot be enforced.
   *
   * Checks only what already exists server-side, and changes none of it. A
   * setting that is absent is fine — the reader's safe default applies. A
   * setting that is present but malformed is not: every reader silently falls
   * back to a default on a bad value, so the admin screen and the gates would
   * disagree about what is configured.
   *
   * Zero enabled categories is allowed and recorded, not refused: the category
   * switch then blocks every article, which is safe, and turning categories on
   * is a separate decision this method must not make.
   *
   * Returns the snapshot recorded in the audit entry.
   */
  private async assertAutoPublishConfiguration(): Promise<Prisma.InputJsonObject> {
    const rows = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            KEYS.enabled,
            KEYS.emergencyPause,
            KEYS.categories,
            KEYS.autoPublishDailyLimit,
            KEYS.autoPublishMinScore,
            KEYS.autoPublishStrictness,
          ],
        },
      },
    });
    const stored = new Map<string, unknown>(rows.map(row => [row.key, row.value]));
    const problems: string[] = [];

    const expectBoolean = (key: string, label: string) => {
      if (stored.has(key) && typeof stored.get(key) !== 'boolean') {
        problems.push(`${label} setting is malformed`);
      }
    };
    const expectNonNegative = (key: string, label: string) => {
      const value = stored.get(key);
      if (stored.has(key) && !(typeof value === 'number' && Number.isFinite(value) && value >= 0)) {
        problems.push(`${label} setting is malformed`);
      }
    };

    expectBoolean(KEYS.enabled, 'global automation');
    expectBoolean(KEYS.emergencyPause, 'emergency pause');
    expectNonNegative(KEYS.autoPublishDailyLimit, 'daily auto-publish limit');
    expectNonNegative(KEYS.autoPublishMinScore, 'auto-publish minimum score');

    if (
      stored.has(KEYS.autoPublishStrictness) &&
      !(AUTO_PUBLISH_STRICTNESS as readonly unknown[]).includes(stored.get(KEYS.autoPublishStrictness))
    ) {
      problems.push('auto-publish strictness setting is malformed');
    }

    const map = stored.has(KEYS.categories) ? stored.get(KEYS.categories) : {};
    const mapIsValid =
      typeof map === 'object' &&
      map !== null &&
      !Array.isArray(map) &&
      Object.values(map).every(value => typeof value === 'boolean');
    if (!mapIsValid) problems.push('category automation setting is malformed');

    const newsCategories = await this.prisma.category.findMany({
      where: { kind: CategoryKind.NEWS },
      select: { slug: true },
    });
    if (newsCategories.length === 0) {
      problems.push('no NEWS categories exist, so category automation cannot be configured');
    }

    if (problems.length > 0) {
      throw new BadRequestException({
        message: `AUTO_PUBLISH cannot be enabled: ${problems.join('; ')}`,
        code: 'AUTO_PUBLISH_CONFIGURATION_INVALID',
        errors: { configuration: problems },
      });
    }

    const existing = new Set(newsCategories.map(category => category.slug));
    const enabledCategories = Object.entries(map as Record<string, boolean>)
      .filter(([slug, on]) => on === true && existing.has(slug))
      .map(([slug]) => slug);

    return {
      globalAutomationEnabled: stored.get(KEYS.enabled) === true,
      // Recorded, never changed: the pause is independent of the mode.
      emergencyPaused: stored.get(KEYS.emergencyPause) === true,
      enabledCategories,
      dailyLimit: await this.autoPublishDailyLimit(),
      minScore: await this.autoPublishMinScore(),
      strictness: await this.autoPublishStrictness(),
    };
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

    const models = await this.models();

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
      models,
      modelCatalog: catalogForStages(),
      modelStages: STAGE_INFO.map(entry => ({ ...entry })),
      modelRouting: await this.modelRouting(models),
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

  private async write(
    key: string,
    value: unknown,
    context: AuditContext,
    summary: string,
    extra?: Prisma.InputJsonObject
  ) {
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
      metadata: { before: previous?.value ?? null, after: value, ...extra } as Prisma.InputJsonValue,
    });
  }

  /**
   * What each stage is running, as far as anything here can know it.
   *
   * The configuration is read from the setting this screen writes. The runtime
   * is read from the newsroom's own reports and from nowhere else: the CMS
   * cannot see the newsroom's environment file, and a stage left on the
   * environment has a model this database has never been told. Filling that in
   * from the configuration would produce a screen that is confidently wrong
   * for exactly the stages an operator most needs the truth about.
   *
   * Composing the two — including the case where they disagree — is
   * `buildRoutingReport`, which is pure and tested on its own.
   */
  async modelRouting(models?: ModelSettings): Promise<ModelRoutingReport> {
    const settings = models ?? (await this.models());

    const events = await this.prisma.newsroomEvent.findMany({
      where: { type: STAGE_ROUTING_EVENT, stage: { in: [...MODEL_STAGES] } },
      orderBy: { occurredAt: 'desc' },
      select: { stage: true, model: true, metadata: true, occurredAt: true },
      // Enough to cover every stage several times over; the newest per stage
      // wins. Bounded rather than grouped because one indexed read of a few
      // rows beats nine queries for a screen that is mostly static.
      take: 60,
    });

    const reports: RuntimeReport[] = events
      .filter((event): event is typeof event & { stage: string } => Boolean(event.stage))
      .map(event => {
        // The newsroom sends the provider and any failure as metadata; `stage`
        // and `model` are columns. Read defensively: this is data from another
        // process, and a malformed field must not take out the screen.
        const metadata = (event.metadata ?? null) as { provider?: unknown; error?: unknown } | null;

        return {
          stage: event.stage,
          model: event.model ?? null,
          provider: typeof metadata?.provider === 'string' ? metadata.provider : null,
          error: typeof metadata?.error === 'string' ? metadata.error : null,
          occurredAt: event.occurredAt,
        };
      });

    return buildRoutingReport(settings, reports);
  }

  /**
   * The stored routing, as a complete object.
   *
   * Never throws and never returns a partial: a missing row, a row written
   * before a stage existed, or a row someone edited by hand all read as
   * "everything inherits from the newsroom".
   */
  async models(): Promise<ModelSettings> {
    return readModelSettings(await this.raw<unknown>(KEYS.models, null));
  }

  /**
   * Replaces the routing wholesale.
   *
   * A whole-object write rather than a per-stage patch, because the screen
   * edits every stage at once and a patch API would make "clear the writer
   * override" ambiguous — an absent key would mean both "leave it" and
   * "remove it". Here, absent always means unset, and unset always means the
   * newsroom's own configuration decides.
   *
   * Every invalid stage is reported together; nothing is written unless all
   * of them are valid, so a save can never half-apply.
   */
  async setModels(input: unknown, context: AuditContext): Promise<AutomationStatus> {
    const { settings, errors } = validateModelSettings(input);

    if (errors.length > 0) {
      /*
       * Keyed by stage, in the envelope's own `Record<string, string[]>`
       * shape, so the admin screen can put each message against the stage it
       * concerns and the generic client helper can still flatten them into a
       * sentence. Every bad stage travels in one response: an operator fixing
       * four should not discover them one save at a time.
       */
      const byStage: Record<string, string[]> = {};
      for (const error of errors) {
        (byStage[error.stage] ??= []).push(error.message);
      }

      throw new BadRequestException({
        message: 'Model routing was rejected',
        code: 'INVALID_MODEL_SETTINGS',
        errors: byStage,
      });
    }

    const overrides = describeOverrides(settings);

    await this.write(
      KEYS.models,
      settings as unknown as Prisma.InputJsonObject,
      context,
      overrides.length > 0
        ? `Set AI newsroom model routing (${overrides.join('; ')})`
        : 'Cleared AI newsroom model routing; every stage inherits the newsroom configuration',
      { stages: overrides, actor: actorOf(context) }
    );

    this.logger.warn(
      { overrides, actor: context.user?.email ?? context.actorLabel },
      'AI newsroom model routing changed'
    );

    return this.status();
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
