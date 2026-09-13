'use client';

import type { SourceAccessSummary, Unavailable } from './types';

/**
 * Source access and editorial outcomes, kept apart.
 *
 * A publisher refusing an article page, a story research could not support and
 * an editor's refusal are different problems with different fixes. Showing
 * them as one "rejected" figure hid which one was actually costing stories.
 */

const RESEARCH_HOLDS: Record<string, { label: string; hint: string }> = {
  SOURCE_BLOCKED: { label: 'Source blocked', hint: 'Lead page refused; nothing readable replaced it. Recoverable.' },
  INSUFFICIENT_EVIDENCE: { label: 'Insufficient evidence', hint: 'Read sources do not support the story yet. Recoverable.' },
  UNSUPPORTED_PREMISE: { label: 'Unsupported premise', hint: 'The headline’s figures or trend were not established. Recoverable.' },
  HARD_REJECT: { label: 'Hard reject', hint: 'A read source refutes the premise. Final unless an editor reopens it.' },
};

function Figure({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: 'alert' | 'good' }) {
  const colour =
    tone === 'alert'
      ? 'text-rose-700 dark:text-rose-400'
      : tone === 'good'
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-gray-900 dark:text-gray-100';
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className={`font-mono text-lg ${colour}`}>{value}</p>
      {hint && <p className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

export function SourceAccessPanel({
  summary,
  codes,
  onSelectCode,
}: {
  summary: SourceAccessSummary | Unavailable | undefined;
  /** Refusal codes from the newsroom database, when it could be read. */
  codes: Array<{ code: string; decisionClass: string; count: number }> | null;
  onSelectCode: (code: string) => void;
}) {
  if (!summary) return null;

  if (!('fetches' in summary)) {
    return (
      <section className="mb-5 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Source access</h2>
        <p className="mt-1">{summary.reason}</p>
      </section>
    );
  }

  const { fetches, leadsBlocked, expansion, outcomes } = summary;
  const readShare = fetches.total ? Math.round((fetches.success / fetches.total) * 100) : null;
  const holds = (codes ?? []).filter(item => item.code in RESEARCH_HOLDS);

  return (
    <section className="mb-5 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Source access and outcomes</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          From newsroom telemetry · a refused page is recorded as a lead, never as evidence
        </p>
      </div>

      <h3 className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Article pages requested</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Figure
          label="Read"
          value={fetches.total ? `${fetches.success}/${fetches.total}` : '—'}
          hint={readShare === null ? 'No requests in this window' : `${readShare}% of requests`}
          tone={readShare !== null && readShare >= 70 ? 'good' : undefined}
        />
        <Figure label="Refused (403)" value={fetches.http403} tone={fetches.http403 > 0 ? 'alert' : undefined} />
        <Figure label="Not found (404)" value={fetches.http404} />
        <Figure label="Rate limited (429)" value={fetches.http429} tone={fetches.http429 > 0 ? 'alert' : undefined} />
        <Figure label="Server errors (5xx)" value={fetches.http5xx} />
        <Figure label="Timeouts" value={fetches.timeout} />
        <Figure label="Other" value={fetches.other} hint="Content type, extraction, redirects" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Lead sources not read</h3>
          <p className="mt-1 font-mono text-lg text-gray-900 dark:text-gray-100">{leadsBlocked.total}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-600 dark:text-gray-400">
            {Object.entries(leadsBlocked.byOutcome).map(([outcome, count]) => (
              <span key={outcome}>
                {outcome} <span className="font-mono">{count}</span>
              </span>
            ))}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Source expansion</h3>
          <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
            <span className="font-mono">{expansion.recovered}</span> of <span className="font-mono">{expansion.started}</span> found
            readable evidence
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-mono">{expansion.sourcesAdded}</span> readable source(s) added from this cycle’s feeds
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Research holds</h3>
          {holds.length === 0 ? (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {codes === null ? 'Newsroom database unavailable.' : 'None in this window.'}
            </p>
          ) : (
            <ul className="mt-1 space-y-1">
              {holds.map(item => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => onSelectCode(item.code)}
                    title={RESEARCH_HOLDS[item.code]!.hint}
                    className="flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className={item.code === 'HARD_REJECT' ? 'text-rose-700 dark:text-rose-400' : 'text-gray-800 dark:text-gray-200'}>
                      {RESEARCH_HOLDS[item.code]!.label}
                    </span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">{item.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Writing and review</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Figure label="Drafts written" value={outcomes.writingStarted} />
        <Figure label="Passed the editor" value={outcomes.editorPassed} tone="good" />
        <Figure label="Rewrite required" value={outcomes.rewriteRequired} hint="Repaired with named findings" />
        <Figure label="Kept for an editor" value={outcomes.editorRejected} hint="Not filed; recoverable" />
        <Figure label="Hard rejected" value={outcomes.hardRejected} tone={outcomes.hardRejected > 0 ? 'alert' : undefined} />
        <Figure label="Filed as CMS drafts" value={outcomes.cmsDrafts} tone="good" />
      </div>
    </section>
  );
}
