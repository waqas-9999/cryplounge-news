import type { DiscoveryStory } from './newsroom-discovery.service';
import { publisherBase, type NewsRegion, type PublisherBase } from './publisher-bases';

/**
 * The newsroom intelligence read model.
 *
 * ## A view over what already exists, not a second pipeline
 *
 * Nothing here is stored. Every story, stage and reason is derived on read
 * from two records the system already keeps:
 *
 *  - **NewsroomEvent** — the telemetry the newsroom emits as a story moves.
 *  - **Discovery records** — the newsroom's own row per story: title,
 *    category, sources and final outcome.
 *
 * Both are keyed by `clusterId`, which is the join.
 *
 * ## The stage vocabulary is the newsroom's, not invented for a picture
 *
 * The newsroom does not emit a separate event for fact checking, quality review
 * or clustering a story. Fact check and quality run inside one pipeline step
 * whose scores arrive together on `ARTICLE_VALIDATED`, so they are one stage
 * here — VERIFICATION — rather than two stages whose boundary nobody observed.
 * Clustering happens per cycle, not per story, and is reported as a cycle
 * count. A UI that showed a story "in QUALITY" would be drawing a state the
 * system never recorded.
 *
 * Pure functions, so the mapping is testable without a database.
 */

export const PIPELINE_STAGES = [
  'DISCOVERED',
  'RESEARCH',
  'VERIFICATION',
  'IMAGE',
  'FILING',
  'DRAFT',
  'PUBLISHED',
  'HELD',
  'REJECTED',
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Stages a story is still moving through. */
export const ACTIVE_STAGES: readonly PipelineStage[] = ['DISCOVERED', 'RESEARCH', 'VERIFICATION', 'IMAGE', 'FILING'];

/** Where a rejected story stopped. */
export type RejectionPoint = 'DISCOVERY' | 'RESEARCH' | 'WRITING' | 'VERIFICATION' | 'FILING';

export type RejectionKind =
  | 'DUPLICATE'
  | 'OFF_TOPIC'
  | 'WEAK_EVIDENCE'
  | 'RESEARCH'
  | 'FACT_CHECK'
  | 'QUALITY'
  | 'ORIGINALITY'
  | 'WRITING_ERROR'
  | 'FILING_ERROR'
  | 'OTHER';

export interface TelemetryRow {
  id: string;
  type: string;
  occurredAt: Date;
  workflowId: string | null;
  clusterId: string | null;
  articleId: string | null;
  stage: string | null;
  status: string | null;
  source: string | null;
  model: string | null;
  durationMs: number | null;
  metadata: unknown;
}

export interface IntelStory {
  clusterId: string;
  /** Null when telemetry mentions a cluster the discovery records do not hold. */
  title: string | null;
  category: string | null;
  score: number | null;
  stage: PipelineStage;
  rejection: { at: RejectionPoint; kind: RejectionKind; reasons: string[]; occurredAt: string } | null;
  heldReasons: string[];
  leadDomain: string | null;
  sourceDomains: string[];
  sourceCount: number;
  /** Where the lead source is based. Null when that is not established. */
  base: PublisherBase | null;
  /** Other places this story's sources are based: real corroboration links. */
  linkedBases: PublisherBase[];
  articleId: string | null;
  factCheckScore: number | null;
  qualityScore: number | null;
  firstSeenAt: string;
  lastActivityAt: string;
  /** Model named by this story's most recent RESEARCH_STARTED event. */
  model: string | null;
  /**
   * Every recorded event for this story in the window, oldest first.
   *
   * Built from all telemetry the snapshot read, not from the 150-event stream,
   * so an early step is never missing just because the stream moved on. A
   * stage that did not happen has no entry.
   */
  timeline: IntelEvent[];
  /** True when the timeline was capped at MAX_TIMELINE_EVENTS. */
  timelineTruncated: boolean;
}

export interface IntelLocation extends PublisherBase {
  storyCount: number;
  stages: Partial<Record<PipelineStage, number>>;
  categories: Partial<Record<string, number>>;
  lastActivityAt: string;
  /** Story ids, most recent activity first. */
  clusterIds: string[];
}

export type EventTone = 'progress' | 'pass' | 'fail' | 'system';

export interface IntelEvent {
  id: string;
  type: string;
  label: string;
  tone: EventTone;
  occurredAt: string;
  clusterId: string | null;
  title: string | null;
  detail: string | null;
  stage: PipelineStage | null;
}

export type NewsroomState = 'CYCLING' | 'SLEEPING' | 'SILENT';

export interface IntelSnapshot {
  generatedAt: string;
  window: { key: IntelWindowKey; minutes: number; since: string };
  totals: {
    stories: number;
    active: number;
    drafts: number;
    published: number;
    rejected: number;
    held: number;
    unmapped: number;
    clustersFormed: number;
    events: number;
  };
  stages: Record<PipelineStage, number>;
  system: {
    state: NewsroomState;
    lastEventAt: string | null;
    nextCycleAt: string | null;
    errorsInWindow: number;
    discovery: { available: boolean; reason?: string };
  };
  locations: IntelLocation[];
  stories: IntelStory[];
  events: IntelEvent[];
  /**
   * Movement, not inventory: stage transitions counted from event timestamps
   * across every telemetry row in the window.
   */
  activity: {
    /** Equal slices across the window, oldest first. */
    buckets: Array<{ start: string; stages: Partial<Record<PipelineStage, number>> }>;
    bucketMinutes: number;
    /** Transitions in the most recent `recentMinutes` (15, or the whole window if shorter). */
    recent: Partial<Record<PipelineStage, number>>;
    recentMinutes: number;
    /** Latest transition into each stage. */
    lastByStage: Partial<Record<PipelineStage, string>>;
  };
  /** The cycle in progress, when the newsroom's own lifecycle events show one. */
  cycle: { startedAt: string | null; lastCompletedAt: string | null };
}

/** Per-story timeline cap. A story emits roughly ten events end to end. */
export const MAX_TIMELINE_EVENTS = 40;
export const ACTIVITY_BUCKETS = 12;

export const INTEL_WINDOWS = { live: 60, '5m': 5, '30m': 30, '1h': 60, '24h': 1440 } as const;
export type IntelWindowKey = keyof typeof INTEL_WINDOWS;

/* ------------------------------------------------------------ helpers -- */

function meta(row: TelemetryRow): Record<string, unknown> {
  return row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? (row.metadata as Record<string, unknown>)
    : {};
}

function reasonsOf(row: TelemetryRow): string[] {
  const value = meta(row).reasons;
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function numberOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Same wording test the newsroom's own funnel uses (`classifyRejection`). */
export function classifyReasons(reasons: string[]): RejectionKind {
  const text = reasons.join(' ').toLowerCase();
  if (/fact[- ]?check|unverified claim|factual/.test(text)) return 'FACT_CHECK';
  if (/originality|reused source wording|reproduced source wording|copied|verbatim/.test(text)) return 'ORIGINALITY';
  if (/quality/.test(text)) return 'QUALITY';
  return 'OTHER';
}

const RANK: Record<PipelineStage, number> = {
  DISCOVERED: 1,
  RESEARCH: 2,
  VERIFICATION: 3,
  IMAGE: 4,
  FILING: 5,
  DRAFT: 6,
  PUBLISHED: 7,
  HELD: 8,
  REJECTED: 9,
};

const TERMINAL = new Set<PipelineStage>(['DRAFT', 'PUBLISHED', 'HELD', 'REJECTED']);

interface Transition {
  stage: PipelineStage;
  rejection?: { at: RejectionPoint; kind: RejectionKind; reasons: string[] };
  held?: string[];
}

/**
 * What one telemetry event says about its story's stage. Null for events that
 * say nothing about a story's position (cycle events, routing notes).
 */
export function transitionFor(row: TelemetryRow): Transition | null {
  const m = meta(row);
  switch (row.type) {
    case 'STORY_DISCOVERED':
      return { stage: 'DISCOVERED' };
    case 'RESEARCH_STARTED':
      return { stage: 'RESEARCH' };
    case 'ARTICLE_VALIDATED':
      // The same event is emitted twice: once with the check scores, once
      // with the banner outcome. The second means the image stage ran.
      return {
        stage: m.bannerStatus !== undefined || m.bannerProvider !== undefined || m.bannerSkipped !== undefined
          ? 'IMAGE'
          : 'VERIFICATION',
      };
    case 'VISUAL_DECISION':
      return { stage: 'IMAGE' };
    case 'PUBLICATION_STARTED':
      return { stage: 'FILING' };
    case 'PUBLICATION_SUCCEEDED':
      return { stage: m.autoPublished === true || row.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT' };
    case 'PUBLICATION_FAILED':
      // An article that exists but was held from promotion is a draft; that
      // is the configured mode working. Without an article, filing failed.
      if (row.articleId) return { stage: 'DRAFT' };
      return {
        stage: 'REJECTED',
        rejection: {
          at: 'FILING',
          kind: 'FILING_ERROR',
          reasons: [typeof m.errorClass === 'string' ? `Filing failed: ${m.errorClass}` : 'Filing to the CMS failed'],
        },
      };
    case 'PUBLICATION_SKIPPED':
      return { stage: 'HELD', held: reasonsOf(row) };
    case 'RESEARCH_FAILED':
      return { stage: 'REJECTED', rejection: { at: 'RESEARCH', kind: 'RESEARCH', reasons: reasonsOf(row) } };
    case 'WRITING_FAILED':
      return {
        stage: 'REJECTED',
        rejection: {
          at: 'WRITING',
          kind: 'WRITING_ERROR',
          reasons: [typeof m.error === 'string' ? m.error : 'Writing failed'],
        },
      };
    case 'ARTICLE_REJECTED': {
      const reasons = reasonsOf(row);
      return { stage: 'REJECTED', rejection: { at: 'VERIFICATION', kind: classifyReasons(reasons), reasons } };
    }
    default:
      return null;
  }
}

/** What a discovery record's final outcome says, for stories telemetry did not cover. */
export function transitionForOutcome(story: DiscoveryStory): Transition {
  const reasons = story.statusReasons;
  switch (story.status) {
    case 'DUPLICATE':
      return { stage: 'REJECTED', rejection: { at: 'DISCOVERY', kind: 'DUPLICATE', reasons } };
    case 'OFF_TOPIC':
      return { stage: 'REJECTED', rejection: { at: 'DISCOVERY', kind: 'OFF_TOPIC', reasons } };
    case 'WEAK_EVIDENCE':
      return { stage: 'REJECTED', rejection: { at: 'DISCOVERY', kind: 'WEAK_EVIDENCE', reasons } };
    case 'RESEARCH_FAILED':
      return { stage: 'REJECTED', rejection: { at: 'RESEARCH', kind: 'RESEARCH', reasons } };
    case 'REJECTED':
      return { stage: 'REJECTED', rejection: { at: 'VERIFICATION', kind: classifyReasons(reasons), reasons } };
    case 'NOT_SELECTED':
      return { stage: 'HELD', held: reasons };
    case 'CMS_DRAFT_CREATED':
      return { stage: 'DRAFT' };
    default:
      return { stage: 'DISCOVERED' };
  }
}

const EVENT_LABELS: Record<string, { label: string; tone: EventTone }> = {
  STORY_DISCOVERED: { label: 'Story discovered', tone: 'progress' },
  RESEARCH_STARTED: { label: 'Research started', tone: 'progress' },
  ARTICLE_VALIDATED: { label: 'Checks passed', tone: 'pass' },
  VISUAL_DECISION: { label: 'Image chosen', tone: 'progress' },
  PUBLICATION_STARTED: { label: 'Filing to CMS', tone: 'progress' },
  PUBLICATION_SUCCEEDED: { label: 'Filed', tone: 'pass' },
  PUBLICATION_FAILED: { label: 'Filing held', tone: 'fail' },
  PUBLICATION_SKIPPED: { label: 'Not filed', tone: 'system' },
  RESEARCH_FAILED: { label: 'Research failed', tone: 'fail' },
  WRITING_FAILED: { label: 'Writing failed', tone: 'fail' },
  ARTICLE_REJECTED: { label: 'Rejected', tone: 'fail' },
  CLUSTER_CREATED: { label: 'Clusters formed', tone: 'system' },
  NEWSROOM_CYCLE_STARTED: { label: 'Cycle started', tone: 'system' },
  NEWSROOM_CYCLE_COMPLETED: { label: 'Cycle completed', tone: 'system' },
  NEWSROOM_SLEEPING: { label: 'Newsroom sleeping', tone: 'system' },
  NEWSROOM_ERROR: { label: 'Newsroom error', tone: 'fail' },
  DISCOVERY_STARTED: { label: 'Discovery started', tone: 'system' },
};

function linkedBasesOf(lead: string | null, domains: string[]): PublisherBase[] {
  const leadKey = publisherBase(lead)?.key;
  const seen = new Map<string, PublisherBase>();
  for (const domain of domains) {
    const base = publisherBase(domain);
    if (base && base.key !== leadKey) seen.set(base.key, base);
  }
  return [...seen.values()];
}

/* --------------------------------------------------------------- build -- */

export function buildSnapshot(input: {
  now: Date;
  windowKey: IntelWindowKey;
  events: TelemetryRow[];
  discovery: { stories: DiscoveryStory[]; available: boolean; reason?: string };
}): IntelSnapshot {
  const { now, windowKey } = input;
  const minutes = INTEL_WINDOWS[windowKey];
  const since = new Date(now.getTime() - minutes * 60_000);

  // Oldest first, so later events overwrite earlier ones.
  const events = [...input.events].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  const records = new Map(input.discovery.stories.map(story => [story.clusterId, story]));

  interface Draft {
    fromEvents: Transition | null;
    firstSeen: number;
    lastActivity: number;
    articleId: string | null;
    factCheckScore: number | null;
    qualityScore: number | null;
    rejectedAt: number | null;
    title: string | null;
    model: string | null;
    rows: TelemetryRow[];
  }
  const drafts = new Map<string, Draft>();

  const draftFor = (clusterId: string, at: number): Draft => {
    let draft = drafts.get(clusterId);
    if (!draft) {
      draft = {
        fromEvents: null,
        firstSeen: at,
        lastActivity: at,
        articleId: null,
        factCheckScore: null,
        qualityScore: null,
        rejectedAt: null,
        title: null,
        model: null,
        rows: [],
      };
      drafts.set(clusterId, draft);
    }
    return draft;
  };

  for (const row of events) {
    if (!row.clusterId) continue;
    const at = row.occurredAt.getTime();
    const draft = draftFor(row.clusterId, at);
    draft.lastActivity = Math.max(draft.lastActivity, at);
    draft.firstSeen = Math.min(draft.firstSeen, at);
    if (row.articleId) draft.articleId = row.articleId;

    const m = meta(row);
    draft.factCheckScore = numberOf(m.factCheckScore) ?? draft.factCheckScore;
    draft.qualityScore = numberOf(m.qualityScore) ?? draft.qualityScore;
    if (typeof m.title === 'string') draft.title = m.title;
    if (row.type === 'RESEARCH_STARTED' && row.model) draft.model = row.model;
    draft.rows.push(row);

    const next = transitionFor(row);
    if (!next) continue;
    const current = draft.fromEvents;
    // A story never moves backwards: a late-arriving start event must not
    // undo a finish, and a terminal state stays terminal.
    if (!current || (!TERMINAL.has(current.stage) && RANK[next.stage] >= RANK[current.stage]) || TERMINAL.has(next.stage)) {
      draft.fromEvents = next;
      if (next.stage === 'REJECTED') draft.rejectedAt = at;
    }
  }

  // Discovery records in the window, even with no telemetry, are stories too.
  for (const story of input.discovery.stories) {
    const at = new Date(story.recordedAt).getTime();
    if (at < since.getTime() && !drafts.has(story.clusterId)) continue;
    draftFor(story.clusterId, at);
  }

  const stories: IntelStory[] = [];
  for (const [clusterId, draft] of drafts) {
    const record = records.get(clusterId);
    const outcome = record ? transitionForOutcome(record) : null;

    // Telemetry wins while it is more specific. A terminal outcome in the
    // discovery record wins over a non-terminal telemetry stage, because
    // some events are filtered from delivery and the record is final.
    let chosen: Transition = draft.fromEvents ?? outcome ?? { stage: 'DISCOVERED' };
    if (outcome && TERMINAL.has(outcome.stage) && !TERMINAL.has(chosen.stage)) chosen = outcome;

    const domains = record ? [...new Set(record.sources.map(source => source.domain).filter(Boolean))] : [];
    const lead =
      record?.sources.find(source => source.isPrimary && !source.discoveryOnly)?.domain ??
      record?.sources.find(source => !source.discoveryOnly)?.domain ??
      domains[0] ??
      null;

    stories.push({
      clusterId,
      title: record?.title ?? draft.title,
      category: record?.category ?? null,
      score: record ? record.score : null,
      stage: chosen.stage,
      rejection: chosen.rejection
        ? {
            ...chosen.rejection,
            occurredAt: new Date(draft.rejectedAt ?? draft.lastActivity).toISOString(),
          }
        : null,
      heldReasons: chosen.held ?? [],
      leadDomain: lead,
      sourceDomains: domains,
      sourceCount: record?.sourceCount ?? 0,
      base: publisherBase(lead),
      linkedBases: linkedBasesOf(lead, domains),
      articleId: draft.articleId ?? record?.cmsArticleId ?? null,
      factCheckScore: draft.factCheckScore,
      qualityScore: draft.qualityScore,
      firstSeenAt: new Date(draft.firstSeen).toISOString(),
      lastActivityAt: new Date(draft.lastActivity).toISOString(),
      model: draft.model,
      // Filled below, once titles are known.
      timeline: [],
      timelineTruncated: false,
    });
  }

  stories.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  /* ---------------------------------------------------------- locations -- */
  const locations = new Map<string, IntelLocation>();
  let unmapped = 0;
  for (const story of stories) {
    if (!story.base) {
      unmapped += 1;
      continue;
    }
    let location = locations.get(story.base.key);
    if (!location) {
      location = { ...story.base, storyCount: 0, stages: {}, categories: {}, lastActivityAt: story.lastActivityAt, clusterIds: [] };
      locations.set(story.base.key, location);
    }
    location.storyCount += 1;
    location.stages[story.stage] = (location.stages[story.stage] ?? 0) + 1;
    if (story.category) location.categories[story.category] = (location.categories[story.category] ?? 0) + 1;
    if (story.lastActivityAt > location.lastActivityAt) location.lastActivityAt = story.lastActivityAt;
    location.clusterIds.push(story.clusterId);
  }

  /* ------------------------------------------------------------- totals -- */
  const stageCounts = Object.fromEntries(PIPELINE_STAGES.map(stage => [stage, 0])) as Record<PipelineStage, number>;
  for (const story of stories) stageCounts[story.stage] += 1;

  const clustersFormed = events
    .filter(row => row.type === 'CLUSTER_CREATED')
    .reduce((sum, row) => sum + (numberOf(meta(row).count) ?? 0), 0);

  /* ------------------------------------------------------------- system -- */
  const latestOf = (types: string[]) => [...events].reverse().find(row => types.includes(row.type)) ?? null;
  const lifecycle = latestOf(['NEWSROOM_CYCLE_STARTED', 'NEWSROOM_CYCLE_COMPLETED', 'NEWSROOM_SLEEPING']);
  const lastEvent = events.at(-1) ?? null;
  const nextCycleRaw = lifecycle?.type === 'NEWSROOM_SLEEPING' ? meta(lifecycle).nextCycleAt : null;
  const nextCycleAt = typeof nextCycleRaw === 'string' ? nextCycleRaw : null;

  let state: NewsroomState = 'SILENT';
  if (lifecycle?.type === 'NEWSROOM_SLEEPING' && nextCycleAt) {
    // Sleeping is only believable until a while after it said it would wake.
    const overdue = now.getTime() - new Date(nextCycleAt).getTime();
    state = overdue < 10 * 60_000 ? 'SLEEPING' : 'SILENT';
  } else if (lastEvent && now.getTime() - lastEvent.occurredAt.getTime() < 15 * 60_000) {
    state = 'CYCLING';
  }

  /* ------------------------------------------------------------- stream -- */
  const titles = new Map(stories.map(story => [story.clusterId, story.title]));
  const stream: IntelEvent[] = [];
  for (let i = events.length - 1; i >= 0 && stream.length < 150; i -= 1) {
    const labelled = labelEvent(events[i]!, titles);
    if (labelled) stream.push(labelled);
  }

  /* ---------------------------------------------------------- timelines -- */
  for (const story of stories) {
    const rows = drafts.get(story.clusterId)?.rows ?? [];
    const labelled = rows
      .map(row => labelEvent(row, titles))
      .filter((event): event is IntelEvent => event !== null);
    story.timelineTruncated = labelled.length > MAX_TIMELINE_EVENTS;
    // Keep the newest when capped: the current state is what an editor is checking.
    story.timeline = labelled.slice(-MAX_TIMELINE_EVENTS);
  }

  /* ----------------------------------------------------------- activity -- */
  const bucketMs = (minutes * 60_000) / ACTIVITY_BUCKETS;
  const buckets = Array.from({ length: ACTIVITY_BUCKETS }, (_, i) => ({
    start: new Date(since.getTime() + i * bucketMs).toISOString(),
    stages: {} as Partial<Record<PipelineStage, number>>,
  }));
  const recentMinutes = Math.min(15, minutes);
  const recentSince = now.getTime() - recentMinutes * 60_000;
  const recent: Partial<Record<PipelineStage, number>> = {};
  const lastByStage: Partial<Record<PipelineStage, string>> = {};

  for (const row of events) {
    const transition = transitionFor(row);
    if (!transition) continue;
    const at = row.occurredAt.getTime();
    const index = Math.min(ACTIVITY_BUCKETS - 1, Math.max(0, Math.floor((at - since.getTime()) / bucketMs)));
    const bucket = buckets[index]!;
    bucket.stages[transition.stage] = (bucket.stages[transition.stage] ?? 0) + 1;
    if (at >= recentSince) recent[transition.stage] = (recent[transition.stage] ?? 0) + 1;
    lastByStage[transition.stage] = row.occurredAt.toISOString();
  }

  const lastCompleted = latestOf(['NEWSROOM_CYCLE_COMPLETED']);

  return {
    generatedAt: now.toISOString(),
    window: { key: windowKey, minutes, since: since.toISOString() },
    totals: {
      stories: stories.length,
      active: ACTIVE_STAGES.reduce((sum, stage) => sum + stageCounts[stage], 0),
      drafts: stageCounts.DRAFT,
      published: stageCounts.PUBLISHED,
      rejected: stageCounts.REJECTED,
      held: stageCounts.HELD,
      unmapped,
      clustersFormed,
      events: events.length,
    },
    stages: stageCounts,
    system: {
      state,
      lastEventAt: lastEvent?.occurredAt.toISOString() ?? null,
      nextCycleAt: state === 'SLEEPING' ? nextCycleAt : null,
      errorsInWindow: events.filter(row => row.type === 'NEWSROOM_ERROR').length,
      discovery: { available: input.discovery.available, reason: input.discovery.reason },
    },
    locations: [...locations.values()].sort((a, b) => b.storyCount - a.storyCount),
    stories,
    events: stream,
    activity: {
      buckets,
      bucketMinutes: minutes / ACTIVITY_BUCKETS,
      recent,
      recentMinutes,
      lastByStage,
    },
    cycle: {
      // A cycle is in progress only while its start is the newest lifecycle event.
      startedAt: lifecycle?.type === 'NEWSROOM_CYCLE_STARTED' ? lifecycle.occurredAt.toISOString() : null,
      lastCompletedAt: lastCompleted?.occurredAt.toISOString() ?? null,
    },
  };
}

/** One telemetry row as a displayable event, or null for rows that are not shown. */
function labelEvent(row: TelemetryRow, titles: Map<string, string | null>): IntelEvent | null {
  const known = EVENT_LABELS[row.type];
  if (!known) return null;
  // Cycle-level cluster notes without a count are planning chatter.
  if (row.type === 'CLUSTER_CREATED' && numberOf(meta(row).count) === null) return null;

  const transition = transitionFor(row);
  const reasons = reasonsOf(row);
  const m = meta(row);
  let detail: string | null = reasons[0] ?? null;
  if (row.type === 'CLUSTER_CREATED') detail = `${numberOf(m.count)} clusters`;
  if (row.type === 'ARTICLE_VALIDATED' && numberOf(m.factCheckScore) !== null) {
    detail = `Fact ${numberOf(m.factCheckScore)} · Quality ${numberOf(m.qualityScore) ?? '—'}`;
  }
  if (row.type === 'RESEARCH_STARTED' && row.model) detail = row.model;
  if (row.type === 'STORY_DISCOVERED' && !detail && row.source) detail = row.source;

  let label = known.label;
  if (row.type === 'PUBLICATION_SUCCEEDED') label = transition?.stage === 'PUBLISHED' ? 'Published' : 'Draft created';
  if (row.type === 'ARTICLE_VALIDATED' && transition?.stage === 'IMAGE') label = 'Image stage complete';

  return {
    id: row.id,
    type: row.type,
    label,
    tone: known.tone,
    occurredAt: row.occurredAt.toISOString(),
    clusterId: row.clusterId,
    title: row.clusterId ? titles.get(row.clusterId) ?? null : null,
    detail,
    stage: transition?.stage ?? null,
  };
}

export type { NewsRegion };
