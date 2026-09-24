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
 * Providers the newsroom's factory can build for a text stage.
 *
 * `mock` is deliberately absent. The newsroom supports it for tests, and it
 * returns invented text — offering it on an admin screen that controls a live
 * newsroom is a way to publish fiction by misclick.
 */
export const TEXT_PROVIDERS = [
  'anthropic',
  'openai',
  'openai-compatible',
  'local',
  'google-gemini',
  'nvidia',
] as const;

/** Providers that generate images. A separate list; they share no implementation. */
export const IMAGE_PROVIDERS = ['gemini', 'openai', 'nvidia'] as const;

export function providersFor(stage: ModelStage): readonly string[] {
  return stage === 'image' ? IMAGE_PROVIDERS : TEXT_PROVIDERS;
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
      if (trimmed.length > MODEL_ID_MAX) {
        errors.push({ stage, message: `Model id is longer than ${MODEL_ID_MAX} characters` });
      } else if (!MODEL_ID.test(trimmed)) {
        errors.push({ stage, message: `"${trimmed}" is not a valid model id` });
      } else {
        entry.model = trimmed;
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
