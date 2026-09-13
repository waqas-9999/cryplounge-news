/**
 * Source access and editorial outcomes, from the newsroom's telemetry.
 *
 * The newsroom reports what happened when it requested each article page — a
 * read, a refusal, a rate limit, a timeout — and whether it went looking for
 * readable evidence elsewhere. Those used to collapse into "rejected" on the
 * dashboard, which made a publisher's Cloudflare rule look like an editorial
 * judgement. This keeps them apart.
 *
 * Read from the CMS's own `NewsroomEvent` table, which the newsroom already
 * writes to. Nothing new is sent and nothing is written.
 */

export interface SourceAccessSummary {
  window: { minutes: number; since: string };
  /** Article-page requests by outcome. */
  fetches: {
    total: number;
    success: number;
    http403: number;
    http404: number;
    http429: number;
    http5xx: number;
    timeout: number;
    other: number;
    byOutcome: Record<string, number>;
  };
  /** Stories whose lead source could not be read, by why. */
  leadsBlocked: { total: number; byOutcome: Record<string, number> };
  expansion: {
    started: number;
    completed: number;
    /** Readable sources expansion added. */
    sourcesAdded: number;
    /** Expansions that found at least one readable source. */
    recovered: number;
  };
  /** Editorial outcomes by event, so a refusal is never just "rejected". */
  outcomes: {
    writingStarted: number;
    editorPassed: number;
    rewriteRequired: number;
    editorRejected: number;
    hardRejected: number;
    cmsDrafts: number;
  };
}

export const OUTCOME_EVENTS = {
  writingStarted: 'WRITING_STARTED',
  editorPassed: 'EDITOR_PASSED',
  rewriteRequired: 'REWRITE_REQUIRED',
  editorRejected: 'EDITOR_REJECTED',
  hardRejected: 'STORY_HARD_REJECTED',
  cmsDrafts: 'PUBLICATION_SUCCEEDED',
} as const;

export interface SourceAccessRows {
  fetchOutcomes: Array<{ outcome: string; count: number }>;
  blocked: Array<{ outcome: string | null; count: number }>;
  expansion: Array<{ type: string; count: number; added: number | null; recovered: number | null }>;
  events: Array<{ type: string; count: number }>;
}

/** Pure: turns the grouped rows into the dashboard summary. */
export function summariseSourceAccess(rows: SourceAccessRows, window: { minutes: number; since: Date }): SourceAccessSummary {
  const byOutcome: Record<string, number> = {};
  for (const row of rows.fetchOutcomes) {
    byOutcome[row.outcome] = (byOutcome[row.outcome] ?? 0) + Number(row.count);
  }
  const pick = (key: string) => byOutcome[key] ?? 0;
  const total = Object.values(byOutcome).reduce((sum, count) => sum + count, 0);
  const known = pick('SUCCESS') + pick('HTTP_403') + pick('HTTP_404') + pick('HTTP_429') + pick('HTTP_5XX') + pick('TIMEOUT');

  const blockedByOutcome: Record<string, number> = {};
  for (const row of rows.blocked) {
    const key = row.outcome ?? 'UNKNOWN';
    blockedByOutcome[key] = (blockedByOutcome[key] ?? 0) + Number(row.count);
  }

  const expansionOf = (type: string) => rows.expansion.find(row => row.type === type);
  const completed = expansionOf('SOURCE_EXPANSION_COMPLETED');

  const eventCount = (type: string) => Number(rows.events.find(row => row.type === type)?.count ?? 0);

  return {
    window: { minutes: window.minutes, since: window.since.toISOString() },
    fetches: {
      total,
      success: pick('SUCCESS'),
      http403: pick('HTTP_403'),
      http404: pick('HTTP_404'),
      http429: pick('HTTP_429'),
      http5xx: pick('HTTP_5XX'),
      timeout: pick('TIMEOUT'),
      other: total - known,
      byOutcome,
    },
    leadsBlocked: {
      total: Object.values(blockedByOutcome).reduce((sum, count) => sum + count, 0),
      byOutcome: blockedByOutcome,
    },
    expansion: {
      started: Number(expansionOf('SOURCE_EXPANSION_STARTED')?.count ?? 0),
      completed: Number(completed?.count ?? 0),
      sourcesAdded: Number(completed?.added ?? 0),
      recovered: Number(completed?.recovered ?? 0),
    },
    outcomes: {
      writingStarted: eventCount(OUTCOME_EVENTS.writingStarted),
      editorPassed: eventCount(OUTCOME_EVENTS.editorPassed),
      rewriteRequired: eventCount(OUTCOME_EVENTS.rewriteRequired),
      editorRejected: eventCount(OUTCOME_EVENTS.editorRejected),
      hardRejected: eventCount(OUTCOME_EVENTS.hardRejected),
      cmsDrafts: eventCount(OUTCOME_EVENTS.cmsDrafts),
    },
  };
}
