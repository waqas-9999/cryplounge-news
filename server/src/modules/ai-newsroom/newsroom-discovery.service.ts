import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Reading the AI newsroom's discovery records.
 *
 * ## Why a second connection
 *
 * The newsroom is a separate service with its own database. Its discovery
 * records — the news score and how it was reached, freshness, every source,
 * and why a story was or was not written — are the answer to "what did we
 * find, and why did we skip it?", and the CMS previously had no way to see
 * them at all.
 *
 * ## Why raw SQL rather than a second generated client
 *
 * A second Prisma schema would need its own `generate` step, its own output
 * path and build wiring, for exactly one table. The discovery rows live in
 * `AIJob`, keyed by `workflow`, with the payload in a Json column, so a single
 * parameterised query reads them with no schema duplication to keep in sync.
 *
 * ## Read-only, and structurally so
 *
 * Nothing here writes. The connection is intended for a SELECT-only role, and
 * every method is a query. Keeping this data out of the CMS database entirely
 * is also what makes the public/private separation a structural guarantee
 * rather than a rule someone has to remember: the public article API cannot
 * leak a column that does not exist in the database it queries.
 */

const DISCOVERY_WORKFLOW = 'discovery-record';

export type Freshness = 'BREAKING' | 'FRESH' | 'RECENT' | 'STALE' | 'UNKNOWN';

export interface DiscoverySource {
  domain: string;
  url: string;
  title?: string;
  publishedAt?: string;
  isPrimary: boolean;
  discoveryOnly: boolean;
}

export interface DiscoveryStory {
  clusterId: string;
  title: string;
  score: number;
  scoreBand: string;
  scoreLabel: string;
  scoreReasons: string[];
  freshness: Freshness;
  ageMinutes: number | null;
  /** Whether the age came from the event or only from publication. */
  ageBasis: string | null;
  category: string | null;
  evidenceGrade: string | null;
  sources: DiscoverySource[];
  sourceCount: number;
  /** When the source filed it. Distinct from `detectedAt`. */
  publishedAt: string | null;
  /** When CrypLounge first saw it. */
  detectedAt: string;
  /** Minutes between publication and detection — how fast discovery is. */
  detectionDelayMinutes: number | null;
  status: string;
  statusReasons: string[];
  /** Stable machine code for the outcome, e.g. EDITOR_REJECTED, CMS_UNAVAILABLE. */
  outcomeCode: string | null;
  /** DISCOVERY | RESEARCH | WRITING | EDITORIAL | SYSTEM, where the newsroom recorded one. */
  decisionClass: string | null;
  /** False only for a hard rejection. Null on records older than the field. */
  recoverable: boolean | null;
  retryable: boolean | null;
  /** When the outcome was recorded; null on records older than the field. */
  outcomeAt: string | null;
  cmsArticleId: string | null;
  recordedAt: string;
}

export interface DiscoveryFilters {
  minScore?: number;
  freshness?: Freshness[];
  category?: string;
  status?: string[];
  sourceDomain?: string;
  /** Only stories recorded within this many minutes. */
  withinMinutes?: number;
  sort?: 'newsroom' | 'score' | 'newest' | 'oldest' | 'freshness' | 'category' | 'source' | 'cms';
  page?: number;
  perPage?: number;
}

export interface DiscoveryPage {
  items: DiscoveryStory[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  /** False when the newsroom database is not configured or unreachable. */
  available: boolean;
  reason?: string;
}

/** Freshness order for the newsroom sort. Breaking first — this is real time. */
const FRESHNESS_RANK: Record<Freshness, number> = {
  BREAKING: 0,
  FRESH: 1,
  RECENT: 2,
  UNKNOWN: 3,
  STALE: 4,
};

@Injectable()
export class NewsroomDiscoveryService implements OnModuleDestroy {
  private readonly logger = new Logger(NewsroomDiscoveryService.name);
  private client: PrismaClient | null = null;
  private warned = false;

