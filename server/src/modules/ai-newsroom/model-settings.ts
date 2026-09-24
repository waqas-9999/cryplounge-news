/**
 * Which model runs each newsroom stage, decided here rather than in the
 * newsroom's environment file.
 *
 * Before this, changing the writer model meant editing `.env` on the VPS and
 * restarting the loop — so in practice the model was whatever it was on the
 * day someone last had a shell open, and nobody could see it from the
 * dashboard. These settings are read by the newsroom over the agent endpoint
 * it already polls, so a change lands within a cycle with no deploy.
 *
 * ## What a stage setting is, and is not
 *
 * Each stage holds an optional provider and an optional model. **Unset means
 * "use the newsroom's own configuration"** — the setting is an override, never
 * a replacement. That matters for two reasons: an empty settings row must not
 * blank out a working newsroom, and an operator must be able to hand a stage
 * back to the environment without knowing what the environment says.
 *
 * Nothing here can grant an agent a permission, publish anything, or widen
 * what automation may do. The worst a bad value can do is fail that stage's
 * calls, loudly, which the newsroom already reports.
 */

// eslint-disable-next-line @typescript-eslint/no-use-before-define -- the
// catalogue imports MODEL_STAGES from this file; the cycle is types and
// module-level arrays only, both resolved before either is called.
import { MODEL_CATALOG, findModel, providerIdsForStage } from './model-catalog';

/** A stage that makes model calls, named for the pipeline rather than the model. */
export const MODEL_STAGES = [
  'discovery',
  'scoring',
  'research',
  'writer',
  'editor',
  'factcheck',
  'quality',
  'imagePrompt',
  'image',
] as const;

export type ModelStage = (typeof MODEL_STAGES)[number];

/**
 * Providers, derived from the catalogue rather than repeated here.
 *
 * These existed as hand-written lists before the catalogue did, and a list of
 * providers that a list of models does not agree with is the bug this avoids:
 * one file now decides both.
 *
 * `mock` is absent from the catalogue and so from here. The newsroom supports
 * it for tests and it returns invented text — offering it on a screen that
 * controls a live newsroom is a way to publish fiction by misclick.
 */
export const TEXT_PROVIDERS: readonly string[] = [
  ...new Set(MODEL_CATALOG.filter(provider => provider.kind === 'text').map(provider => provider.id)),
];

export const IMAGE_PROVIDERS: readonly string[] = [
  ...new Set(MODEL_CATALOG.filter(provider => provider.kind === 'image').map(provider => provider.id)),
];

export function providersFor(stage: ModelStage): readonly string[] {
  return providerIdsForStage(stage);
}

export interface StageModel {
  /** Unset leaves the stage on the newsroom's configured provider. */
  provider: string | null;
  /** Unset leaves the stage on the newsroom's configured model. */
  model: string | null;
}

export type ModelSettings = Record<ModelStage, StageModel>;

/** Everything unset: the newsroom's own configuration decides, as it did before. */
export function emptyModelSettings(): ModelSettings {
  return Object.fromEntries(MODEL_STAGES.map(stage => [stage, { provider: null, model: null }])) as ModelSettings;
}

/**
 * A model id, as loosely as can still be checked.
 *
 * Providers name models however they like — `claude-opus-5`,
 * `gemini-2.5-flash-image`, `nvidia/nemotron-3-super-120b-a12b`,
 * `upstage/solar-pro4:free` — so this only rejects what could not be an id in
 * any catalogue: whitespace, quotes, and anything that would not survive being
 * put in a URL path or a JSON body.
 */
const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:\/-]*$/;
export const MODEL_ID_MAX = 120;

export interface ModelValidationError {
  stage: string;
  message: string;
}

/**
 * Normalises and checks one submitted settings object.
 *
 * Returns the value to store *and* the problems found, rather than throwing,
 * so the caller can report every bad field at once — an operator fixing four
 * stages should not discover them one save at a time.
 *
 * Unknown stages are an error rather than being dropped: a typo that is
 * silently ignored looks exactly like a setting that did not take effect.
 */
