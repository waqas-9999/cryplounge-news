'use client';

/**
 * Admin → AI Automation → Models.
 *
 * Which model writes the articles, and which one draws the images. Before
 * this, both lived in an environment file on the newsroom server, so changing
 * the writer model meant a shell, an edit and a restart — and nobody looking
 * at the dashboard could tell what was running.
 *
 * Four decisions shape the screen:
 *
 *  1. **The server owns the catalogue.** Providers and models arrive with the
 *     status payload, from the same function the validator uses, so the
 *     dropdowns cannot offer a pair the save would reject. Adding a model is a
 *     server change; this file needs no edit.
 *  2. **"Newsroom default" is an option, not an empty box.** It stores the
 *     same blank the setting has always used, so handing a stage back to the
 *     environment is one click and needs no knowledge of what the environment
 *     says.
 *  3. **Nothing saves on change.** A provider and a model belong together;
 *     saving between the two would send a model to a provider that does not
 *     serve it. Changes collect, the card says so, and one button commits
 *     them.
 *  4. **The card distinguishes what was chosen here from what is running.**
 *     An override is a statement of intent; the live line is what the newsroom
 *     last reported actually resolving. They are different facts and are shown
 *     as different lines.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Cpu, Loader2, RotateCcw } from 'lucide-react';
import { Card } from '@/components/admin/analytics/primitives';

export interface StageModel {
  provider: string | null;
  model: string | null;
}

export type ModelSettings = Record<string, StageModel>;

export interface CatalogModel {
  id: string;
  name: string;
  pricing: 'free' | 'paid';
  description?: string;
  isProviderDefault?: boolean;
}

export interface CatalogProvider {
  id: string;
  name: string;
  kind: 'text' | 'image';
  description?: string;
  models: CatalogModel[];
}

export interface StageRouting {
  stage: string;
  source: 'cms' | 'environment';
  provider: string | null;
  model: string | null;
  liveProvider: string | null;
  liveModel: string | null;
  liveAt: string | null;
}

interface ModelRoutingCardProps {
  models: ModelSettings;
  /** Stage → providers, each with the models that stage may use. */
  catalog: Record<string, CatalogProvider[]>;
  routing: StageRouting[];
  readOnly: boolean;
  saving: boolean;
  /** Rejected by the server: stage → message. */
  errors?: Record<string, string>;
  onSave: (models: ModelSettings) => Promise<void> | void;
}

/**
 * The stages, in pipeline order, with what each one does.
 *
 * Names and order only — every provider and model comes from the server. The
 * descriptions exist because "quality" and "editor" are not self-explanatory,
 * and an operator deciding where to spend needs to know which stage runs once
 * per article and which runs once per candidate story: the difference is
 * roughly a hundredfold in calls.
 */
const STAGES: Array<{ key: string; label: string; description: string }> = [
  {
    key: 'discovery',
    label: 'Discovery',
    description: 'Reads every incoming headline to decide what is a story. Hundreds of calls a cycle — keep it cheap.',
  },
  { key: 'scoring', label: 'Scoring', description: 'Ranks the candidates. Also runs on everything discovered.' },
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
    description: 'Reviews the draft. Worth a different model from the writer — a second opinion from the same model is not one.',
  },
  {
    key: 'factcheck',
    label: 'Fact check',
    description: 'Checks each statement against the research. The gate most drafts fail.',
  },
  { key: 'quality', label: 'Quality', description: 'Scores readability, structure and SEO.' },
  {
    key: 'imagePrompt',
    label: 'Image prompt',
    description: 'Writes the description the image model draws from. A text model, not an image one.',
  },
  { key: 'image', label: 'Image generation', description: 'Draws the article image itself.' },
];

const USE_ENV = '';

function normalise(models: ModelSettings): ModelSettings {
  return Object.fromEntries(
    STAGES.map(stage => [
      stage.key,
      { provider: models[stage.key]?.provider ?? null, model: models[stage.key]?.model ?? null },
    ])
  );
}

