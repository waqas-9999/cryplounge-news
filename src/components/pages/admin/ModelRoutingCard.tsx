'use client';

/**
 * Admin → AI Automation → Models.
 *
 * Two sections, and the split is the whole point of the screen:
 *
 *  1. **Live runtime routing** — what the newsroom reported it is actually
 *     running, at the top, read-only.
 *  2. **Model configuration** — what this dashboard has asked for, with the
 *     dropdowns that change it.
 *
 * They are different facts. A newsroom that has not cycled since a change was
 * saved is still running the old model, and a screen that showed only the
 * dropdowns would let an operator believe otherwise. Where the two disagree
 * the card says so rather than smoothing it over, and where the newsroom has
 * said nothing the card says that too — it never fills the runtime in from the
 * configuration.
 *
 * Everything displayed comes from the server: stage names, provider and model
 * names, pricing, and the runtime report. No model, provider or price is
 * written into this file, so adding a model stays a one-file change on the
 * server.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, ChevronDown, Cpu, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
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

export interface StageInfo {
  stage: string;
  label: string;
  description: string;
}

export interface NamedModel {
  providerId: string | null;
  providerName: string | null;
  modelId: string | null;
  modelName: string | null;
  pricing: 'free' | 'paid' | null;
  unknown: boolean;
}

export type RuntimeStatus = 'ROUTED' | 'ENVIRONMENT_DEFAULT' | 'NOT_REPORTED' | 'UNAVAILABLE' | 'MISMATCH';

export interface StageRuntime {
  stage: string;
  label: string;
  kind: 'text' | 'image';
  configured: NamedModel;
  runtime: NamedModel;
  status: RuntimeStatus;
  error: string | null;
  reportedAt: string | null;
}

export interface ModelRoutingReport {
  health: 'ACTIVE' | 'STALE' | 'WAITING';
  lastReportedAt: string | null;
  staleAfterMinutes: number;
  stages: StageRuntime[];
}

interface ModelRoutingCardProps {
  models: ModelSettings;
  catalog: Record<string, CatalogProvider[]>;
  stages: StageInfo[];
  routing: ModelRoutingReport;
  readOnly: boolean;
  saving: boolean;
  errors?: Record<string, string>;
  onSave: (models: ModelSettings) => Promise<void> | void;
  /** Re-reads the runtime half alone. Returns the fresh report. */
  onRefreshRuntime: () => Promise<ModelRoutingReport | null>;
}

/** How often the runtime section re-reads itself. The newsroom cycles every ten minutes. */
const POLL_MS = 45_000;

