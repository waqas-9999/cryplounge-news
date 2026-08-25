import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CANDIDATE_SELECT,
  candidateFilter,
  daysBetween,
  judge,
  type ProtectionReason,
  type RetentionCandidate,
} from './retention-policy';

/**
 * Draft retention.
 *
 * ## Soft delete, not destruction
 *
 * The CMS already has a soft-delete convention — `deletedAt` / `deletedById`,
 * with a restore path in `BaseCrudService` — and this job uses it rather than
 * `deleteMany`. Three reasons, in order of how much they matter:
 *
 *  1. **A mistake stays recoverable.** This is the only scheduled job that
 *     removes editorial content. If the policy is ever wrong, the articles are
 *     still there and one UPDATE brings them back. A hard delete of an article
 *     the author wanted is unrecoverable and would take its versions with it.
 *  2. **It matches how a human deletes.** An editor pressing delete sets
 *     `deletedAt`. A cleanup that behaved differently would put rows in a
 *     state nothing else in the system produces.
 *  3. **Nothing is orphaned.** No foreign key changes, so there are no
 *     dangling `ArticleVersion` rows, no broken `Media` references, and shared
 *     records — categories, tags, sources — are untouched by construction
 *     rather than by careful deletion order.
 *
 * The cost is honest and stated in `docs/RETENTION.md`: soft-deleting does not
 * reclaim disk. A separate, later purge of long-soft-deleted rows is what
 * would, and it is deliberately not part of this job.
 *
 * ## The race
 *
 * An editor can act on a draft between the scan and the write. Every row is
 * therefore judged twice: once from the scan, and again inside the update, as
 * a conditional `updateMany` whose WHERE clause repeats the protections. If
 * the row changed underneath, the update matches nothing and the article is
 * left alone — the database, not this process, decides who won.
 */