  /**
   * Lazily connected.
   *
   * The CMS must boot and serve without the newsroom. An absent or broken
   * `AI_DATABASE_URL` disables these endpoints; it does not fail the app.
   */
  private connection(): PrismaClient | null {
    const url = process.env.AI_DATABASE_URL;
    if (!url) {
      if (!this.warned) {
        this.logger.warn('AI_DATABASE_URL is not set; newsroom discovery pages will be empty');
        this.warned = true;
      }
      return null;
    }

    this.client ??= new PrismaClient({ datasources: { db: { url } } });
    return this.client;
  }

  /**
   * The same read-only connection, for the pipeline inspector.
   *
   * Shared rather than opened twice, so the newsroom database sees one pool
   * from the CMS. Null when AI_DATABASE_URL is not configured.
   */
  readOnlyClient(): PrismaClient | null {
    return this.connection();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.$disconnect();
  }

  async list(filters: DiscoveryFilters = {}): Promise<DiscoveryPage> {
    const page = Math.max(1, filters.page ?? 1);
    const perPage = Math.min(Math.max(filters.perPage ?? 25, 1), 100);

    const client = this.connection();
    if (!client) {
      return {
        items: [],
        total: 0,
        page,
        perPage,
        totalPages: 0,
        available: false,
        reason: 'The newsroom database is not configured (AI_DATABASE_URL).',
      };
    }

    const since = new Date(Date.now() - (filters.withinMinutes ?? 7 * 24 * 60) * 60_000);

    try {
      // Bounded read, then filtered and sorted here. The fields the pages
      // filter on live inside a Json column with no index, so a WHERE clause
      // on them would scan anyway; the row cap is what keeps this predictable.
      // If this ever needs to cover weeks rather than days, the newsroom needs
      // a real table for these records first.
      const rows = await client.$queryRaw<{ clusterId: string | null; result: unknown; createdAt: Date }[]>`
        SELECT "clusterId", "result", "createdAt"
        FROM "AIJob"
        WHERE "workflow" = ${DISCOVERY_WORKFLOW}
          AND "createdAt" >= ${since}
        ORDER BY "createdAt" DESC
        LIMIT 2000
      `;

      const all = rows
        .map(row => this.toStory(row))
        .filter((story): story is DiscoveryStory => story !== null)
        .filter(story => this.matches(story, filters));

      this.sort(all, filters.sort ?? 'newsroom');

      const start = (page - 1) * perPage;
      return {
        items: all.slice(start, start + perPage),
        total: all.length,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(all.length / perPage)),
        available: true,
      };
    } catch (error) {
      this.logger.error(
        `Could not read newsroom discovery records: ${error instanceof Error ? error.message : error}`
      );
      return {
        items: [],
        total: 0,
        page,
        perPage,
        totalPages: 0,
        available: false,
        reason: 'The newsroom database could not be reached.',
      };
    }
  }

  /**
   * Every discovery record in a time window, unfiltered and unpaginated.
   *
   * For the intelligence view, which joins these to telemetry by cluster id.
   * Same bounded read and the same parsing as `list`, so the two can never
   * disagree about what a record says.
   */
  async storiesWithin(
    minutes: number,
    limit = 2000
  ): Promise<{ stories: DiscoveryStory[]; available: boolean; reason?: string }> {
    const client = this.connection();
    if (!client) {
      return { stories: [], available: false, reason: 'The newsroom database is not configured (AI_DATABASE_URL).' };
    }

    const since = new Date(Date.now() - minutes * 60_000);
    const cap = Math.min(Math.max(limit, 1), 2000);

    try {
      const rows = await client.$queryRaw<{ clusterId: string | null; result: unknown; createdAt: Date }[]>`
        SELECT "clusterId", "result", "createdAt"
        FROM "AIJob"
        WHERE "workflow" = ${DISCOVERY_WORKFLOW}
          AND "createdAt" >= ${since}
        ORDER BY "createdAt" DESC
        LIMIT ${cap}
      `;
      return {
        stories: rows.map(row => this.toStory(row)).filter((story): story is DiscoveryStory => story !== null),
        available: true,
      };
    } catch (error) {
      this.logger.error(
        `Could not read newsroom discovery records: ${error instanceof Error ? error.message : error}`
      );
      return { stories: [], available: false, reason: 'The newsroom database could not be reached.' };
    }
  }

