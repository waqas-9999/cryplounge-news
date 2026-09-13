/**
 * Newsroom intelligence — client model.
 *
 * Mirrors `server/src/modules/ai-newsroom/newsroom-intelligence.derive.ts`.
 * The stage vocabulary is the newsroom's own: there is deliberately no
 * separate FACT CHECK or QUALITY stage, because the newsroom runs both in one
 * step and reports their scores together. See the server file for why.
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

export const ACTIVE_STAGES: readonly PipelineStage[] = ['DISCOVERED', 'RESEARCH', 'VERIFICATION', 'IMAGE', 'FILING'];

export type NewsRegion = 'AMERICAS' | 'EUROPE' | 'MIDDLE_EAST' | 'ASIA' | 'OTHER';
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

export interface PublisherBase {
  key: string;
  label: string;
  region: NewsRegion;
  lat: number;
  lon: number;
  basis: 'REGULATOR_JURISDICTION' | 'PUBLISHER_HEADQUARTERS';
}

export interface IntelStory {
  clusterId: string;
  title: string | null;
  category: string | null;
  score: number | null;
  stage: PipelineStage;
  rejection: { at: RejectionPoint; kind: RejectionKind; reasons: string[]; occurredAt: string } | null;
  heldReasons: string[];
  leadDomain: string | null;
  sourceDomains: string[];
  sourceCount: number;
  base: PublisherBase | null;
  linkedBases: PublisherBase[];
  articleId: string | null;
  factCheckScore: number | null;
  qualityScore: number | null;
  firstSeenAt: string;
  lastActivityAt: string;
  model: string | null;
  /** Every recorded event for this story in the window, oldest first. */
  timeline: IntelEvent[];
  timelineTruncated: boolean;
}

export interface IntelLocation extends PublisherBase {
  storyCount: number;
  stages: Partial<Record<PipelineStage, number>>;
  categories: Partial<Record<string, number>>;
  lastActivityAt: string;
  clusterIds: string[];
}

export interface IntelEvent {
  id: string;
  type: string;
  label: string;
  tone: 'progress' | 'pass' | 'fail' | 'system';
  occurredAt: string;
  clusterId: string | null;
  title: string | null;
  detail: string | null;
  stage: PipelineStage | null;
}

export const INTEL_WINDOWS = ['live', '5m', '30m', '1h', '24h'] as const;
export type IntelWindowKey = (typeof INTEL_WINDOWS)[number];

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
    state: 'CYCLING' | 'SLEEPING' | 'SILENT';
    lastEventAt: string | null;
    nextCycleAt: string | null;
    errorsInWindow: number;
    discovery: { available: boolean; reason?: string };
  };
  locations: IntelLocation[];
  stories: IntelStory[];
  events: IntelEvent[];
  activity: {
    buckets: Array<{ start: string; stages: Partial<Record<PipelineStage, number>> }>;
    bucketMinutes: number;
    recent: Partial<Record<PipelineStage, number>>;
    recentMinutes: number;
    lastByStage: Partial<Record<PipelineStage, string>>;
  };
  cycle: { startedAt: string | null; lastCompletedAt: string | null };
}

/* ------------------------------------------------------------ semantics -- */

export const STAGE_META: Record<PipelineStage, { label: string; color: string; hint: string }> = {
  DISCOVERED: { label: 'Discovery', color: '#6E9BF5', hint: 'Found in a feed, awaiting selection' },
  RESEARCH: { label: 'Research', color: '#4FC3D9', hint: 'Sources being read and a draft written' },
  VERIFICATION: { label: 'Fact check · Quality', color: '#E0A33A', hint: 'Fact-check and quality scores recorded' },
  IMAGE: { label: 'Image', color: '#D46FA8', hint: 'Hero image chosen and reviewed' },
  FILING: { label: 'Filing', color: '#9B8CF0', hint: 'Being submitted to the CMS' },
  DRAFT: { label: 'Draft', color: '#C9CDD3', hint: 'In the CMS awaiting an editor' },
  PUBLISHED: { label: 'Published', color: '#4CC38A', hint: 'Live on CrypLounge' },
  HELD: { label: 'Held', color: '#767D88', hint: 'Stopped without an editorial failure — not selected, or filing disabled' },
  REJECTED: { label: 'Rejected', color: '#E5605A', hint: 'Failed a gate; the reason is recorded' },
};

export const REJECTION_LABEL: Record<RejectionKind, string> = {
  DUPLICATE: 'Duplicate story',
  OFF_TOPIC: 'Outside the crypto beat',
  WEAK_EVIDENCE: 'Insufficient source quality',
  RESEARCH: 'Research could not establish the story',
  FACT_CHECK: 'Fact confidence below threshold',
  QUALITY: 'Quality gate failed',
  ORIGINALITY: 'Too close to source wording',
  WRITING_ERROR: 'Writing step errored',
  FILING_ERROR: 'Filing to the CMS failed',
  OTHER: 'Publication gate refused it',
};

export const REJECTION_POINT_LABEL: Record<RejectionPoint, string> = {
  DISCOVERY: 'Discovery',
  RESEARCH: 'Research',
  WRITING: 'Writing',
  VERIFICATION: 'Fact check · Quality',
  FILING: 'Filing',
};

export const REGION_LABEL: Record<NewsRegion | 'GLOBAL', string> = {
  GLOBAL: 'Global',
  AMERICAS: 'Americas',
  EUROPE: 'Europe',
  MIDDLE_EAST: 'Middle East',
  ASIA: 'Asia',
  OTHER: 'Other',
};

/** Most advanced stage present at a location, preferring stories still moving. */
export function dominantStage(stages: Partial<Record<PipelineStage, number>>): PipelineStage {
  let best: PipelineStage = 'DISCOVERED';
  let bestCount = -1;
  for (const stage of PIPELINE_STAGES) {
    const count = stages[stage] ?? 0;
    if (count > bestCount) {
      best = stage;
      bestCount = count;
    }
  }
  return best;
}

export function categoryLabel(slug: string | null): string {
  if (!slug) return 'Uncategorised';
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
export function clockTime(iso: string | null): string {
  return iso ? timeFormat.format(new Date(iso)) : '—';
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' });
export function ago(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Math.abs(seconds) < 60) return relative.format(seconds, 'second');
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  return relative.format(Math.round(minutes / 60), 'hour');
}

export const numberFormat = new Intl.NumberFormat('en-US');

/** Elapsed time as mm:ss, or h:mm:ss past an hour. */
export function elapsed(iso: string, now = Date.now()): string {
  const total = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const h = Math.floor(total / 3600);
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * A threshold stated inside a real rejection reason, e.g.
 * "fact-check score 71 below 90". Returned only when the reason text itself
 * names both the value and the bar; nothing is estimated or inferred.
 */
export function thresholdSignal(reason: string): { label: string; value: number; required: number } | null {
  const match = reason.match(
    /^(.*?)\s*(\d+(?:\.\d+)?)\s*(?:is\s+)?(?:below|under|<)\s*(?:the\s+)?(?:configured\s+)?(?:minimum|threshold|required)?\s*(\d+(?:\.\d+)?)\b/i
  );
  if (!match) return null;
  const value = Number(match[2]);
  const required = Number(match[3]);
  if (!Number.isFinite(value) || !Number.isFinite(required) || required <= 0) return null;
  const label = match[1]!.replace(/[:\-–]+\s*$/, '').trim();
  return { label: label || 'Score', value, required };
}

