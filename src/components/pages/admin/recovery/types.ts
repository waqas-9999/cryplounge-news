/**
 * Wire types for the editorial recovery endpoints (`admin/ai/newsroom/...`).
 *
 * Kept loose where the newsroom stores JSON: the inspector renders what was
 * recorded and never invents a field that is absent.
 */

export type RecoveryAction = 'ADVANCE_TO_RESEARCH' | 'REQUIRE_REWRITE' | 'RETRY' | 'DISMISS';

export interface Unavailable {
  available: false;
  reason: string;
}

export interface AssistResult {
  score: number;
  band: 'STRONG' | 'POSSIBLE' | 'WEAK' | 'HARD_REJECTION';
  factors: string[];
}

export interface PipelineHealth {
  available: true;
  window: { key: string; minutes: number; since: string };
  states: Record<string, number>;
  decisionClasses: Array<{ decisionClass: string; count: number; recoverable: number }>;
  codes: Array<{ code: string; decisionClass: string; count: number }>;
  jobs: { byStatus: Record<string, number>; oldestWaitingMinutes: number | null };
  drafts: Record<string, number>;
  editor: { reviews: number; invalid: number; verdicts: Record<string, number> };
  bottleneck: { kind: string; label: string; count: number } | null;
}

export interface SourceAccessSummary {
  window: { minutes: number; since: string };
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
  leadsBlocked: { total: number; byOutcome: Record<string, number> };
  expansion: { started: number; completed: number; sourcesAdded: number; recovered: number };
  outcomes: {
    writingStarted: number;
    editorPassed: number;
    rewriteRequired: number;
    editorRejected: number;
    hardRejected: number;
    cmsDrafts: number;
  };
}

export type HealthResponse = (PipelineHealth | Unavailable) & {
  pendingRecoveries: number;
  /** From CMS telemetry, so present even when the newsroom database is not. */
  sourceAccess?: SourceAccessSummary | Unavailable;
};

export interface DecisionItem {
  clusterId: string;
  title: string;
  state: string;
  stateCode: string | null;
  stateReason: string | null;
  decisionClass: string | null;
  recoverable: boolean;
  rewriteCount: number;
  stateChangedAt: string | null;
  pipelineVersion: string | null;
  category: string | null;
  discoveryScore: number | null;
  research: { sources: number; primarySources: number; claims: number; verified: number; partiallyVerified: number } | null;
  assist: AssistResult;
}

export type DecisionsResponse =
  | { available: true; items: DecisionItem[]; total: number; page: number; perPage: number; totalPages: number }
  | Unavailable;

export interface RecoveryRequest {
  id: string;
  clusterId: string;
  action: RecoveryAction;
  status: 'PENDING' | 'QUEUED' | 'APPLIED' | 'REJECTED';
  reason: string;
  note: string | null;
  previousState: string | null;
  previousStateCode: string | null;
  requestedState: string;
  requestedByEmail: string | null;
  ackDetail: string | null;
  jobId: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

type Loose = Record<string, unknown>;

export interface StoryInspection {
  available: true;
  cluster: {
    id: string;
    title: string;
    summary: string | null;
    state: string;
    stateCode: string | null;
    stateReason: string | null;
    decisionClass: string | null;
    recoverable: boolean;
    rewriteCount: number;
    pipelineVersion: string | null;
    entities: string[];
    topics: string[];
    trendScore: number;
    stateChangedAt: string | null;
    createdAt: string;
  };
  discovery: {
    score: number;
    freshness: string;
    category: string | null;
    status: string;
    statusReasons: string[];
    sources: Array<{ domain: string; url: string; isPrimary: boolean; discoveryOnly: boolean }>;
  } | null;
  research: {
    report: Loose;
    sources: Loose[];
    claims: Array<Loose & { evidence: Loose[] }>;
  } | null;
  drafts: Array<Loose & { reviews: Loose[]; factChecks: Loose[]; qualityScores: Loose[] }>;
  jobs: Loose[];
  assist: AssistResult;
  unavailableSections: Array<{ section: string; reason: string }>;
  recoveries: RecoveryRequest[];
  events: Array<{ id: string; type: string; stage: string | null; status: string | null; metadata: unknown; occurredAt: string }>;
}

export type StoryResponse = StoryInspection | Unavailable;

export const DECISION_CLASS_META: Record<string, { label: string; hint: string; tone: string }> = {
  DISCOVERY: { label: 'Discovery', hint: 'Screened out before research', tone: 'bg-slate-500' },
  RESEARCH: { label: 'Research', hint: 'Research could not establish the story', tone: 'bg-cyan-600' },
  WRITING: { label: 'Writing', hint: 'Validation or originality failed after writing', tone: 'bg-amber-500' },
  EDITORIAL: { label: 'Editorial', hint: 'The AI editor refused after bounded rewrites', tone: 'bg-rose-500' },
  SYSTEM: { label: 'System', hint: 'Timeouts, unreadable responses, CMS outages — not editorial judgements', tone: 'bg-violet-500' },
};

export const ACTION_META: Record<RecoveryAction, { label: string; explain: string; danger?: boolean }> = {
  ADVANCE_TO_RESEARCH: {
    label: 'Advance to research',
    explain:
      'Queues the story for the full pipeline: research, writing, the AI editor, fact check, originality and every ' +
      'submission gate run again. Nothing is approved or published; a story that clears every gate becomes a CMS draft.',
  },
  REQUIRE_REWRITE: {
    label: 'Require rewrite',
    explain:
      'Runs the pipeline again with a fresh, bounded editorial rewrite budget. Research is re-verified rather than ' +
      'reused, and every gate still applies.',
  },
  RETRY: {
    label: 'Retry',
    explain:
      'Re-arms the failed, stalled or retryable job with one more attempt. Use this for system failures — a timeout, ' +
      'an unreadable editor response, a CMS outage.',
  },
  DISMISS: {
    label: 'Dismiss permanently',
    explain:
      'A hard rejection. The newsroom stops considering this story and cancels any pending work for it. It can be ' +
      'reopened later only by another explicit, audited request.',
    danger: true,
  },
};
