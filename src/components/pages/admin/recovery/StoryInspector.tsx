'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, errorMessage } from '@/lib/api-client';
import {
  ACTION_META,
  DECISION_CLASS_META,
  type RecoveryAction,
  type StoryInspection,
  type StoryResponse,
} from './types';

/**
 * Everything the newsroom recorded about one held-back story, and the four
 * audited actions an editor can take on it.
 *
 * Read-only over the newsroom's data. An action is a request recorded in the
 * CMS; the newsroom applies it on its next cycle, so the page says "requested"
 * and shows the request's status rather than pretending the story has moved.
 */

const str = (value: unknown): string => (value === null || value === undefined ? '' : String(value));
const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

function when(iso: unknown): string {
  const text = str(iso);
  if (!text) return '—';
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toLocaleString();
}

const CLAIM_TONE: Record<string, string> = {
  VERIFIED: 'text-emerald-700 dark:text-emerald-400',
  PARTIALLY_VERIFIED: 'text-amber-700 dark:text-amber-400',
  UNVERIFIED: 'text-gray-500 dark:text-gray-400',
  CONTRADICTED: 'text-rose-700 dark:text-rose-400',
  REJECTED: 'text-rose-700 dark:text-rose-400',
};

function Section({ title, children, count }: { title: string; children: React.ReactNode; count?: number }) {
  return (
    <section className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        {title}
        {count !== undefined && <span className="ml-1.5 font-normal normal-case tracking-normal">({count})</span>}
      </h3>
      {children}
    </section>
  );
}

export function StoryInspector({
  clusterId,
  onClose,
  onRequested,
}: {
  clusterId: string;
  onClose: () => void;
  onRequested: () => void;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'missing'>('loading');
  const [data, setData] = useState<StoryResponse | null>(null);
  const [error, setError] = useState('');
  const [action, setAction] = useState<RecoveryAction | null>(null);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .get<StoryResponse>(`admin/ai/newsroom/stories/${encodeURIComponent(clusterId)}`)
      .then(response => {
        setData(response);
        setState('ready');
      })
      .catch(err => {
        setError(errorMessage(err, 'Could not load this story.'));
        setState(/not found/i.test(errorMessage(err, '')) ? 'missing' : 'error');
      });
  }, [clusterId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !action) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, action]);

  const story = data && data.available ? data : null;
  const pending = story?.recoveries.find(request => request.status === 'PENDING') ?? null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Story inspector">
      <button type="button" aria-label="Close inspector" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-3xl overflow-y-auto bg-white dark:bg-gray-950 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 px-5 py-3 backdrop-blur">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Review story</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        <div className="px-5 pb-10 pt-4">
          {state === 'loading' && <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>}
          {state === 'missing' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">The newsroom has no story with this id.</p>
          )}
          {state === 'error' && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {state === 'ready' && data && !data.available && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-300">
              {data.reason}
            </div>
          )}

          {story && (
            <>
              <StoryHeader story={story} />

              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(ACTION_META) as RecoveryAction[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => setAction(key)}
                    className={`rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                      ACTION_META[key].danger
                        ? 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40'
                        : 'border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900'
                    }`}
                  >
                    {ACTION_META[key].label}
                  </button>
                ))}
              </div>
              {pending && (
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  A {ACTION_META[pending.action].label.toLowerCase()} request is waiting for the newsroom&apos;s next cycle.
                </p>
              )}

              {story.unavailableSections.length > 0 && (
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-300">
                  Some records could not be read: {story.unavailableSections.map(item => item.section).join(', ')}.
                </div>
              )}

              <AssistPanel story={story} />
              <ResearchPanel story={story} />
              <DraftsPanel story={story} />
              <JobsPanel story={story} />
              <OverridesPanel story={story} />
              <EventsPanel story={story} />
            </>
          )}
        </div>
      </div>

      {story && action && (
        <ActionDialog
          clusterId={story.cluster.id}
          title={story.cluster.title}
          action={action}
          onCancel={() => setAction(null)}
          onDone={() => {
            setAction(null);
            load();
            onRequested();
          }}
        />
      )}
    </div>
  );
}