export function validateModelSettings(input: unknown): {
  settings: ModelSettings;
  errors: ModelValidationError[];
} {
  const settings = emptyModelSettings();
  const errors: ModelValidationError[] = [];

  if (input === null || typeof input !== 'object') {
    return { settings, errors: [{ stage: '(root)', message: 'Expected an object of stage settings' }] };
  }

  const known = new Set<string>(MODEL_STAGES);

  for (const [stage, value] of Object.entries(input as Record<string, unknown>)) {
    if (!known.has(stage)) {
      errors.push({ stage, message: `Unknown stage. Expected one of: ${MODEL_STAGES.join(', ')}` });
      continue;
    }
    if (value === null || typeof value !== 'object') {
      errors.push({ stage, message: 'Expected { provider, model }' });
      continue;
    }

    const { provider, model } = value as { provider?: unknown; model?: unknown };
    const entry: StageModel = { provider: null, model: null };

    if (provider !== undefined && provider !== null && provider !== '') {
      if (typeof provider !== 'string') {
        errors.push({ stage, message: 'provider must be a string' });
      } else if (!providersFor(stage as ModelStage).includes(provider)) {
        errors.push({
          stage,
          message: `"${provider}" is not a provider for this stage. Expected one of: ${providersFor(stage as ModelStage).join(', ')}`,
        });
      } else {
        entry.provider = provider;
      }
    }

    if (model !== undefined && model !== null && String(model).trim() !== '') {
      const trimmed = String(model).trim();
      const found = findModel(stage as ModelStage, entry.provider, trimmed);

      if (trimmed.length > MODEL_ID_MAX) {
        errors.push({ stage, message: `Model id is longer than ${MODEL_ID_MAX} characters` });
      } else if (!MODEL_ID.test(trimmed)) {
        errors.push({ stage, message: `"${trimmed}" is not a valid model id` });
      } else if (!found) {
        /*
         * The model has to be one the chosen provider actually serves.
         *
         * Checked here rather than left to the dropdown, because the dropdown
         * is a convenience and this is the boundary: a request built by hand
         * could otherwise route the writer to a model that does not exist,
         * and the failure would surface hours later as a stage that fails
         * every call.
         *
         * Two distinct mistakes, reported differently, because the fix is
         * different: a model nobody serves is a typo, while a model served by
         * another provider is a mismatched pair.
         */
        const elsewhere = findModel(stage as ModelStage, null, trimmed);
        errors.push({
          stage,
          message: elsewhere
            ? `"${trimmed}" belongs to ${elsewhere.provider.name}, not ${entry.provider}`
            : `"${trimmed}" is not a model this stage can use`,
        });
      } else {
        entry.model = trimmed;
        // A model chosen without naming a provider settles the provider too:
        // storing the pair means the newsroom never has to guess which
        // endpoint serves it.
        entry.provider ??= found.provider.id;
      }
    }

    settings[stage as ModelStage] = entry;
  }

  return { settings, errors };
}

/**
 * Reads a stored value back into a complete settings object.
 *
 * Tolerant where `validateModelSettings` is strict: whatever is in the row was
 * valid when it was written, and a stage added to the code after it was
 * written must read as unset rather than breaking the screen.
 */
export function readModelSettings(stored: unknown): ModelSettings {
  const settings = emptyModelSettings();
  if (stored === null || typeof stored !== 'object') return settings;

  for (const stage of MODEL_STAGES) {
    const value = (stored as Record<string, unknown>)[stage];
    if (value === null || typeof value !== 'object') continue;
    const { provider, model } = value as { provider?: unknown; model?: unknown };
    settings[stage] = {
      provider: typeof provider === 'string' && provider !== '' ? provider : null,
      model: typeof model === 'string' && model !== '' ? model : null,
    };
  }

  return settings;
}

/** Stages an operator has actually overridden, for the audit summary. */
export function describeOverrides(settings: ModelSettings): string[] {
  return MODEL_STAGES.filter(stage => settings[stage].provider || settings[stage].model).map(stage => {
    const { provider, model } = settings[stage];
    return `${stage}: ${[provider, model].filter(Boolean).join(' / ')}`;
  });
}