  /**
   * The latest discovery record for each of these clusters, parsed exactly as
   * `list` parses them. Missing clusters are simply absent from the map.
   */
  async storiesForClusters(clusterIds: string[]): Promise<Map<string, DiscoveryStory>> {
    const found = new Map<string, DiscoveryStory>();
    const client = this.connection();
    if (!client || clusterIds.length === 0) return found;

    const rows = await client.$queryRaw<{ clusterId: string | null; result: unknown; createdAt: Date }[]>`
      SELECT DISTINCT ON ("clusterId") "clusterId", "result", "createdAt"
      FROM "AIJob"
      WHERE "workflow" = ${DISCOVERY_WORKFLOW}
        AND "clusterId" = ANY(${clusterIds.slice(0, 500)})
      ORDER BY "clusterId", "createdAt" DESC
    `;
    for (const row of rows) {
      const story = this.toStory(row);
      if (story) found.set(story.clusterId, story);
    }
    return found;
  }

  /** Distinct source domains and categories, for the filter dropdowns. */
  async facets(): Promise<{ sources: string[]; categories: string[] }> {
    const { items } = await this.list({ perPage: 100, withinMinutes: 7 * 24 * 60 });
    const sources = new Set<string>();
    const categories = new Set<string>();

    for (const story of items) {
      for (const source of story.sources) sources.add(source.domain);
      if (story.category) categories.add(story.category);
    }

    return { sources: [...sources].sort(), categories: [...categories].sort() };
  }

  private toStory(row: {
    clusterId: string | null;
    result: unknown;
    createdAt: Date;
  }): DiscoveryStory | null {
    const result = (row.result ?? {}) as Record<string, unknown>;
    if (!result.title) return null;

    const score = typeof result.score === 'number' ? result.score : 0;
    const sources = Array.isArray(result.sources)
      ? (result.sources as Record<string, unknown>[]).map(source => ({
          domain: String(source.domain ?? ''),
          url: String(source.url ?? ''),
          title: source.title ? String(source.title) : undefined,
          publishedAt: source.publishedAt ? String(source.publishedAt) : undefined,
          isPrimary: source.isPrimary === true,
          discoveryOnly: source.discoveryOnly === true,
        }))
      : [];

    const publishedAt = result.publishedAt ? String(result.publishedAt) : null;
    const detectedAt = result.discoveredAt ? String(result.discoveredAt) : row.createdAt.toISOString();

    // The number that says whether discovery is actually fast: how long the
    // story existed before we saw it. Distinct from its age now, and distinct
    // from how long the pipeline then took.
    let detectionDelayMinutes: number | null = null;
    if (publishedAt) {
      const delta = new Date(detectedAt).getTime() - new Date(publishedAt).getTime();
      if (Number.isFinite(delta)) detectionDelayMinutes = Math.max(0, Math.round(delta / 60_000));
    }

    return {
      clusterId: row.clusterId ?? '',
      title: String(result.title),
      score,
      scoreBand: scoreBandFor(score),
      scoreLabel: scoreLabelFor(score),
      scoreReasons: Array.isArray(result.scoreReasons) ? result.scoreReasons.map(String) : [],
      freshness: (result.freshness as Freshness) ?? 'UNKNOWN',
      ageMinutes: typeof result.ageMinutes === 'number' ? result.ageMinutes : null,
      ageBasis: result.ageBasis ? String(result.ageBasis) : null,
      category: result.category ? String(result.category) : null,
      evidenceGrade: result.evidenceGrade ? String(result.evidenceGrade) : null,
      sources,
      sourceCount: sources.length,
      publishedAt,
      detectedAt,
      detectionDelayMinutes,
      status: String(result.outcome ?? 'DISCOVERED'),
      statusReasons: Array.isArray(result.outcomeReasons) ? result.outcomeReasons.map(String) : [],
      outcomeCode: typeof result.outcomeCode === 'string' ? result.outcomeCode : null,
      decisionClass: typeof result.decisionClass === 'string' ? result.decisionClass : null,
      recoverable: typeof result.recoverable === 'boolean' ? result.recoverable : null,
      retryable: typeof result.retryable === 'boolean' ? result.retryable : null,
      outcomeAt: typeof result.outcomeAt === 'string' ? result.outcomeAt : null,
      cmsArticleId: result.cmsArticleId ? String(result.cmsArticleId) : null,
      recordedAt: row.createdAt.toISOString(),
    };
  }

