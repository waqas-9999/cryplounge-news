'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { apiClient } from '@/lib/api-client';
import { StoryInspector } from './recovery/StoryInspector';
import { SourceAccessPanel } from './recovery/SourceAccessPanel';
import {
  DECISION_CLASS_META,
  type DecisionsResponse,
  type HealthResponse,
} from './recovery/types';

/**
 * Editorial Recovery — what the newsroom held back, why, and what to do about it.
 *
 * Answers a different question from the Intelligence globe. The globe shows
 * the newsroom moving; this page is where an editor works through the stories
 * it refused, reads the evidence behind each refusal, and decides whether one
 * deserves another run through the pipeline.
 *
 * Every figure comes from the newsroom's own records. Refusals are broken down
 * by the newsroom's decision class so an editorial refusal, a research gap and
 * a provider timeout are never counted as one "rejected" number.
 */

interface PageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const WINDOWS = [
  { key: '6h', label: 'Last 6 hours' },
  { key: '24h', label: 'Last 24 hours' },
  { key: '7d', label: 'Last 7 days' },
];

const JOB_ORDER = ['RUNNING', 'QUEUED', 'RETRYABLE', 'STALLED', 'FAILED', 'SUCCEEDED', 'CANCELLED'];

const BAND_TONE: Record<string, string> = {
  STRONG: 'text-emerald-700 dark:text-emerald-400',
  POSSIBLE: 'text-amber-700 dark:text-amber-400',
  WEAK: 'text-gray-500 dark:text-gray-400',
  HARD_REJECTION: 'text-rose-700 dark:text-rose-400',
};

