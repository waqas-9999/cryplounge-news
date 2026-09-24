import { findModel, kindOf, stageLabel, type Pricing } from './model-catalog';
import type { ModelSettings } from './model-settings';
import { MODEL_STAGES, type ModelStage } from './model-stages';

/**
 * What the newsroom is actually running, next to what this dashboard asked it
 * to run.
 *
 * These are two different facts and the screen must not blur them. The
 * configuration is an instruction; the runtime is an observation, reported by
 * the newsroom itself at the start of each cycle. A newsroom that has not run
 * since a change was saved is still running the old model, and saying
 * otherwise would make this screen worse than useless — it would make it
 * confidently wrong.
 *
 * So every field here is one of:
 *
 *  - **configured** — read from the setting this screen writes;
 *  - **runtime** — read from the newsroom's own report, never inferred;
 *  - **status** — the relationship between them, including the case where
 *    they disagree.
 *
 * Nothing is filled in from the other side. A stage with no report says so.
 */

/** A provider and model, named as the catalogue names them. */
export interface NamedModel {
  providerId: string | null;
  providerName: string | null;
  modelId: string | null;
  modelName: string | null;
  pricing: Pricing | null;
  /** True when the catalogue does not list this pair — an older or withdrawn model. */
  unknown: boolean;
}

export type RuntimeStatus =
  /** The newsroom reported running the model this dashboard set. */
  | 'ROUTED'
  /** The newsroom reported a model that came from its own environment. */
  | 'ENVIRONMENT_DEFAULT'
  /** No report has arrived for this stage. */
  | 'NOT_REPORTED'
  /** The newsroom reported that it could not build this stage's provider. */
  | 'UNAVAILABLE'
  /** A report arrived, but it does not match what this dashboard configured. */
  | 'MISMATCH';

export interface StageRuntime {
  stage: ModelStage;
  label: string;
  /** Image generation does not go through the text router; the screen says so. */
  kind: 'text' | 'image';
  /** What this dashboard has set. Every field null means "newsroom default". */
  configured: NamedModel;
  /** What the newsroom last reported. Every field null means it has not reported. */
  runtime: NamedModel;
  status: RuntimeStatus;
  /** Present when the newsroom reported a failure for this stage. */
  error: string | null;
  reportedAt: string | null;
}

export type RuntimeHealth = 'ACTIVE' | 'STALE' | 'WAITING';

export interface ModelRoutingReport {
  health: RuntimeHealth;
  /** The newest report across all stages. */
  lastReportedAt: string | null;
  /** After this long with no report, the view is treated as stale rather than current. */
  staleAfterMinutes: number;
  stages: StageRuntime[];
}

/**
 * How long a report stays current.
 *
 * The newsroom cycles on `NEWS_POLL_INTERVAL_SECONDS`, which is ten minutes in
 * this deployment, and reports once per cycle. A ten-minute threshold would
 * therefore flip to "stale" whenever a cycle ran long, which trains an
 * operator to ignore the indicator. Three cycles is late enough to mean
 * something.
 *
 * Stale means "this view may be out of date", never "the newsroom is down".
 * Nothing here has the evidence for the second claim: a newsroom can be
 * healthy and between cycles, or reporting fine while its telemetry is
 * blocked.
 */
export const STALE_AFTER_MINUTES = 30;

/** An event as the reader hands it over: the newsroom's own words. */
export interface RuntimeReport {
  stage: string;
  model: string | null;
  provider: string | null;
  error: string | null;
  /**
   * Which of the two the newsroom says it used.
   *
   * Reported rather than inferred. Only the newsroom knows whether it read the
   * dashboard's override or fell back to its environment at the moment it
   * resolved, and the two can legitimately disagree with the current setting —
   * that is the window between a save and the next refresh, which this screen
   * exists to make visible. Older newsroom builds send `cms` / `environment`;
   * both spellings are accepted.
   */
  reportedSource: 'ADMIN_OVERRIDE' | 'ENVIRONMENT_DEFAULT' | null;
  occurredAt: Date;
}

/** Normalises the source field across newsroom versions. */
export function readReportedSource(value: unknown): RuntimeReport['reportedSource'] {
  if (value === 'ADMIN_OVERRIDE' || value === 'cms') return 'ADMIN_OVERRIDE';
  if (value === 'ENVIRONMENT_DEFAULT' || value === 'environment') return 'ENVIRONMENT_DEFAULT';
  return null;
}