function StoryHeader({ story }: { story: StoryInspection }) {
  const { cluster, discovery } = story;
  const meta = cluster.decisionClass ? DECISION_CLASS_META[cluster.decisionClass] : null;
  return (
    <header>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {cluster.state}
        </span>
        {meta && (
          <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <span className={`h-2 w-2 rounded-full ${meta.tone}`} />
            {meta.label}
          </span>
        )}
        {cluster.stateCode && <span className="font-mono text-gray-500 dark:text-gray-400">{cluster.stateCode}</span>}
        <span className={cluster.recoverable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
          {cluster.recoverable ? 'Recoverable' : 'Hard rejection'}
        </span>
      </div>
      <h2 className="mt-2 text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">{cluster.title}</h2>
      {cluster.stateReason && (
        <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <span className="font-medium">Newsroom reason: </span>
          {cluster.stateReason}
        </p>
      )}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-4">
        <div>
          <dt>News score</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">{discovery ? discovery.score : '—'}</dd>
        </div>
        <div>
          <dt>Rewrites spent</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">{cluster.rewriteCount}</dd>
        </div>
        <div>
          <dt>State changed</dt>
          <dd className="text-gray-900 dark:text-gray-100">{when(cluster.stateChangedAt)}</dd>
        </div>
        <div>
          <dt>Pipeline</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">{cluster.pipelineVersion ?? '—'}</dd>
        </div>
      </dl>
    </header>
  );
}

function AssistPanel({ story }: { story: StoryInspection }) {
  return (
    <Section title="Editor assist">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        A deterministic ranking from recorded evidence. It decides nothing; every gate runs again on any recovery.
      </p>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
        <span className="font-mono">{story.assist.score}</span> · {story.assist.band.replace('_', ' ').toLowerCase()}
      </p>
      <ul className="mt-1 list-disc pl-5 text-xs text-gray-700 dark:text-gray-300">
        {story.assist.factors.map(factor => (
          <li key={factor}>{factor}</li>
        ))}
      </ul>
    </Section>
  );
}

function ResearchPanel({ story }: { story: StoryInspection }) {
  if (!story.research) {
    return (
      <Section title="Research">
        <p className="text-sm text-gray-600 dark:text-gray-400">No research report was recorded for this story.</p>
      </Section>
    );
  }
  const { report, sources, claims } = story.research;
  const sourceById = new Map(sources.map(source => [str(source.id), source]));
  const missing = list(report.missingInformation);

  return (
    <>
      <Section title="Research">
        <p className="text-sm text-gray-800 dark:text-gray-200">{str(report.whatHappened)}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Confidence {str(report.confidence)} · {str(report.model) || 'model not recorded'} · {when(report.createdAt)}
        </p>
        {missing.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Not established by the sources</p>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400">
              {missing.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Claims and evidence" count={claims.length}>
        <ul className="space-y-2">
          {claims.map(claim => (
            <li key={str(claim.id)} className="rounded-lg border border-gray-200 p-2.5 dark:border-gray-800">
              <p className="text-sm text-gray-900 dark:text-gray-100">{str(claim.text)}</p>
              <p className="mt-0.5 text-xs">
                <span className={`font-mono ${CLAIM_TONE[str(claim.status)] ?? ''}`}>{str(claim.status)}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}
                  · confidence {str(claim.confidence)}
                  {claim.isMaterial === false ? ' · background' : ''}
                </span>
              </p>
              {claim.evidence.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {claim.evidence.map(item => {
                    const source = sourceById.get(str(item.sourceId));
                    return (
                      <li key={`${str(item.claimId)}-${str(item.sourceId)}`} className="text-xs text-gray-600 dark:text-gray-400">
                        <span className={item.supports === false ? 'text-rose-700 dark:text-rose-400' : ''}>
                          {item.supports === false ? 'Refutes' : 'Supports'}
                        </span>{' '}
                        — {source ? str(source.domain) : 'unknown source'}
                        {item.quote ? <q className="ml-1 italic">{str(item.quote)}</q> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Sources" count={sources.length}>
        <ul className="space-y-1 text-xs">
          {sources.map(source => (
            <li key={str(source.id)} className="flex flex-wrap items-baseline gap-x-2">
              <a
                href={str(source.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
              >
                {str(source.domain)}
              </a>
              <span className="font-mono text-gray-500 dark:text-gray-400">{str(source.tier)}</span>
              {source.isPrimary === true && <span className="text-emerald-700 dark:text-emerald-400">primary</span>}
              <span className="text-gray-500 dark:text-gray-400">authority {str(source.authority)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function DraftsPanel({ story }: { story: StoryInspection }) {
  if (story.drafts.length === 0) {
    return (
      <Section title="Draft attempts">
        <p className="text-sm text-gray-600 dark:text-gray-400">No draft was written for this story.</p>
      </Section>
    );
  }
  return (
    <Section title="Draft attempts" count={story.drafts.length}>
      <ol className="space-y-3">
        {story.drafts.map(draft => {
          const reasons = list(draft.decisionReasons);
          return (
            <li key={str(draft.id)} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-gray-900 dark:text-gray-100">Attempt {str(draft.attempt)}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {str(draft.status)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {str(draft.wordCount)} words · {str(draft.writerModel) || 'writer not recorded'} · {when(draft.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">{str(draft.headline)}</p>
              {reasons.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs text-rose-700 dark:text-rose-400">
                  {reasons.map(reason => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}

              {draft.reviews.map(review => (
                <ReviewBlock key={str(review.id)} review={review} />
              ))}

              {draft.factChecks.map(check => (
                <p key={str(check.id)} className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Fact check {str(check.score)} · {str(check.verifiedClaims)} verified, {str(check.unverifiedClaims)} unverified,{' '}
                  {str(check.contradictedClaims)} contradicted
                </p>
              ))}
              {draft.qualityScores.map(quality => (
                <p key={str(quality.id)} className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                  Quality {str(quality.score)} · {str(quality.verdict)}
                  {list(quality.blockers).length > 0 ? ` · blocked by: ${list(quality.blockers).join('; ')}` : ''}
                </p>
              ))}

              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400">Read the draft</summary>
                {draft.standfirst ? (
                  <p className="mt-2 text-sm italic text-gray-700 dark:text-gray-300">{str(draft.standfirst)}</p>
                ) : null}
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {str(draft.body)}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function ReviewBlock({ review }: { review: Record<string, unknown> }) {
  const notes = (review.notes && typeof review.notes === 'object' ? review.notes : {}) as Record<string, unknown>;
  const unsupported = list(notes.unsupportedClaims);
  const issues = Array.isArray(notes.issues) ? (notes.issues as Array<Record<string, unknown>>) : [];
  const valid = review.valid !== false;

  return (
    <div className="mt-2 rounded-md bg-gray-50 p-2.5 text-xs dark:bg-gray-900">
      <p className="text-gray-700 dark:text-gray-300">
        AI editor · attempt {str(review.attempt)} ·{' '}
        {valid ? (
          <span className="font-mono">
            {str(review.verdict)} · factual {str(notes.factualScore)} · quality {str(notes.qualityScore)}
          </span>
        ) : (
          <span className="text-violet-700 dark:text-violet-400">response unreadable — a system error, not a verdict</span>
        )}
        <span className="text-gray-500 dark:text-gray-400"> · {str(review.model)}</span>
      </p>
      {!valid && review.parseError ? <p className="mt-1 text-gray-600 dark:text-gray-400">{str(review.parseError)}</p> : null}
      {unsupported.length > 0 && (
        <div className="mt-1">
          <p className="font-medium text-gray-700 dark:text-gray-300">Unsupported claims</p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
            {unsupported.map(claim => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
        </div>
      )}
      {issues.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {issues.map((issue, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-400">
              <span className={`font-mono ${issue.severity === 'high' ? 'text-rose-700 dark:text-rose-400' : ''}`}>
                {str(issue.severity)}
              </span>{' '}
              {str(issue.detail)}
            </li>
          ))}
        </ul>
      )}
      {typeof notes.notes === 'string' && notes.notes && (
        <p className="mt-1 text-gray-600 dark:text-gray-400">{notes.notes}</p>
      )}
    </div>
  );
}

function JobsPanel({ story }: { story: StoryInspection }) {
  if (story.jobs.length === 0) return null;
  return (
    <Section title="Jobs" count={story.jobs.length}>
      <ul className="space-y-1 text-xs">
        {story.jobs.map(job => (
          <li key={str(job.id)} className="text-gray-700 dark:text-gray-300">
            <span className="font-mono">{str(job.status)}</span> · {str(job.workflow)} · attempt {str(job.attempts)}/
            {str(job.maxAttempts)} · {when(job.updatedAt)}
            {job.lastError ? <span className="block text-gray-500 dark:text-gray-400">{str(job.lastError)}</span> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function OverridesPanel({ story }: { story: StoryInspection }) {
  if (story.recoveries.length === 0) return null;
  return (
    <Section title="Editor overrides" count={story.recoveries.length}>
      <ul className="space-y-2 text-xs">
        {story.recoveries.map(request => (
          <li key={request.id} className="rounded-lg border border-gray-200 p-2.5 dark:border-gray-800">
            <p className="text-gray-900 dark:text-gray-100">
              {ACTION_META[request.action].label} · <span className="font-mono">{request.status}</span>
            </p>
            <p className="mt-0.5 text-gray-700 dark:text-gray-300">{request.reason}</p>
            {request.note && <p className="mt-0.5 text-gray-600 dark:text-gray-400">Note: {request.note}</p>}
            <p className="mt-0.5 text-gray-500 dark:text-gray-400">
              {request.requestedByEmail ?? 'unknown editor'} · {when(request.createdAt)} · {request.previousState ?? '—'} →{' '}
              {request.requestedState}
              {request.ackDetail ? ` · newsroom: ${request.ackDetail}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function EventsPanel({ story }: { story: StoryInspection }) {
  if (story.events.length === 0) return null;
  return (
    <Section title="Telemetry" count={story.events.length}>
      <ol className="space-y-0.5 text-xs">
        {story.events.map(event => (
          <li key={event.id} className="flex gap-2 text-gray-700 dark:text-gray-300">
            <span className="shrink-0 font-mono text-gray-500 dark:text-gray-400">
              {new Date(event.occurredAt).toLocaleTimeString()}
            </span>
            <span className="font-mono">{event.type}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ActionDialog({
  clusterId,
  title,
  action,
  onCancel,
  onDone,
}: {
  clusterId: string;
  title: string;
  action: RecoveryAction;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const meta = ACTION_META[action];
  const tooShort = reason.trim().length < 10;

  const submit = async () => {
    if (tooShort || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`admin/ai/newsroom/stories/${encodeURIComponent(clusterId)}/recovery`, {
        action,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err, 'The request could not be recorded.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="recovery-action-title">
      <button type="button" aria-label="Cancel" className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-900">
        <h2 id="recovery-action-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {meta.label}
        </h2>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{title}</p>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{meta.explain}</p>

        <label className="mt-4 block text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="recovery-reason">
          Reason for overriding the newsroom <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="recovery-reason"
          value={reason}
          onChange={event => setReason(event.target.value)}
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          placeholder="What makes this worth another look (or not)? Recorded in the audit log."
        />
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">At least 10 characters.</p>

        <label className="mt-3 block text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="recovery-note">
          Note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="recovery-note"
          value={note}
          onChange={event => setNote(event.target.value)}
          rows={2}
          maxLength={4000}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={tooShort || submitting}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              meta.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'
            }`}
          >
            {submitting ? 'Recording…' : `Confirm ${meta.label.toLowerCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
