import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@prisma/client';
import { NewsroomDiscoveryService, type DiscoveryStory } from './newsroom-discovery.service';
import { recoveryAssist, type AssistResult } from './newsroom-recovery.assist';

/**
 * The newsroom's pipeline state, read for editors.
 *
 * ## Read-only, structurally
 *
 * Every method here is a SELECT over the connection `NewsroomDiscoveryService`
 * already holds, which is intended for a SELECT-only role. An editor's decision
 * never goes through this class: it is recorded in the CMS database and pulled
 * by the newsroom (`NewsroomRecoveryService`). The CMS gains no write path to
 * the newsroom database.
 *
 * ## Degrading honestly
 *
 * The CMS must keep working when the newsroom database is absent, unreachable,
 * or not yet migrated to the recoverable pipeline. Each read reports
 * `available: false` with a reason rather than throwing, and the story
 * inspector reports which sections could not be read instead of hiding them.
 */

const PIPELINE_JOB_WORKFLOW = 'pipeline-job';
const RECOVERY_REQUEST_WORKFLOW = 'recovery-request';
const SCHEMA_CHECK_TTL_MS = 5 * 60_000;

export const PIPELINE_WINDOWS = { '6h': 360, '24h': 1440, '7d': 10080 } as const;
export type PipelineWindowKey = keyof typeof PIPELINE_WINDOWS;

export const DECISION_CLASSES = ['DISCOVERY', 'RESEARCH', 'WRITING', 'EDITORIAL', 'SYSTEM'] as const;

export interface Unavailable {
  available: false;
  reason: string;
}

export interface PipelineHealth {
  available: true;
  window: { key: PipelineWindowKey; minutes: number; since: string };
  /** Stories by current state, among those whose state changed in the window. */
  states: Record<string, number>;
  /** Refusals by the newsroom's decision class, with how many can re-enter. */
  decisionClasses: Array<{ decisionClass: string; count: number; recoverable: number }>;
  /** The most frequent refusal codes, most frequent first. */
  codes: Array<{ code: string; decisionClass: string; count: number }>;
  jobs: {
    byStatus: Record<string, number>;
    /** Oldest job waiting to run, in minutes. Null when nothing is waiting. */
    oldestWaitingMinutes: number | null;
  };
  drafts: Record<string, number>;
  editor: {
    reviews: number;
    invalid: number;
    verdicts: Record<string, number>;
  };
  /** The single largest obstruction, in words. Null when nothing stands out. */
  bottleneck: { kind: string; label: string; count: number } | null;
}

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

export interface DecisionFilters {
  window?: PipelineWindowKey;
  decisionClass?: string;
  code?: string;
  state?: string;
  recoverable?: boolean;
  page?: number;
  perPage?: number;
}

export interface DecisionPage {
  available: true;
  items: DecisionItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ClusterSnapshot {
  id: string;
  title: string;
  state: string;
  stateCode: string | null;
  stateReason: string | null;
  decisionClass: string | null;
  recoverable: boolean;
  rewriteCount: number;
  pipelineVersion: string | null;
}

export interface StoryInspection {
  available: true;
  cluster: ClusterSnapshot & {
    summary: string | null;
    entities: string[];
    topics: string[];
    trendScore: number;
    stateChangedAt: string | null;
    createdAt: string;
  };
  discovery: DiscoveryStory | null;
  research: {
    report: Record<string, unknown>;
    sources: Record<string, unknown>[];
    claims: Array<Record<string, unknown> & { evidence: Record<string, unknown>[] }>;
  } | null;
  drafts: Array<
    Record<string, unknown> & {
      reviews: Record<string, unknown>[];
      factChecks: Record<string, unknown>[];
      qualityScores: Record<string, unknown>[];
    }
  >;
  jobs: Record<string, unknown>[];
  assist: AssistResult;
  /** Sections that could not be read, and why. Empty when everything loaded. */
  unavailableSections: Array<{ section: string; reason: string }>;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message.split('\n')[0]!.slice(0, 200) : String(error);
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

@Injectable()
export class NewsroomPipelineReader {
  private readonly logger = new Logger(NewsroomPipelineReader.name);
  private schemaCheckedAt = 0;
  private schemaReady = false;