const EMPTY: NamedModel = {
  providerId: null,
  providerName: null,
  modelId: null,
  modelName: null,
  pricing: null,
  unknown: false,
};

/**
 * Names a provider/model pair through the catalogue.
 *
 * A pair the catalogue does not list is passed through with its raw ids and
 * `unknown: true` rather than dropped. The newsroom can legitimately be
 * running a model set in its environment that was never in the catalogue, and
 * "we do not recognise this" is useful; hiding it would leave the stage
 * looking unreported when it is running perfectly well.
 */
export function nameModel(stage: ModelStage, providerId: string | null, modelId: string | null): NamedModel {
  if (!providerId && !modelId) return EMPTY;

  const found = modelId ? findModel(stage, providerId, modelId) : undefined;

  return {
    providerId,
    providerName: found?.provider.name ?? providerId,
    modelId,
    modelName: found?.model.name ?? modelId,
    pricing: found?.model.pricing ?? null,
    unknown: Boolean(modelId) && !found,
  };
}

/** Whether two pairs describe the same routing, comparing ids rather than names. */
function sameModel(configured: NamedModel, runtime: NamedModel): boolean {
  // A configured provider with no model means "this provider, its usual
  // model", so only the provider is compared in that case.
  const providerMatches = !configured.providerId || configured.providerId === runtime.providerId;
  const modelMatches = !configured.modelId || configured.modelId === runtime.modelId;
  return providerMatches && modelMatches;
}

/**
 * Works out where a stage stands.
 *
 * The order matters. A reported failure beats everything — a stage whose
 * provider could not be built is not "routed" whatever the settings say. Then
 * the absence of a report, which is not evidence of anything. Only with a
 * successful report in hand is it worth comparing the two.
 */
function statusOf(
  configured: NamedModel,
  runtime: NamedModel,
  error: string | null,
  reportedSource: RuntimeReport['reportedSource']
): RuntimeStatus {
  if (error) return 'UNAVAILABLE';
  if (!runtime.modelId && !runtime.providerId) return 'NOT_REPORTED';

  const overridden = Boolean(configured.providerId || configured.modelId);

  if (!overridden) {
    /*
     * No override is set now. If the newsroom's last run still used one, the
     * override was removed after that run and the newsroom has not refreshed
     * yet — a real, temporary disagreement, and exactly the thing an operator
     * needs to see rather than have smoothed over.
     */
    return reportedSource === 'ADMIN_OVERRIDE' ? 'MISMATCH' : 'ENVIRONMENT_DEFAULT';
  }

  return sameModel(configured, runtime) ? 'ROUTED' : 'MISMATCH';
}

/**
 * Builds the whole report from the settings and whatever the newsroom has said.
 *
 * Pure, so the rules above are testable without a database, and so the two
 * endpoints that serve this cannot drift apart.
 */
export function buildRoutingReport(
  models: ModelSettings,
  reports: RuntimeReport[],
  now: Date = new Date()
): ModelRoutingReport {
  const latest = new Map<string, RuntimeReport>();
  for (const report of reports) {
    const existing = latest.get(report.stage);
    if (!existing || existing.occurredAt < report.occurredAt) latest.set(report.stage, report);
  }

  const stages: StageRuntime[] = MODEL_STAGES.map(stage => {
    const override = models[stage] ?? { provider: null, model: null };
    const report = latest.get(stage);

    const configured = nameModel(stage, override.provider, override.model);
    const runtime = report ? nameModel(stage, report.provider, report.model) : EMPTY;

    return {
      stage,
      label: stageLabel(stage),
      kind: kindOf(stage),
      configured,
      runtime,
      status: statusOf(configured, runtime, report?.error ?? null, report?.reportedSource ?? null),
      error: report?.error ?? null,
      reportedAt: report?.occurredAt.toISOString() ?? null,
    };
  });

  const timestamps = stages
    .map(stage => stage.reportedAt)
    .filter((value): value is string => Boolean(value))
    .sort();
  const lastReportedAt = timestamps.at(-1) ?? null;

  const ageMinutes = lastReportedAt ? (now.getTime() - new Date(lastReportedAt).getTime()) / 60_000 : null;

  return {
    health: ageMinutes === null ? 'WAITING' : ageMinutes > STALE_AFTER_MINUTES ? 'STALE' : 'ACTIVE',
    lastReportedAt,
    staleAfterMinutes: STALE_AFTER_MINUTES,
    stages,
  };
}