function ago(iso: string | null): string {
  if (!iso) return '';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function PricingBadge({ pricing }: { pricing: 'free' | 'paid' }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${
        pricing === 'free'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {pricing}
    </span>
  );
}

export function ModelRoutingCard({
  models,
  catalog,
  routing,
  readOnly,
  saving,
  errors,
  onSave,
}: ModelRoutingCardProps) {
  const [draft, setDraft] = useState<ModelSettings>(() => normalise(models));

  // A save reloads the status, which arrives as new props. Adopting them
  // discards nothing: the draft that produced them is what came back.
  useEffect(() => {
    setDraft(normalise(models));
  }, [models]);

  const saved = useMemo(() => normalise(models), [models]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const routingFor = useMemo(() => new Map(routing.map(entry => [entry.stage, entry])), [routing]);

  /*
   * Unsaved routing is worth a browser warning.
   *
   * Not for politeness: the fields say what the newsroom will run, and an
   * operator who edits four stages, is called away and closes the tab would
   * otherwise believe the newsroom had changed when it had not.
   */
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = useCallback((stage: string, patch: Partial<StageModel>) => {
    setDraft(current => ({ ...current, [stage]: { ...current[stage]!, ...patch } }));
  }, []);

  /**
   * Changing provider must never leave an impossible pair behind.
   *
   * The model is kept when the new provider also serves it — switching
   * between two endpoints that both offer a model should not lose the
   * selection — and cleared otherwise, which shows as "Newsroom default"
   * until a model is picked.
   */
  const changeProvider = useCallback(
    (stage: string, providerId: string, providers: CatalogProvider[]) => {
      const current = draft[stage]?.model ?? null;
      const provider = providers.find(entry => entry.id === providerId);
      const keep = provider && current && provider.models.some(model => model.id === current);

      update(stage, { provider: providerId || null, model: keep ? current : null });
    },
    [draft, update]
  );

  const overridden = STAGES.filter(stage => draft[stage.key]?.provider || draft[stage.key]?.model).length;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm text-gray-900 dark:text-gray-100">AI model routing</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose which provider and model each newsroom stage uses. Leave a stage on{' '}
            <span className="text-gray-700 dark:text-gray-300">Newsroom default</span> to keep whatever the
            newsroom itself is configured with. Changes reach the newsroom on its next cycle — no deploy, no
            restart.
          </p>
        </div>
      </div>

      {dirty && (
        <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/40">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Unsaved changes. The newsroom is still running the saved routing below.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {STAGES.map(stage => {
          const entry = draft[stage.key] ?? { provider: null, model: null };
          const providers = catalog[stage.key] ?? [];
          const provider = providers.find(item => item.id === entry.provider);
          const available = provider?.models ?? [];
          const selected = available.find(model => model.id === entry.model);
          const live = routingFor.get(stage.key);
          const error = errors?.[stage.key];
          const changed = JSON.stringify(entry) !== JSON.stringify(saved[stage.key]);

          return (
            <div
              key={stage.key}
              className={`rounded-xl border p-4 ${
                error
                  ? 'border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-900/10'
                  : changed
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{stage.label}</p>
                    {selected && <PricingBadge pricing={selected.pricing} />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stage.description}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Provider
                  </span>
                  <select
                    value={entry.provider ?? USE_ENV}
                    disabled={readOnly || saving}
                    onChange={event => changeProvider(stage.key, event.target.value, providers)}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2.5 py-2 disabled:opacity-60"
                  >
                    <option value={USE_ENV}>Newsroom default</option>
                    {providers.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Model
                  </span>
                  <select
                    value={entry.model ?? USE_ENV}
                    disabled={readOnly || saving || !entry.provider}
                    onChange={event => update(stage.key, { model: event.target.value || null })}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2.5 py-2 disabled:opacity-60"
                  >
                    <option value={USE_ENV}>
                      {entry.provider ? 'Newsroom default' : 'Choose a provider first'}
                    </option>
                    {available.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} — {model.pricing.toUpperCase()}
                        {model.isProviderDefault ? ' (default)' : ''}
                      </option>
                    ))}
                    {/*
                     * A model saved before it left the catalogue stays
                     * selectable, so an old setting can be seen and changed
                     * rather than silently replaced.
                     */}
                    {entry.model && !selected && <option value={entry.model}>{entry.model} — saved earlier</option>}
                  </select>
                </label>
              </div>

              {selected?.description && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{selected.description}</p>
              )}
              {error && <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>}

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-4 gap-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Source:{' '}
                  <span className="text-gray-800 dark:text-gray-200">
                    {live?.source === 'cms' ? 'CMS override' : 'Environment default'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Newsroom last ran:{' '}
                  <span className="text-gray-800 dark:text-gray-200 font-mono">
                    {live?.liveModel
                      ? `${live.liveProvider ?? '—'} · ${live.liveModel}`
                      : 'not reported yet'}
                  </span>
                  {live?.liveAt && <span className="text-gray-400 dark:text-gray-500"> · {ago(live.liveAt)}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {overridden === 0
            ? 'Every stage is using the newsroom configuration.'
            : `${overridden} of ${STAGES.length} stages set here.`}
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
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => void onSave(draft)}
            disabled={readOnly || saving || !dirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-yellow-500 text-gray-900 font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : !dirty && <Check className="w-3 h-3" />}
            {dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>
    </Card>
  );
}