  private matches(story: DiscoveryStory, filters: DiscoveryFilters): boolean {
    // Inclusive: a story scoring exactly the threshold qualifies.
    if (filters.minScore !== undefined && story.score < filters.minScore) return false;
    if (filters.freshness?.length && !filters.freshness.includes(story.freshness)) return false;
    if (filters.category && story.category !== filters.category) return false;
    if (filters.status?.length && !filters.status.includes(story.status)) return false;
    if (
      filters.sourceDomain &&
      !story.sources.some(source => source.domain === filters.sourceDomain)
    ) {
      return false;
    }
    return true;
  }

  private sort(stories: DiscoveryStory[], sort: NonNullable<DiscoveryFilters['sort']>): void {
    const newest = (story: DiscoveryStory) =>
      new Date(story.publishedAt ?? story.detectedAt).getTime();

    switch (sort) {
      case 'newsroom':
        /*
         * The default, and the one that reflects what a newsroom is for.
         *
         * Freshness outranks score: a 95 that broke four minutes ago is worth
         * more than a 99 from five hours ago, because the second is already
         * being covered everywhere and the first still might not be. Score
         * ranks within a band, and publication time breaks remaining ties.
         */
        stories.sort(
          (a, b) =>
            FRESHNESS_RANK[a.freshness] - FRESHNESS_RANK[b.freshness] ||
            b.score - a.score ||
            newest(b) - newest(a)
        );
        break;
      case 'score':
        stories.sort((a, b) => b.score - a.score || newest(b) - newest(a));
        break;
      case 'newest':
        stories.sort((a, b) => newest(b) - newest(a));
        break;
      case 'oldest':
        stories.sort((a, b) => newest(a) - newest(b));
        break;
      case 'freshness':
        stories.sort(
          (a, b) => FRESHNESS_RANK[a.freshness] - FRESHNESS_RANK[b.freshness] || b.score - a.score
        );
        break;
      case 'category':
        stories.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || b.score - a.score);
        break;
      case 'source':
        stories.sort(
          (a, b) =>
            (a.sources[0]?.domain ?? '').localeCompare(b.sources[0]?.domain ?? '') || b.score - a.score
        );
        break;
      case 'cms':
        // Stories that reached the CMS first, then everything else by score.
        stories.sort(
          (a, b) => Number(Boolean(b.cmsArticleId)) - Number(Boolean(a.cmsArticleId)) || b.score - a.score
        );
        break;
    }
  }
}

/** Bands for the all-news view. */
export function scoreBandFor(score: number): string {
  if (score >= 90) return '90-100';
  if (score >= 80) return '80-89';
  if (score >= 70) return '70-79';
  if (score >= 60) return '60-69';
  if (score >= 50) return '50-59';
  return 'below 50';
}

/** Words, not colour alone. */
export function scoreLabelFor(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Weak';
  return 'Poor';
}