export interface RetentionSummary {
  event: 'RETENTION_SCAN_COMPLETED' | 'RETENTION_SCAN_FAILED';
  enabled: boolean;
  dryRun: boolean;
  cutoff: string;
  retentionDays: number;
  scanned: number;
  eligible: number;
  deleted: number;
  skipped: number;
  failed: number;
  batches: number;
  durationMs: number;
  protectedByReason: Record<string, number>;
  /** Populated in dry-run so an operator can see exactly what would go. */
  wouldDelete?: Array<{ id: string; title: string; ageDays: number; status: ContentStatus }>;
  error?: string;
}

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  get enabled(): boolean {
    return this.config.get<boolean>('NEWSROOM_RETENTION_ENABLED') === true;
  }

  get dryRun(): boolean {
    // Defaults to true when unset: the safe reading of a missing flag on a
    // destructive job is "do not destroy".
    return this.config.get<boolean>('NEWSROOM_RETENTION_DRY_RUN') !== false;
  }

  get retentionDays(): number {
    return this.config.get<number>('NEWSROOM_DRAFT_RETENTION_DAYS') ?? 3;
  }

  get batchSize(): number {
    return this.config.get<number>('NEWSROOM_RETENTION_BATCH_SIZE') ?? 100;
  }

  /**
   * One retention pass.
   *
   * `overrides` exists for the CLI (`--days`, `--dry-run`) and for tests,
   * which supply a fixed `now` so the rule is never judged against the wall
   * clock.
   */
  async sweep(
    overrides: { now?: Date; retentionDays?: number; dryRun?: boolean; limit?: number } = {}
  ): Promise<RetentionSummary> {
    const startedAt = Date.now();
    const now = overrides.now ?? new Date();
    const retentionDays = overrides.retentionDays ?? this.retentionDays;
    const dryRun = overrides.dryRun ?? this.dryRun;
    const cutoff = new Date(now.getTime() - retentionDays * 86_400_000);

    const summary: RetentionSummary = {
      event: 'RETENTION_SCAN_COMPLETED',
      enabled: this.enabled,
      dryRun,
      cutoff: cutoff.toISOString(),
      retentionDays,
      scanned: 0,
      eligible: 0,
      deleted: 0,
      skipped: 0,
      failed: 0,
      batches: 0,
      durationMs: 0,
      protectedByReason: {},
      ...(dryRun ? { wouldDelete: [] } : {}),
    };

    if (!this.enabled) {
      summary.durationMs = Date.now() - startedAt;
      this.logger.log(JSON.stringify({ event: 'RETENTION_SCAN_SKIPPED', reason: 'disabled' }));
      return summary;
    }

    this.logger.log(
      JSON.stringify({
        event: 'RETENTION_SCAN_STARTED',
        cutoff: summary.cutoff,
        retentionDays,
        dryRun,
        batchSize: this.batchSize,
      })
    );

    try {
      await this.processBatches(summary, { now, retentionDays, dryRun, limit: overrides.limit });
    } catch (error) {
      summary.event = 'RETENTION_SCAN_FAILED';
      summary.error = error instanceof Error ? error.message : String(error);
      summary.durationMs = Date.now() - startedAt;
      this.logger.error(JSON.stringify(summary));
      return summary;
    }

    summary.durationMs = Date.now() - startedAt;
    this.logger.log(JSON.stringify(summary));
    return summary;
  }

  /**
   * Walks the eligible rows in batches.
   *
   * Keyset pagination on `(createdAt, id)`, not Prisma's `cursor`.
   *
   * `cursor` requires the cursor row to still be in the result set, and this
   * job soft-deletes the rows it just read — so the cursor vanishes from the
   * filter and the next page silently restarts from the beginning. Any row
   * that was skipped or failed then gets scanned again, and the counts double.
   * Comparing on the ordering values instead works whether or not the previous
   * row still matches, which is also what makes dry-run terminate.
   */
  private async processBatches(
    summary: RetentionSummary,
    options: { now: Date; retentionDays: number; dryRun: boolean; limit?: number }
  ): Promise<void> {
    let afterCreatedAt: Date | undefined;
    let afterId: string | undefined;

    for (let batch = 0; batch < 1000; batch += 1) {
      const base = candidateFilter({ now: options.now, retentionDays: options.retentionDays });

      const candidates = (await this.prisma.article.findMany({
        where:
          afterCreatedAt && afterId
            ? {
                ...base,
                OR: [
                  { createdAt: { gt: afterCreatedAt } },
                  { createdAt: afterCreatedAt, id: { gt: afterId } },
                ],
              }
            : base,
        select: CANDIDATE_SELECT,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: this.batchSize,
      })) as RetentionCandidate[];

      if (candidates.length === 0) break;

      summary.batches += 1;
      const last = candidates[candidates.length - 1]!;
      afterCreatedAt = last.createdAt;
      afterId = last.id;

      for (const candidate of candidates) {
        summary.scanned += 1;

        const verdict = judge(candidate, { now: options.now, retentionDays: options.retentionDays });

        if (verdict.keep) {
          summary.skipped += 1;
          this.countProtection(summary, verdict.reason);
          this.logProtected(candidate, verdict.reason, options.now);
          continue;
        }

        summary.eligible += 1;

        this.logger.log(
          JSON.stringify({
            event: 'RETENTION_DRAFT_FOUND',
            articleId: candidate.id,
            status: candidate.status,
            ageDays: Number(verdict.ageDays.toFixed(1)),
          })
        );

        if (options.dryRun) {
          summary.wouldDelete?.push({
            id: candidate.id,
            // A headline is not article content and is what makes the dry-run
            // readable; the body is never logged.
            title: candidate.title.slice(0, 120),
            ageDays: Number(verdict.ageDays.toFixed(1)),
            status: candidate.status,
          });
          continue;
        }

        const removed = await this.remove(candidate, options.now);
        if (removed === 'deleted') summary.deleted += 1;
        else if (removed === 'raced') {
          summary.skipped += 1;
          this.countProtection(summary, 'manual_publish_selection');
        } else summary.failed += 1;
      }

      if (options.limit && summary.scanned >= options.limit) break;
    }
  }

  /**
   * Soft-deletes one draft, re-checking every protection in the WHERE clause.
   *
   * The conditions here are not a convenience: they are the race protection.
   * If an editor published, scheduled, pinned or edited the article since the
   * scan, `updateMany` matches zero rows and the article survives. The
   * decision is made by the database at write time, not by this process at
   * read time.
   */
  private async remove(
    candidate: RetentionCandidate,
    now: Date
  ): Promise<'deleted' | 'raced' | 'failed'> {
    try {
      const { count } = await this.prisma.article.updateMany({
        where: {
          id: candidate.id,
          status: ContentStatus.DRAFT,
          deletedAt: null,
          publishedAt: null,
          scheduledFor: null,
          pinned: false,
          featured: false,
          createdById: null,
          updatedById: null,
          // Guards against the row having been re-created or touched such
          // that it is no longer old enough.
          createdAt: candidate.createdAt,
        },
        data: { deletedAt: now },
      });

      if (count === 0) {
        this.logger.log(
          JSON.stringify({
            event: 'RETENTION_DRAFT_PROTECTED',
            articleId: candidate.id,
            reason: 'state_changed_during_sweep',
            status: candidate.status,
          })
        );
        return 'raced';
      }

      this.logger.log(
        JSON.stringify({
          event: 'RETENTION_DRAFT_DELETED',
          articleId: candidate.id,
          mode: 'soft',
          ageDays: Number(daysBetween(candidate.createdAt, now).toFixed(1)),
        })
      );
      return 'deleted';
    } catch (error) {
      // Logged and counted, never swallowed, and the loop continues so one bad
      // row cannot strand the rest.
      this.logger.error(
        JSON.stringify({
          event: 'RETENTION_DRAFT_FAILED',
          articleId: candidate.id,
          error: error instanceof Error ? error.message : String(error),
        })
      );
      return 'failed';
    }
  }

  private countProtection(summary: RetentionSummary, reason: ProtectionReason): void {
    summary.protectedByReason[reason] = (summary.protectedByReason[reason] ?? 0) + 1;
  }

  private logProtected(candidate: RetentionCandidate, reason: ProtectionReason, now: Date): void {
    // `too_recent` is the ordinary case and would drown the log.
    if (reason === 'too_recent' || reason === 'already_removed') return;

    this.logger.log(
      JSON.stringify({
        event: 'RETENTION_DRAFT_PROTECTED',
        articleId: candidate.id,
        reason,
        status: candidate.status,
        ageDays: Number(daysBetween(candidate.createdAt, now).toFixed(1)),
      })
    );
  }

  /**
   * Counts by bucket, for the operator.
   *
   * Four counts, no table-size arithmetic: `pg_total_relation_size` on a
   * production table every night costs more than the number is worth, and the
   * real storage picture belongs in a one-off investigation rather than a
   * nightly job.
   */
  async storageReport(now = new Date()): Promise<{
    event: 'RETENTION_STORAGE_REPORT';
    draftsTotal: number;
    draftsOlderThanRetention: number;
    draftsWithinRetention: number;
    softDeleted: number;
    retentionDays: number;
  }> {
    const cutoff = new Date(now.getTime() - this.retentionDays * 86_400_000);

    const [draftsTotal, older, softDeleted] = await Promise.all([
      this.prisma.article.count({ where: { status: ContentStatus.DRAFT, deletedAt: null } }),
      this.prisma.article.count({
        where: { status: ContentStatus.DRAFT, deletedAt: null, createdAt: { lt: cutoff } },
      }),
      this.prisma.article.count({ where: { NOT: { deletedAt: null } } }),
    ]);

    return {
      event: 'RETENTION_STORAGE_REPORT',
      draftsTotal,
      draftsOlderThanRetention: older,
      draftsWithinRetention: draftsTotal - older,
      softDeleted,
      retentionDays: this.retentionDays,
    };
  }
}
