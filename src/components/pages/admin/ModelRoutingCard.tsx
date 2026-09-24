'use client';

/**
 * Admin → AI Automation → Models.
 *
 * Which model writes the articles, and which one draws the images. Before
 * this, both lived in an environment file on the newsroom server, so changing
 * the writer model meant a shell, an edit and a restart — and nobody looking
 * at the dashboard could tell what was running.
 *
 * Three decisions shape the screen:
 *
 *  1. **Blank means "leave it to the newsroom".** Every field is an override,
 *     so an operator can hand a stage back without knowing what the newsroom
 *     is configured to use. The placeholder says so rather than inventing a
 *     value to display.
 *  2. **Nothing saves on change.** Routing is edited a few fields at a time —
 *     a provider and a model belong together, and saving between the two would
 *     send a model to a provider that does not serve it.
 *  3. **The stages are named for the pipeline, not the models**, and are
 *     listed in the order a story passes through them, because that is the
 *     order an operator thinks in when deciding where to spend.
 */

import { useEffect, useMemo, useState } from 'react';
import { Cpu, Loader2, RotateCcw } from 'lucide-react';
import { Card } from '@/components/admin/analytics/primitives';

export interface StageModel {
  provider: string | null;
  model: string | null;
}

export type ModelSettings = Record<string, StageModel>;

interface ModelRoutingCardProps {
  models: ModelSettings;
  /** Stage → providers that stage may use, from the server. */
  providers: Record<string, readonly string[]>;
  readOnly: boolean;
  saving: boolean;
  onSave: (models: ModelSettings) => Promise<void> | void;
}

/**
 * The stages, in pipeline order, with what each one actually does.
 *
 * The descriptions exist because "quality" and "editor" are not
 * self-explanatory, and an operator choosing where to spend money needs to
 * know which stage runs once per article and which runs once per candidate
 * story — the difference is roughly a hundredfold in calls.
 */
const STAGES: Array<{ key: string; label: string; description: string }> = [
  {
    key: 'discovery',
    label: 'Discovery',
    description: 'Reads every incoming headline to decide what is a story. Runs hundreds of times a cycle — keep it cheap.',
  },
  {
    key: 'scoring',
    label: 'Scoring',
    description: 'Ranks the candidate stories. Also runs on everything discovered.',
  },
  {
    key: 'research',
    label: 'Research',
    description: 'Reads the sources and builds the dossier of established facts. Everything written later comes from this.',
  },
  {
    key: 'writer',
    label: 'Writer',
    description: 'Writes the article from the research. The model whose voice readers actually see.',
  },
  {
    key: 'editor',
    label: 'Editor',
    description: 'Reviews the draft for accuracy and craft. Worth a different model from the writer — a second opinion from the same model is not one.',
  },
  {
    key: 'factcheck',
    label: 'Fact check',
    description: 'Checks each statement against the research. The gate most drafts fail.',
  },
  {
    key: 'quality',
    label: 'Quality',
    description: 'Scores readability, structure and SEO.',
  },
  {
    key: 'imagePrompt',
    label: 'Image prompt',
    description: 'Writes the description the image model draws from. A text model, not an image one.',
  },
  {
    key: 'image',
    label: 'Image generation',
    description: 'Draws the article image itself.',
  },
];

/**
 * Model ids offered as suggestions, by provider.
 *
 * A datalist rather than a dropdown on purpose: providers add models faster
 * than this list can be maintained, and a closed list would make a new model
 * unreachable until someone shipped a CMS change. Anything valid can be typed.
 */
const SUGGESTIONS: Record<string, string[]> = {
  anthropic: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5-20251001'],
  'google-gemini': ['gemini-flash-latest', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  nvidia: ['nvidia/nemotron-3-super-120b-a12b'],
  'openai-compatible': ['upstage/solar-pro4:free'],
  local: ['upstage/solar-pro4:free'],
  gemini: ['gemini-2.5-flash-image'],
};

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  'openai-compatible': 'OpenAI-compatible endpoint',
  local: 'Local endpoint',
  'google-gemini': 'Google Gemini',
  nvidia: 'NVIDIA',
  gemini: 'Google Gemini',
};

function normalise(models: ModelSettings): ModelSettings {
  return Object.fromEntries(
    STAGES.map(stage => [
      stage.key,
      {
        provider: models[stage.key]?.provider ?? null,
        model: models[stage.key]?.model ?? null,
      },
    ])
  );
}

export function ModelRoutingCard({ models, providers, readOnly, saving, onSave }: ModelRoutingCardProps) {
  const [draft, setDraft] = useState<ModelSettings>(() => normalise(models));

  // A save reloads the status, which arrives as new props. Adopting them
  // discards nothing: the draft that produced them is what came back.
  useEffect(() => {
    setDraft(normalise(models));
  }, [models]);

  const saved = useMemo(() => normalise(models), [models]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const overridden = STAGES.filter(stage => draft[stage.key]?.provider || draft[stage.key]?.model).length;

  function update(stage: string, patch: Partial<StageModel>) {
    setDraft(current => ({ ...current, [stage]: { ...current[stage]!, ...patch } }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm text-gray-900 dark:text-gray-100">Models</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Which model runs each stage of the newsroom. Leave a field blank to keep whatever the
            newsroom itself is configured with. Changes take effect on its next cycle — no deploy or
            restart.
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
        {STAGES.map(stage => {
          const entry = draft[stage.key] ?? { provider: null, model: null };
          const options = providers[stage.key] ?? [];
          const suggestions = SUGGESTIONS[entry.provider ?? ''] ?? [];

          return (
            <div key={stage.key} className="py-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4 items-start">
              <div className="min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200">{stage.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stage.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:w-[26rem]">
                <select
                  aria-label={`${stage.label} provider`}
                  value={entry.provider ?? ''}
                  disabled={readOnly || saving}
                  onChange={event => update(stage.key, { provider: event.target.value || null })}
                  className="flex-1 min-w-0 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2 py-1.5 disabled:opacity-60"
                >
                  <option value="">Newsroom default</option>
                  {options.map(option => (
                    <option key={option} value={option}>
                      {PROVIDER_LABELS[option] ?? option}
                    </option>
                  ))}
                </select>

                <input
                  aria-label={`${stage.label} model`}
                  list={`models-${stage.key}`}
                  value={entry.model ?? ''}
                  disabled={readOnly || saving}
                  placeholder="Newsroom default"
                  spellCheck={false}
                  onChange={event => update(stage.key, { model: event.target.value || null })}
                  className="flex-1 min-w-0 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2 py-1.5 disabled:opacity-60"
                />
                <datalist id={`models-${stage.key}`}>
                  {suggestions.map(suggestion => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {overridden === 0
            ? 'Every stage is using the newsroom configuration.'
            : `${overridden} of ${STAGES.length} stages overridden here.`}
        </p>

        <div className="flex items-center gap-2">
          {dirty && !readOnly && (
            <button
              type="button"
              onClick={() => setDraft(saved)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={() => void onSave(draft)}
            disabled={readOnly || saving || !dirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-yellow-500 text-gray-900 font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {dirty ? 'Save models' : 'Saved'}
          </button>
        </div>
      </div>
    </Card>
  );
}