  constructor(private readonly discovery: NewsroomDiscoveryService) {}

  private async client(): Promise<{ client: PrismaClient } | Unavailable> {
    const client = this.discovery.readOnlyClient();
    if (!client) return { available: false, reason: 'The newsroom database is not configured (AI_DATABASE_URL).' };

    if (Date.now() - this.schemaCheckedAt > SCHEMA_CHECK_TTL_MS) {
      try {
        const rows = await client.$queryRaw<{ present: number }[]>`
          SELECT COUNT(*)::int AS present
          FROM information_schema.columns
          WHERE table_name = 'NewsCluster' AND column_name IN ('stateCode', 'decisionClass', 'recoverable')
        `;
        this.schemaReady = (rows[0]?.present ?? 0) === 3;
        this.schemaCheckedAt = Date.now();
      } catch (error) {
        this.logger.error(`Could not reach the newsroom database: ${errorText(error)}`);
        return { available: false, reason: 'The newsroom database could not be reached.' };
      }
    }

    if (!this.schemaReady) {
      return {
        available: false,
        reason:
          'The newsroom database has not been migrated to the recoverable pipeline ' +
          '(20260913120000_recoverable_editorial_pipeline).',
      };
    }
    return { client };
  }

  async health(windowKey: PipelineWindowKey = '24h'): Promise<PipelineHealth | Unavailable> {
    const connection = await this.client();
    if (!('client' in connection)) return connection;
    const { client } = connection;

    const minutes = PIPELINE_WINDOWS[windowKey];
    const since = new Date(Date.now() - minutes * 60_000);

    try {
      const [states, classes, jobs, waiting, drafts, reviews] = await Promise.all([
        client.$queryRaw<{ state: string; count: number }[]>`
          SELECT "state"::text AS state, COUNT(*)::int AS count
          FROM "NewsCluster"
          WHERE COALESCE("stateChangedAt", "updatedAt") >= ${since}
          GROUP BY 1
        `,
        client.$queryRaw<{ decisionClass: string; code: string | null; recoverable: boolean; count: number }[]>`
          SELECT "decisionClass", "stateCode" AS code, "recoverable", COUNT(*)::int AS count
          FROM "NewsCluster"
          WHERE "decisionClass" IS NOT NULL AND "stateChangedAt" >= ${since}
          GROUP BY 1, 2, 3
        `,
        // Open work regardless of age; finished work only within the window.
        client.$queryRaw<{ status: string; count: number }[]>`
          SELECT "status"::text AS status, COUNT(*)::int AS count
          FROM "AIJob"
          WHERE "workflow" = ${PIPELINE_JOB_WORKFLOW}
            AND ("status"::text IN ('QUEUED', 'RUNNING', 'RETRYABLE', 'STALLED') OR "updatedAt" >= ${since})
          GROUP BY 1
        `,
        client.$queryRaw<{ oldest: Date | null }[]>`
          SELECT MIN("runAfter") AS oldest
          FROM "AIJob"
          WHERE "workflow" = ${PIPELINE_JOB_WORKFLOW}
            AND "status"::text IN ('QUEUED', 'RETRYABLE')
            AND "runAfter" <= NOW()
        `,
        client.$queryRaw<{ status: string; count: number }[]>`
          SELECT "status", COUNT(*)::int AS count
          FROM "ArticleDraft"
          WHERE "createdAt" >= ${since}
          GROUP BY 1
        `,
        client.$queryRaw<{ verdict: string | null; valid: boolean; count: number }[]>`
          SELECT "verdict", "valid", COUNT(*)::int AS count
          FROM "EditorialReview"
          WHERE "createdAt" >= ${since}
          GROUP BY 1, 2
        `,
      ]);

      const byClass = new Map<string, { count: number; recoverable: number }>();
      const byCode = new Map<string, { code: string; decisionClass: string; count: number }>();
      for (const row of classes) {
        const entry = byClass.get(row.decisionClass) ?? { count: 0, recoverable: 0 };
        entry.count += row.count;
        if (row.recoverable) entry.recoverable += row.count;
        byClass.set(row.decisionClass, entry);

        const code = row.code ?? 'UNSPECIFIED';
        const codeKey = `${row.decisionClass}:${code}`;
        const codeEntry = byCode.get(codeKey) ?? { code, decisionClass: row.decisionClass, count: 0 };
        codeEntry.count += row.count;
        byCode.set(codeKey, codeEntry);
      }

      const jobCounts = Object.fromEntries(jobs.map(row => [row.status, row.count]));
      const oldest = waiting[0]?.oldest ?? null;
      const oldestWaitingMinutes = oldest ? Math.max(0, Math.round((Date.now() - oldest.getTime()) / 60_000)) : null;

      const verdicts: Record<string, number> = {};
      let reviewCount = 0;
      let invalid = 0;
      for (const row of reviews) {
        reviewCount += row.count;
        if (!row.valid) invalid += row.count;
        else verdicts[row.verdict ?? 'UNRECORDED'] = (verdicts[row.verdict ?? 'UNRECORDED'] ?? 0) + row.count;
      }

      const codes = [...byCode.values()].sort((a, b) => b.count - a.count).slice(0, 12);

      return {
        available: true,
        window: { key: windowKey, minutes, since: since.toISOString() },
        states: Object.fromEntries(states.map(row => [row.state, row.count])),
        decisionClasses: [...byClass.entries()]
          .map(([decisionClass, entry]) => ({ decisionClass, ...entry }))
          .sort((a, b) => b.count - a.count),
        codes,
        jobs: { byStatus: jobCounts, oldestWaitingMinutes },
        drafts: Object.fromEntries(drafts.map(row => [row.status, row.count])),
        editor: { reviews: reviewCount, invalid, verdicts },
        bottleneck: bottleneckOf({ jobCounts, oldestWaitingMinutes, codes, invalid, reviews: reviewCount }),
      };
    } catch (error) {
      this.logger.error(`Could not read newsroom pipeline health: ${errorText(error)}`);
      return { available: false, reason: 'The newsroom pipeline state could not be read.' };
    }
  }

