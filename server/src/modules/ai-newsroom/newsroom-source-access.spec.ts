import { recoveryAssist } from './newsroom-recovery.assist';
import { summariseSourceAccess } from './newsroom-source-access';

/**
 * The dashboard's source-access panel keeps problems apart.
 *
 * A publisher's 403, a rate limit, a story research could not support and an
 * editor's refusal have different fixes, and used to be shown as one
 * "rejected" figure.
 */
describe('summariseSourceAccess', () => {
  const since = new Date('2026-09-14T00:00:00Z');

  it('breaks article-page requests down by outcome', () => {
    const summary = summariseSourceAccess(
      {
        fetchOutcomes: [
          { outcome: 'SUCCESS', count: 40 },
          { outcome: 'HTTP_403', count: 6 },
          { outcome: 'HTTP_404', count: 1 },
          { outcome: 'HTTP_429', count: 2 },
          { outcome: 'HTTP_5XX', count: 1 },
          { outcome: 'TIMEOUT', count: 3 },
          { outcome: 'EMPTY_EXTRACTION', count: 2 },
          { outcome: 'HTTP_403', count: 1 },
        ],
        blocked: [
          { outcome: 'HTTP_403', count: 5 },
          { outcome: null, count: 1 },
        ],
        expansion: [
          { type: 'SOURCE_EXPANSION_STARTED', count: 6, added: 0, recovered: 0 },
          { type: 'SOURCE_EXPANSION_COMPLETED', count: 6, added: 4, recovered: 3 },
        ],
        events: [
          { type: 'WRITING_STARTED', count: 12 },
          { type: 'EDITOR_PASSED', count: 8 },
          { type: 'REWRITE_REQUIRED', count: 5 },
          { type: 'STORY_HARD_REJECTED', count: 1 },
          { type: 'PUBLICATION_SUCCEEDED', count: 7 },
        ],
      },
      { minutes: 1440, since }
    );

    expect(summary.fetches).toMatchObject({
      total: 56,
      success: 40,
      http403: 7,
      http404: 1,
      http429: 2,
      http5xx: 1,
      timeout: 3,
      other: 2,
    });
    expect(summary.leadsBlocked).toEqual({ total: 6, byOutcome: { HTTP_403: 5, UNKNOWN: 1 } });
    expect(summary.expansion).toEqual({ started: 6, completed: 6, sourcesAdded: 4, recovered: 3 });
    expect(summary.outcomes).toEqual({
      writingStarted: 12,
      editorPassed: 8,
      rewriteRequired: 5,
      editorRejected: 0,
      hardRejected: 1,
      cmsDrafts: 7,
    });
  });

  it('reports an empty window as zeros, not as missing data', () => {
    const summary = summariseSourceAccess(
      { fetchOutcomes: [], blocked: [], expansion: [], events: [] },
      { minutes: 360, since }
    );
    expect(summary.fetches.total).toBe(0);
    expect(summary.expansion.started).toBe(0);
    expect(summary.window).toEqual({ minutes: 360, since: since.toISOString() });
  });
});

describe('recovery assist and blocked sources', () => {
  const base = {
    discoveryScore: 70,
    decisionClass: 'RESEARCH',
    recoverable: true,
    rewriteCount: 0,
    research: null,
  };

  it('ranks a story whose publisher refused the page above one research could not support', () => {
    const blocked = recoveryAssist({ ...base, stateCode: 'SOURCE_BLOCKED' });
    const insufficient = recoveryAssist({ ...base, stateCode: 'INSUFFICIENT_EVIDENCE' });
    expect(blocked.score).toBeGreaterThan(insufficient.score);
    expect(blocked.factors.join(' ')).toMatch(/refused the page/);
  });

  it('never ranks a hard rejection', () => {
    expect(recoveryAssist({ ...base, stateCode: 'HARD_REJECT', recoverable: false })).toMatchObject({
      score: 0,
      band: 'HARD_REJECTION',
    });
  });
});