const STATUS: Record<RuntimeStatus, { label: string; dot: string; text: string }> = {
  ROUTED: {
    label: 'Routed',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
  },
  ENVIRONMENT_DEFAULT: {
    label: 'Environment default',
    dot: 'bg-sky-500',
    text: 'text-sky-700 dark:text-sky-400',
  },
  NOT_REPORTED: {
    label: 'Not reported yet',
    dot: 'bg-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
  },
  UNAVAILABLE: {
    label: 'Runtime unavailable',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
  MISMATCH: {
    label: 'Does not match configuration',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

const HEALTH: Record<ModelRoutingReport['health'], { label: string; dot: string }> = {
  ACTIVE: { label: 'Runtime reporting active', dot: 'bg-green-500' },
  STALE: { label: 'Runtime report stale', dot: 'bg-amber-500' },
  WAITING: { label: 'Waiting for first newsroom runtime report', dot: 'bg-gray-400' },
};

function exactTime(iso: string): string {
  return `${new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  })} UTC`;
}

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function PricingBadge({ pricing }: { pricing: 'free' | 'paid' | null }) {
  if (!pricing) return null;
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

function StatusDot({ status }: { status: RuntimeStatus }) {
  const style = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

/** A provider/model pair as words, falling back to "not reported" rather than to a guess. */
function ModelName({ value, empty }: { value: NamedModel; empty: string }) {
  if (!value.modelId && !value.providerId) {
    return <span className="text-sm text-gray-400 dark:text-gray-500">{empty}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="text-sm text-gray-900 dark:text-gray-100">{value.modelName ?? 'Provider default'}</span>
      {value.providerName && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{value.providerName}</span>
      )}
      <PricingBadge pricing={value.pricing} />
      {value.unknown && (
        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          not in catalogue
        </span>
      )}
    </span>
  );
}

function normalise(models: ModelSettings, stages: StageInfo[]): ModelSettings {
  return Object.fromEntries(
    stages.map(stage => [
      stage.stage,
      { provider: models[stage.stage]?.provider ?? null, model: models[stage.stage]?.model ?? null },
    ])
  );
}

const USE_ENV = '';

export function ModelRoutingCard({
  models,
  catalog,
  stages,
  routing,
  readOnly,
  saving,
  errors,
  onSave,
  onRefreshRuntime,
}: ModelRoutingCardProps) {
  const [draft, setDraft] = useState<ModelSettings>(() => normalise(models, stages));
  const [live, setLive] = useState<ModelRoutingReport>(routing);
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    setDraft(normalise(models, stages));
  }, [models, stages]);

  useEffect(() => {
    setLive(routing);
  }, [routing]);

  const saved = useMemo(() => normalise(models, stages), [models, stages]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const runtimeFor = useMemo(() => new Map(live.stages.map(entry => [entry.stage, entry])), [live]);

  /*
   * The runtime half refreshes itself; the configuration half does not.
   *
   * What is running changes without anyone touching this screen — a cycle
   * starts, a report arrives — so leaving it to a manual reload means the
   * section most likely to be stale is the one claiming to be live. The
   * configuration is only changed from here, and re-reading it under an
   * operator's cursor would discard their edits.
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const report = await onRefreshRuntime();
      if (report) setLive(report);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshRuntime]);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const timer = setInterval(() => void refreshRef.current(), POLL_MS);
    return () => clearInterval(timer);
  }, []);

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
   * The model is kept when the new provider also serves it, and cleared
   * otherwise — which shows as "Newsroom default" until one is picked.
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

  const overridden = stages.filter(stage => draft[stage.stage]?.provider || draft[stage.stage]?.model).length;
  const mismatches = live.stages.filter(stage => stage.status === 'MISMATCH').length;
  const health = HEALTH[live.health];

  return (
    <div className="space-y-4">
      {/* ==================================================== live runtime == */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm text-gray-900 dark:text-gray-100">Live runtime routing</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                What the newsroom reported it is running, from its own cycle reports. Not a projection of
                the settings below.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} aria-hidden />
                <span className="text-gray-700 dark:text-gray-300">{health.label}</span>
              </p>
              {live.lastReportedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={exactTime(live.lastReportedAt)}>
                  Last newsroom report {relativeTime(live.lastReportedAt)} ·{' '}
                  <span className="text-gray-400 dark:text-gray-500">{exactTime(live.lastReportedAt)}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh runtime
          </button>
        </div>

        {live.health === 'STALE' && (
          <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
            No report in the last {live.staleAfterMinutes} minutes, so this view may be out of date. That is
            not the same as the newsroom being down.
          </p>
        )}

        {mismatches > 0 && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/40">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {mismatches === 1 ? 'One stage is' : `${mismatches} stages are`} running something other than
              what is configured here. Usually the newsroom has not started a cycle since the change was
              saved.
            </p>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-2 pr-4 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                  Stage
                </th>
                <th className="py-2 pr-4 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                  Running now
                </th>
                <th className="py-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map(stage => {
                const entry = runtimeFor.get(stage.stage);
                return (
                  <tr key={stage.stage} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                    <td className="py-2.5 pr-4 align-top">
                      <span className="text-sm text-gray-800 dark:text-gray-200">{stage.label}</span>
                      {entry?.kind === 'image' && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          image
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 align-top">
                      {entry ? (
                        <ModelName value={entry.runtime} empty="Not reported yet" />
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">Not reported yet</span>
                      )}
                      {entry?.error && (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{entry.error}</p>
                      )}
                      {details && entry?.runtime.modelId && (
                        <p className="mt-1 text-[11px] font-mono text-gray-400 dark:text-gray-500 break-all">
                          {entry.runtime.providerId ?? '—'} · {entry.runtime.modelId}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 align-top">
                      {entry ? <StatusDot status={entry.status} /> : <StatusDot status="NOT_REPORTED" />}
                      {details && entry?.reportedAt && (
                        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                          {exactTime(entry.reportedAt)}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => setDetails(value => !value)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-expanded={details}
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${details ? 'rotate-180' : ''}`} />
          Technical details
        </button>
      </Card>

      {/* ================================================== configuration == */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-sm text-gray-900 dark:text-gray-100">Model configuration</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose the provider and model for each stage. Leave a stage on{' '}
              <span className="text-gray-700 dark:text-gray-300">Newsroom default</span> to keep whatever the
              newsroom itself is configured with. Changes reach the newsroom on its next cycle — no deploy,
              no restart.
            </p>
          </div>
        </div>

        {dirty && (
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/40">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Unsaved changes. The newsroom is still running the saved routing.
            </p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {stages.map(stage => {
            const entry = draft[stage.stage] ?? { provider: null, model: null };
            const providers = catalog[stage.stage] ?? [];
            const provider = providers.find(item => item.id === entry.provider);
            const available = provider?.models ?? [];
            const selected = available.find(model => model.id === entry.model);
            const runtime = runtimeFor.get(stage.stage);
            const error = errors?.[stage.stage];
            const changed = JSON.stringify(entry) !== JSON.stringify(saved[stage.stage]);

            return (
              <div
                key={stage.stage}
                className={`rounded-xl border p-4 ${
                  error
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-900/10'
                    : changed
                      ? 'border-amber-300 dark:border-amber-900/60'
                      : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <p className="text-sm text-gray-900 dark:text-gray-100">{stage.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stage.description}</p>

                {/* What is set, and what is running, side by side. */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Currently selected
                    </p>
                    <div className="mt-1">
                      {runtime ? (
                        <ModelName value={runtime.configured} empty="Newsroom default" />
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">Newsroom default</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Running now
                    </p>
                    <div className="mt-1">
                      {runtime ? (
                        <ModelName value={runtime.runtime} empty="Not reported yet" />
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">Not reported yet</span>
                      )}
                    </div>
                    <div className="mt-1">
                      <StatusDot status={runtime?.status ?? 'NOT_REPORTED'} />
                    </div>
                  </div>
                </div>

                {runtime?.status === 'MISMATCH' && (
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
                    This configuration has not been observed in the latest newsroom runtime report.
                  </p>
                )}

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Provider
                    </span>
                    <select
                      value={entry.provider ?? USE_ENV}
                      disabled={readOnly || saving}
                      onChange={event => changeProvider(stage.stage, event.target.value, providers)}
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
                      onChange={event => update(stage.stage, { model: event.target.value || null })}
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
                      {entry.model && !selected && (
                        <option value={entry.model}>{entry.model} — saved earlier</option>
                      )}
                    </select>
                  </label>
                </div>

                {selected?.description && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{selected.description}</p>
                )}
                {error && <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>}

                {/* Everything this stage could run, so the choice is visible without opening a menu. */}
                <details className="mt-3 group">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 list-none inline-flex items-center gap-1">
                    <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                    Available models ({providers.reduce((total, item) => total + item.models.length, 0)})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {providers.map(item => (
                      <div key={item.id}>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          {item.name}
                        </p>
                        <ul className="mt-0.5 space-y-0.5">
                          {item.models.map(model => (
                            <li key={model.id} className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-700 dark:text-gray-300">{model.name}</span>
                              <PricingBadge pricing={model.pricing} />
                              {entry.provider === item.id && entry.model === model.id && (
                                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  selected
                                </span>
                              )}
                              {details && (
                                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 break-all">
                                  {model.id}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {overridden === 0
              ? 'Every stage is using the newsroom configuration.'
              : `${overridden} of ${stages.length} stages set here.`}
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
    </div>
  );
}