  async decisions(filters: DecisionFilters = {}): Promise<DecisionPage | Unavailable> {
    const connection = await this.client();
    if (!('client' in connection)) return connection;
    const { client } = connection;

    const page = Math.max(1, filters.page ?? 1);
    const perPage = Math.min(Math.max(filters.perPage ?? 25, 1), 100);
    const minutes = PIPELINE_WINDOWS[filters.window ?? '7d'];
    const since = new Date(Date.now() - minutes * 60_000);

    const conditions: Prisma.Sql[] = [
      Prisma.sql`c."decisionClass" IS NOT NULL`,
      Prisma.sql`c."stateChangedAt" >= ${since}`,
    ];
    if (filters.decisionClass) conditions.push(Prisma.sql`c."decisionClass" = ${filters.decisionClass}`);
    if (filters.code) conditions.push(Prisma.sql`c."stateCode" = ${filters.code}`);
    if (filters.state) conditions.push(Prisma.sql`c."state"::text = ${filters.state}`);
    if (filters.recoverable !== undefined) conditions.push(Prisma.sql`c."recoverable" = ${filters.recoverable}`);
    const where = Prisma.join(conditions, ' AND ');

    try {
      const [countRows, rows] = await Promise.all([
        client.$queryRaw<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM "NewsCluster" c WHERE ${where}`,
        client.$queryRaw<
          Array<{
            id: string;
            title: string;
            state: string;
            stateCode: string | null;
            stateReason: string | null;
            decisionClass: string | null;
            recoverable: boolean;
            rewriteCount: number;
            stateChangedAt: Date | null;
            pipelineVersion: string | null;
            reportId: string | null;
            sources: number | null;
            primarySources: number | null;
            claims: number | null;
            verified: number | null;
            partiallyVerified: number | null;
          }>
        >`
          SELECT c."id", c."title", c."state"::text AS state, c."stateCode", c."stateReason", c."decisionClass",
                 c."recoverable", c."rewriteCount", c."stateChangedAt", c."pipelineVersion",
                 r."id" AS "reportId", r."sources", r."primarySources", r."claims", r."verified", r."partiallyVerified"
          FROM "NewsCluster" c
          LEFT JOIN LATERAL (
            SELECT rr."id",
                   (SELECT COUNT(*)::int FROM "ResearchSource" s WHERE s."reportId" = rr."id") AS "sources",
                   (SELECT COUNT(*)::int FROM "ResearchSource" s WHERE s."reportId" = rr."id" AND s."isPrimary") AS "primarySources",
                   (SELECT COUNT(*)::int FROM "Claim" cl WHERE cl."reportId" = rr."id") AS "claims",
                   (SELECT COUNT(*)::int FROM "Claim" cl WHERE cl."reportId" = rr."id" AND cl."status"::text = 'VERIFIED') AS "verified",
                   (SELECT COUNT(*)::int FROM "Claim" cl WHERE cl."reportId" = rr."id" AND cl."status"::text = 'PARTIALLY_VERIFIED') AS "partiallyVerified"
            FROM "ResearchReport" rr
            WHERE rr."clusterId" = c."id"
            ORDER BY rr."createdAt" DESC
            LIMIT 1
          ) r ON TRUE
          WHERE ${where}
          ORDER BY c."stateChangedAt" DESC
          LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
        `,
      ]);

      const records = await this.discovery.storiesForClusters(rows.map(row => row.id)).catch(() => new Map());

      const items: DecisionItem[] = rows.map(row => {
        const record = records.get(row.id) as DiscoveryStory | undefined;
        const research = row.reportId
          ? {
              sources: row.sources ?? 0,
              primarySources: row.primarySources ?? 0,
              claims: row.claims ?? 0,
              verified: row.verified ?? 0,
              partiallyVerified: row.partiallyVerified ?? 0,
            }
          : null;
        const discoveryScore = record ? record.score : null;
        return {
          clusterId: row.id,
          title: row.title,
          state: row.state,
          stateCode: row.stateCode,
          stateReason: row.stateReason,
          decisionClass: row.decisionClass,
          recoverable: row.recoverable,
          rewriteCount: row.rewriteCount,
          stateChangedAt: iso(row.stateChangedAt),
          pipelineVersion: row.pipelineVersion,
          category: record?.category ?? null,
          discoveryScore,
          research,
          assist: recoveryAssist({
            discoveryScore,
            decisionClass: row.decisionClass,
            stateCode: row.stateCode,
            recoverable: row.recoverable,
            rewriteCount: row.rewriteCount,
            research,
          }),
        };
      });

      const total = countRows[0]?.total ?? 0;
      return { available: true, items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
    } catch (error) {
      this.logger.error(`Could not read newsroom decisions: ${errorText(error)}`);
      return { available: false, reason: 'The newsroom decisions could not be read.' };
    }
  }

  /** The fields a recovery request snapshots. Null when the cluster does not exist. */
  async clusterSnapshot(clusterId: string): Promise<ClusterSnapshot | null | Unavailable> {
    const connection = await this.client();
    if (!('client' in connection)) return connection;

    try {
      const rows = await connection.client.$queryRaw<Array<ClusterSnapshot>>`
        SELECT "id", "title", "state"::text AS state, "stateCode", "stateReason", "decisionClass",
               "recoverable", "rewriteCount", "pipelineVersion"
        FROM "NewsCluster"
        WHERE "id" = ${clusterId}
      `;
      return rows[0] ?? null;
    } catch (error) {
      this.logger.error(`Could not read newsroom cluster: ${errorText(error)}`);
      return { available: false, reason: 'The newsroom database could not be reached.' };
    }
  }

  /** Pipeline jobs for a cluster that a retry could re-arm. */
  async retryableJobCount(clusterId: string): Promise<number | Unavailable> {
    const connection = await this.client();
    if (!('client' in connection)) return connection;
    try {
      const rows = await connection.client.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM "AIJob"
        WHERE "workflow" = ${PIPELINE_JOB_WORKFLOW}
          AND "clusterId" = ${clusterId}
          AND "status"::text IN ('FAILED', 'STALLED', 'RETRYABLE')
      `;
      return rows[0]?.count ?? 0;
    } catch (error) {
      this.logger.error(`Could not read newsroom jobs: ${errorText(error)}`);
      return { available: false, reason: 'The newsroom database could not be reached.' };
    }
  }

  async story(clusterId: string): Promise<StoryInspection | null | Unavailable> {
    const connection = await this.client();
    if (!('client' in connection)) return connection;
    const { client } = connection;
    const unavailableSections: StoryInspection['unavailableSections'] = [];

    let clusterRow: StoryInspection['cluster'] | undefined;
    try {
      const rows = await client.$queryRaw<
        Array<Omit<StoryInspection['cluster'], 'stateChangedAt' | 'createdAt'> & { stateChangedAt: Date | null; createdAt: Date }>
      >`
        SELECT "id", "title", "summary", "state"::text AS state, "stateCode", "stateReason", "decisionClass",
               "recoverable", "rewriteCount", "pipelineVersion", "entities", "topics", "trendScore",
               "stateChangedAt", "createdAt"
        FROM "NewsCluster"
        WHERE "id" = ${clusterId}
      `;
      const row = rows[0];
      if (!row) return null;
      clusterRow = { ...row, stateChangedAt: iso(row.stateChangedAt), createdAt: row.createdAt.toISOString() };
    } catch (error) {
      this.logger.error(`Could not read newsroom cluster: ${errorText(error)}`);
      return { available: false, reason: 'The newsroom database could not be reached.' };
    }

    const section = async <T>(name: string, read: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await read();
      } catch (error) {
        this.logger.warn(`Inspector section ${name} unavailable for ${clusterId}: ${errorText(error)}`);
        unavailableSections.push({ section: name, reason: errorText(error) });
        return fallback;
      }
    };

    const discovery = await section(
      'discovery',
      async () => (await this.discovery.storiesForClusters([clusterId])).get(clusterId) ?? null,
      null as DiscoveryStory | null
    );

    const research = await section(
      'research',
      async () => {
        const reports = await client.$queryRaw<Record<string, unknown>[]>`
          SELECT "id", "topic", "event", "whatHappened", "occurredAt", "context", "whyItMatters", "whatHappensNext",
                 "missingInformation", "confidence", "model", "promptVersion", "createdAt"
          FROM "ResearchReport"
          WHERE "clusterId" = ${clusterId}
          ORDER BY "createdAt" DESC
          LIMIT 1
        `;
        const report = reports[0];
        if (!report) return null;
        const reportId = String(report.id);

        const [sources, claims, evidence] = await Promise.all([
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT "id", "url", "title", "domain", "tier"::text AS tier, "authority", "isPrimary", "via",
                   LEFT("excerpt", 500) AS excerpt
            FROM "ResearchSource"
            WHERE "reportId" = ${reportId}
            ORDER BY "isPrimary" DESC, "authority" DESC
          `,
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT "id", "text", "status"::text AS status, "confidence", "isMaterial", "contradiction"
            FROM "Claim"
            WHERE "reportId" = ${reportId}
            ORDER BY "isMaterial" DESC, "confidence" DESC
          `,
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT e."claimId", e."sourceId", LEFT(e."quote", 400) AS quote, e."supports"
            FROM "ClaimEvidence" e
            JOIN "Claim" cl ON cl."id" = e."claimId"
            WHERE cl."reportId" = ${reportId}
          `,
        ]);

        return {
          report,
          sources,
          claims: claims.map(claim => ({ ...claim, evidence: evidence.filter(item => item.claimId === claim.id) })),
        };
      },
      null as StoryInspection['research']
    );

    const drafts = await section(
      'drafts',
      async () => {
        const rows = await client.$queryRaw<Record<string, unknown>[]>`
          SELECT "id", "headline", "standfirst", LEFT("body", 20000) AS body, "wordCount", "status", "attempt",
                 "decisionReasons", "researchReportId", "writerModel", "writerPrompt", "editorModel", "editorPrompt",
                 "pipelineVersion", "cmsArticleId", "cmsStatus", "submissionError", "articleType", "maxSimilarity",
                 "createdAt"
          FROM "ArticleDraft"
          WHERE "clusterId" = ${clusterId}
          ORDER BY "createdAt" ASC
          LIMIT 20
        `;
        const ids = rows.map(row => String(row.id));
        if (ids.length === 0) return [];

        const [reviews, factChecks, qualityScores] = await Promise.all([
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT "id", "draftId", "model", "provider", "independent", "notes", "approved", "verdict", "valid",
                   "parseError", LEFT("rawResponse", 2000) AS "rawResponse", "attempt", "createdAt"
            FROM "EditorialReview"
            WHERE "draftId" = ANY(${ids})
            ORDER BY "createdAt" ASC
          `,
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT "id", "draftId", "score", "verifiedClaims", "unverifiedClaims", "contradictedClaims",
                   "unresolvedContradictions", "detail", "model", "createdAt"
            FROM "FactCheck"
            WHERE "draftId" = ANY(${ids})
            ORDER BY "createdAt" ASC
          `,
          client.$queryRaw<Record<string, unknown>[]>`
            SELECT "id", "draftId", "score", "verdict"::text AS verdict, "dimensions", "blockers", "createdAt"
            FROM "QualityScore"
            WHERE "draftId" = ANY(${ids})
            ORDER BY "createdAt" ASC
          `,
        ]);

        return rows.map(row => ({
          ...row,
          reviews: reviews.filter(item => item.draftId === row.id),
          factChecks: factChecks.filter(item => item.draftId === row.id),
          qualityScores: qualityScores.filter(item => item.draftId === row.id),
        }));
      },
      [] as StoryInspection['drafts']
    );

    const jobs = await section(
      'jobs',
      () => client.$queryRaw<Record<string, unknown>[]>`
        SELECT "id", "workflow", "status"::text AS status, "attempts", "maxAttempts", "runAfter", "startedAt",
               "finishedAt", LEFT("lastError", 1000) AS "lastError", "payload", "result", "createdAt", "updatedAt"
        FROM "AIJob"
        WHERE "clusterId" = ${clusterId}
          AND "workflow" IN (${PIPELINE_JOB_WORKFLOW}, ${RECOVERY_REQUEST_WORKFLOW}, 'article-submission')
        ORDER BY "createdAt" DESC
        LIMIT 50
      `,
      [] as Record<string, unknown>[]
    );

    const latestReport = research
      ? {
          sources: research.sources.length,
          primarySources: research.sources.filter(source => source.isPrimary === true).length,
          claims: research.claims.length,
          verified: research.claims.filter(claim => (claim as Record<string, unknown>).status === 'VERIFIED').length,
          partiallyVerified: research.claims.filter(
            claim => (claim as Record<string, unknown>).status === 'PARTIALLY_VERIFIED'
          ).length,
        }
      : null;

    return {
      available: true,
      cluster: clusterRow,
      discovery,
      research,
      drafts,
      jobs,
      assist: recoveryAssist({
        discoveryScore: discovery?.score ?? null,
        decisionClass: clusterRow.decisionClass,
        stateCode: clusterRow.stateCode,
        recoverable: clusterRow.recoverable,
        rewriteCount: clusterRow.rewriteCount,
        research: latestReport,
      }),
      unavailableSections,
    };
  }
}

/**
 * The largest obstruction, in priority order: work that is stuck beats work
 * that is slow, which beats the most common refusal. Pure, for testing.
 */
export function bottleneckOf(input: {
  jobCounts: Record<string, number>;
  oldestWaitingMinutes: number | null;
  codes: Array<{ code: string; decisionClass: string; count: number }>;
  invalid: number;
  reviews: number;
}): PipelineHealth['bottleneck'] {
  const stalled = input.jobCounts.STALLED ?? 0;
  if (stalled > 0) {
    return { kind: 'STALLED_JOBS', label: `${stalled} job(s) stalled with no attempts left`, count: stalled };
  }
  if (input.oldestWaitingMinutes !== null && input.oldestWaitingMinutes >= 60) {
    const waiting = (input.jobCounts.QUEUED ?? 0) + (input.jobCounts.RETRYABLE ?? 0);
    return {
      kind: 'QUEUE_BACKLOG',
      label: `Oldest queued job has waited ${input.oldestWaitingMinutes} minutes`,
      count: waiting,
    };
  }
  if (input.reviews >= 5 && input.invalid / input.reviews >= 0.25) {
    return {
      kind: 'EDITOR_RESPONSES',
      label: `${input.invalid} of ${input.reviews} editor responses were unreadable`,
      count: input.invalid,
    };
  }
  const top = input.codes[0];
  if (top && top.count > 0) {
    return { kind: 'REFUSAL', label: `Most common refusal: ${top.code} (${top.decisionClass})`, count: top.count };
  }
  return null;
}