function ago(iso: string | null): string {
  if (!iso) return '—';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

function Stat({ label, value, hint, alert }: { label: string; value: string | number; hint?: string; alert?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className={`mt-1 font-mono text-xl ${alert ? 'text-rose-700 dark:text-rose-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

export function EditorialRecoveryPage({ currentPage, onNavigate, onLogout }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [timeWindow, setTimeWindow] = useState('24h');
  const [decisionClass, setDecisionClass] = useState('');
  const [code, setCode] = useState('');
  const [recoverable, setRecoverable] = useState('');
  const [page, setPage] = useState(1);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthState, setHealthState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [decisions, setDecisions] = useState<DecisionsResponse | null>(null);
  const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading');

  const inspecting = searchParams.get('story');

  const loadHealth = useCallback(() => {
    setHealthState('loading');
    apiClient
      .get<HealthResponse>('admin/ai/newsroom/pipeline/health', { query: { window: timeWindow } })
      .then(response => {
        setHealth(response);
        setHealthState('ready');
      })
      .catch(() => setHealthState('error'));
  }, [timeWindow]);

  const loadDecisions = useCallback(() => {
    setListState('loading');
    apiClient
      .get<DecisionsResponse>('admin/ai/newsroom/decisions', {
        query: {
          window: timeWindow,
          decisionClass: decisionClass || undefined,
          code: code || undefined,
          recoverable: recoverable || undefined,
          page,
          perPage: 25,
        },
      })
      .then(response => {
        setDecisions(response);
        setListState('ready');
      })
      .catch(() => setListState('error'));
  }, [timeWindow, decisionClass, code, recoverable, page]);

  useEffect(() => loadHealth(), [loadHealth]);
  useEffect(() => loadDecisions(), [loadDecisions]);
  useEffect(() => setPage(1), [timeWindow, decisionClass, code, recoverable]);

  const openStory = (clusterId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (clusterId) params.set('story', clusterId);
    else params.delete('story');
    const query = params.toString();
    router.replace(`/admin/newsroom-recovery${query ? `?${query}` : ''}`, { scroll: false });
  };

  const select =
    'px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100';

  const ready = health && health.available ? health : null;
  const totalRefused = ready ? ready.decisionClasses.reduce((sum, item) => sum + item.count, 0) : 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="Editorial Recovery" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Editorial Recovery</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                Stories the newsroom researched or wrote but did not file, with the evidence and the reason. A recovery
                re-runs every gate; nothing here publishes or approves a story.
              </p>
            </div>
            <select value={timeWindow} onChange={event => setTimeWindow(event.target.value)} className={select} aria-label="Time window">
              {WINDOWS.map(item => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {healthState === 'loading' && !health && <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>}
          {healthState === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">Could not load the newsroom pipeline state.</p>
          )}
          {health && !health.available && (
            <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-300">
              {health.reason}
            </div>
          )}

          {ready && (
            <>
              {ready.bottleneck && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/10 dark:text-amber-300">
                  <span className="font-medium">Main bottleneck: </span>
                  {ready.bottleneck.label}
                </div>
              )}

              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Stat label="Held back" value={totalRefused} hint="Refusals with a recorded class" />
                <Stat
                  label="Recoverable"
                  value={ready.decisionClasses.reduce((sum, item) => sum + item.recoverable, 0)}
                  hint="Can re-enter the pipeline"
                />
                <Stat label="Awaiting newsroom" value={health?.pendingRecoveries ?? 0} hint="Editor requests not yet applied" />
                <Stat
                  label="Stalled jobs"
                  value={ready.jobs.byStatus.STALLED ?? 0}
                  alert={(ready.jobs.byStatus.STALLED ?? 0) > 0}
                />
                <Stat
                  label="Oldest waiting job"
                  value={ready.jobs.oldestWaitingMinutes === null ? '—' : `${ready.jobs.oldestWaitingMinutes}m`}
                  alert={(ready.jobs.oldestWaitingMinutes ?? 0) >= 60}
                />
                <Stat
                  label="Unreadable editor replies"
                  value={`${ready.editor.invalid}/${ready.editor.reviews}`}
                  hint="System errors, not verdicts"
                  alert={ready.editor.reviews >= 5 && ready.editor.invalid / ready.editor.reviews >= 0.25}
                />
              </div>

              <div className="mb-5 grid gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Why stories were held back</h2>
                  {ready.decisionClasses.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No classified refusals in this window.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {ready.decisionClasses.map(item => {
                        const meta = DECISION_CLASS_META[item.decisionClass];
                        const active = decisionClass === item.decisionClass;
                        return (
                          <li key={item.decisionClass}>
                            <button
                              type="button"
                              onClick={() => {
                                setDecisionClass(active ? '' : item.decisionClass);
                                setCode('');
                              }}
                              aria-pressed={active}
                              className={`w-full rounded-md px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                active ? 'bg-gray-100 dark:bg-gray-800' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                  <span className={`h-2 w-2 rounded-full ${meta?.tone ?? 'bg-gray-400'}`} />
                                  {meta?.label ?? item.decisionClass}
                                </span>
                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                  {item.count}
                                  <span className="ml-1 text-xs text-gray-500">({item.recoverable} recoverable)</span>
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 rounded bg-gray-100 dark:bg-gray-800">
                                <div
                                  className={`h-1.5 rounded ${meta?.tone ?? 'bg-gray-400'}`}
                                  style={{ width: `${totalRefused ? (item.count / totalRefused) * 100 : 0}%` }}
                                />
                              </div>
                              {meta && <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{meta.hint}</p>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Most common reasons</h2>
                  {ready.codes.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Nothing recorded in this window.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
                      {ready.codes.map(item => {
                        const active = code === item.code && decisionClass === item.decisionClass;
                        return (
                          <li key={`${item.decisionClass}:${item.code}`}>
                            <button
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                setCode(active ? '' : item.code);
                                setDecisionClass(active ? '' : item.decisionClass);
                              }}
                              className={`flex w-full items-center justify-between gap-2 px-1 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                active ? 'bg-gray-100 dark:bg-gray-800' : ''
                              }`}
                            >
                              <span className="font-mono text-gray-800 dark:text-gray-200">{item.code}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {DECISION_CLASS_META[item.decisionClass]?.label ?? item.decisionClass} ·{' '}
                                <span className="font-mono">{item.count}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Jobs</h3>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {JOB_ORDER.filter(status => ready.jobs.byStatus[status]).map(status => (
                      <span key={status}>
                        {status.toLowerCase()} <span className="font-mono">{ready.jobs.byStatus[status]}</span>
                      </span>
                    ))}
                    {JOB_ORDER.every(status => !ready.jobs.byStatus[status]) && <span>No pipeline jobs in this window.</span>}
                  </p>

                  <h3 className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Drafts</h3>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {Object.entries(ready.drafts).map(([status, count]) => (
                      <span key={status}>
                        {status.toLowerCase().replace(/_/g, ' ')} <span className="font-mono">{count}</span>
                      </span>
                    ))}
                    {Object.keys(ready.drafts).length === 0 && <span>No drafts written in this window.</span>}
                  </p>
                </section>
              </div>
            </>
          )}

          <SourceAccessPanel
            summary={health?.sourceAccess}
            codes={ready ? ready.codes : null}
            onSelectCode={selected => {
              setCode(selected);
              setDecisionClass('RESEARCH');
            }}
          />

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={decisionClass} onChange={event => setDecisionClass(event.target.value)} className={select} aria-label="Decision class">
              <option value="">All classes</option>
              {Object.entries(DECISION_CLASS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
            <select value={recoverable} onChange={event => setRecoverable(event.target.value)} className={select} aria-label="Recoverability">
              <option value="">Recoverable and hard rejections</option>
              <option value="true">Recoverable only</option>
              <option value="false">Hard rejections only</option>
            </select>
            {code && (
              <button
                type="button"
                onClick={() => setCode('')}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                Reason: <span className="font-mono">{code}</span> ✕
              </button>
            )}
          </div>

          {listState === 'loading' && !decisions && <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>}
          {listState === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Could not load held-back stories.</p>}
          {decisions && !decisions.available && health?.available !== false && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-300">
              {decisions.reason}
            </div>
          )}

          {decisions?.available && (
            <>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {decisions.total} {decisions.total === 1 ? 'story' : 'stories'}
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Story</th>
                      <th className="px-3 py-2 font-medium">Held back because</th>
                      <th className="px-3 py-2 font-medium">Evidence</th>
                      <th className="px-3 py-2 font-medium" title="Deterministic editor assist — not a decision">
                        Assist
                      </th>
                      <th className="px-3 py-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {decisions.items.map(item => (
                      <tr key={item.clusterId} className="align-top hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => openStory(item.clusterId)}
                            className="text-left font-medium text-gray-900 underline-offset-2 hover:underline dark:text-gray-100"
                          >
                            {item.title}
                          </button>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {item.state}
                            {item.category ? ` · ${item.category}` : ''}
                            {item.discoveryScore !== null ? ` · score ${item.discoveryScore}` : ''}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs">
                            <span className="text-gray-800 dark:text-gray-200">
                              {DECISION_CLASS_META[item.decisionClass ?? '']?.label ?? item.decisionClass ?? '—'}
                            </span>
                            {item.stateCode && <span className="ml-1 font-mono text-gray-500 dark:text-gray-400">{item.stateCode}</span>}
                          </p>
                          {item.stateReason && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{item.stateReason}</p>
                          )}
                          <p className={`mt-0.5 text-xs ${item.recoverable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {item.recoverable ? 'Recoverable' : 'Hard rejection'}
                            {item.rewriteCount > 0 ? ` · ${item.rewriteCount} rewrite(s)` : ''}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300">
                          {item.research ? (
                            <>
                              {item.research.verified}/{item.research.claims} claims verified
                              <br />
                              {item.research.sources} sources · {item.research.primarySources} primary
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No research</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className={`font-mono ${BAND_TONE[item.assist.band] ?? ''}`}>{item.assist.score}</span>
                          <span className={`ml-1 ${BAND_TONE[item.assist.band] ?? ''}`}>
                            {item.assist.band.replace('_', ' ').toLowerCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">{ago(item.stateChangedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {decisions.items.length === 0 && (
                  <p className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    Nothing held back matches these filters in this window.
                  </p>
                )}
              </div>

              {decisions.totalPages > 1 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(value => value - 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {decisions.page} of {decisions.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= decisions.totalPages}
                    onClick={() => setPage(value => value + 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {inspecting && (
        <StoryInspector
          clusterId={inspecting}
          onClose={() => openStory(null)}
          onRequested={() => {
            loadHealth();
            loadDecisions();
          }}
        />
      )}
    </div>
  );
}
