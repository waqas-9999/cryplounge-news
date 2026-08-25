import { ContentStatus } from '@prisma/client';

/**
 * Which articles retention may touch.
 *
 * ## Fail closed, always
 *
 * This file decides whether editorial content is removed, so it is written as
 * an allow-list: a status is eligible only if it is named here as eligible.
 * A status added to the schema later, or one this code has never seen, is
 * protected — the default answer is "keep", and it takes a deliberate edit to
 * change that for any status.
 *
 * The alternative shape — a deny-list of protected statuses — fails the wrong
 * way. Someone adds `PENDING_LEGAL_REVIEW` to the enum, nobody updates the
 * deny-list, and the cleanup starts deleting articles held for legal reasons.
 *
 * ## Editorial intent outranks age
 *
 * Age is the last question asked, not the first. A draft an editor has acted
 * on is protected regardless of how old it is, because a storage job must
 * never overrule a person. The score is not consulted at all: a story scoring
 * 42 that an editor chose is worth more than one scoring 95 that nobody
 * looked at, and retention has no business ranking them.
 */

export type ProtectionReason =
  | 'published'
  | 'scheduled_for_publication'
  | 'in_editorial_review'
  | 'archived'
  | 'unknown_status'
  | 'manual_publish_selection'
  | 'pinned_or_featured'
  | 'already_removed'
  | 'too_recent';

export interface RetentionCandidate {
  id: string;
  title: string;
  status: ContentStatus;
  createdAt: Date;
  publishedAt: Date | null;
  scheduledFor: Date | null;
  deletedAt: Date | null;
  pinned: boolean;
  featured: boolean;
  /** Null for agent submissions; set when a person created the row. */
  createdById: string | null;
  updatedById: string | null;
}

export type RetentionVerdict =
  | { keep: true; reason: ProtectionReason }
  | { keep: false; ageDays: number };

/**
 * Statuses this job may remove.
 *
 * `DRAFT` only. Everything else in `ContentStatus` — REVIEW, SCHEDULED,
 * PUBLISHED, ARCHIVED — is protected, and REVIEW especially: it means a human
 * has the article in hand.
 */
const ELIGIBLE_STATUSES: ReadonlySet<ContentStatus> = new Set([ContentStatus.DRAFT]);

/** Why each protected status is protected, for the log. */
const PROTECTED_STATUS_REASON: Partial<Record<ContentStatus, ProtectionReason>> = {
  [ContentStatus.PUBLISHED]: 'published',
  [ContentStatus.SCHEDULED]: 'scheduled_for_publication',
  [ContentStatus.REVIEW]: 'in_editorial_review',
  [ContentStatus.ARCHIVED]: 'archived',
};

export function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 86_400_000;
}

/**
 * The decision for one article.
 *
 * `now` is a parameter rather than read from the clock so the rule can be
 * tested at fixed instants, and so every article in one sweep is judged
 * against the same moment.
 */
export function judge(
  candidate: RetentionCandidate,
  options: { now: Date; retentionDays: number }
): RetentionVerdict {
  // Already soft-deleted. Not an error and not a second deletion — this is
  // what makes running the job twice a no-op.
  if (candidate.deletedAt !== null) return { keep: true, reason: 'already_removed' };

  /*
   * Publication state first.
   *
   * `publishedAt` and `scheduledFor` are checked independently of `status`
   * because they are the record of an editorial decision, and a row whose
   * status was changed by hand while a publish date remains set is exactly
   * the ambiguous case that must fail closed.
   */
  if (candidate.publishedAt !== null) return { keep: true, reason: 'published' };
  if (candidate.scheduledFor !== null) return { keep: true, reason: 'scheduled_for_publication' };

  if (!ELIGIBLE_STATUSES.has(candidate.status)) {
    return {
      keep: true,
      // A status the schema has but this file has not classified is unknown,
      // not safe.
      reason: PROTECTED_STATUS_REASON[candidate.status] ?? 'unknown_status',
    };
  }

  /*
   * Editorial intent.
   *
   * `ContentStatus` has no "approved" or "publish queued" value — the enum is
   * DRAFT, REVIEW, SCHEDULED, PUBLISHED, ARCHIVED — so intent is recorded in
   * the fields that do exist. A draft a person has edited carries their id in
   * `updatedById`; one a person created has `createdById`. Either means a
   * human has touched this article, and a storage job does not overrule that.
   *
   * `pinned` and `featured` are explicit editorial selections and protect the
   * row on their own.
   */
  if (candidate.pinned || candidate.featured) return { keep: true, reason: 'pinned_or_featured' };
  if (candidate.updatedById !== null || candidate.createdById !== null) {
    return { keep: true, reason: 'manual_publish_selection' };
  }

  const ageDays = daysBetween(candidate.createdAt, options.now);

  // Strictly older than the window. A draft exactly at the boundary is kept,
  // so the rule never removes something on its retention day.
  if (ageDays <= options.retentionDays) return { keep: true, reason: 'too_recent' };

  return { keep: false, ageDays };
}

/**
 * The database filter for the first pass.
 *
 * Narrows the scan to rows that could possibly qualify. It is deliberately a
 * superset of what `judge` accepts — the authoritative decision is made per
 * row, in code, and re-made inside the deletion transaction. A query that
 * tried to encode the whole policy would be a second copy of it, free to
 * drift from the one that is tested.
 */
export function candidateFilter(options: { now: Date; retentionDays: number }) {
  return {
    status: ContentStatus.DRAFT,
    deletedAt: null,
    publishedAt: null,
    scheduledFor: null,
    createdAt: { lt: new Date(options.now.getTime() - options.retentionDays * 86_400_000) },
  };
}

export const CANDIDATE_SELECT = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  publishedAt: true,
  scheduledFor: true,
  deletedAt: true,
  pinned: true,
  featured: true,
  createdById: true,
  updatedById: true,
} as const;
