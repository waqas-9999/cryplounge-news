import { ContentStatus } from '@prisma/client';
import { judge, candidateFilter, type RetentionCandidate } from './retention-policy';
import { RetentionService } from './retention.service';

/**
 * Draft retention.
 *
 * This is the only scheduled job in the system that removes editorial
 * content, so the tests are weighted accordingly: most of them assert that
 * something is **kept**. A retention bug that keeps too much wastes disk. One
 * that deletes too much destroys work a person did.
 *
 * Every test fixes `now`. Nothing here consults the wall clock, so a run at
 * 23:59 UTC behaves exactly like a run at noon.
 */

const NOW = new Date('2026-08-25T12:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

const draft = (overrides: Partial<RetentionCandidate> = {}): RetentionCandidate => ({
  id: 'article-1',
  title: 'Ethereum developers announce client release schedule',
  status: ContentStatus.DRAFT,
  createdAt: daysAgo(5),
  publishedAt: null,
  scheduledFor: null,
  deletedAt: null,
  pinned: false,
  featured: false,
  createdById: null,
  updatedById: null,
  ...overrides,
});

const verdict = (overrides: Partial<RetentionCandidate> = {}, retentionDays = 3) =>
  judge(draft(overrides), { now: NOW, retentionDays });

/* ------------------------------------------------------------- the age -- */

describe('age', () => {
  it('deletes a draft older than the window', () => {
    expect(verdict({ createdAt: daysAgo(4) }).keep).toBe(false);
  });

  it('keeps a draft exactly at the boundary', () => {
    // Three days old on a three-day policy is kept. The rule never removes
    // something on its retention day.
    const result = verdict({ createdAt: daysAgo(3) });
    expect(result.keep).toBe(true);
    expect(result).toMatchObject({ reason: 'too_recent' });
  });

  it('keeps a draft newer than the window', () => {
    expect(verdict({ createdAt: daysAgo(1) }).keep).toBe(true);
  });

  it('reports the age it measured', () => {
    const result = verdict({ createdAt: daysAgo(4.5) });
    expect(result).toMatchObject({ keep: false, ageDays: 4.5 });
  });

  it('honours a different retention period', () => {
    // Same article, two policies.
    expect(verdict({ createdAt: daysAgo(5) }, 3).keep).toBe(false);
    expect(verdict({ createdAt: daysAgo(5) }, 30).keep).toBe(true);
  });

  it('is unaffected by the time of day', () => {
    // A UTC-midnight boundary bug would show up here.
    for (const hour of ['00:00:00', '12:00:00', '23:59:59']) {
      const now = new Date(`2026-08-25T${hour}.000Z`);
      const old = judge(draft({ createdAt: new Date(now.getTime() - 4 * 86_400_000) }), {
        now,
        retentionDays: 3,
      });
      expect(old.keep).toBe(false);
    }
  });
});

/* -------------------------------------------------------- the statuses -- */

describe('status protection', () => {
  it('never removes a published article, however old', () => {
    const result = judge(
      draft({ status: ContentStatus.PUBLISHED, createdAt: daysAgo(400), publishedAt: daysAgo(399) }),
      { now: NOW, retentionDays: 3 }
    );

    expect(result).toEqual({ keep: true, reason: 'published' });
  });

  it('never removes a scheduled article', () => {
    expect(
      judge(draft({ status: ContentStatus.SCHEDULED, scheduledFor: new Date('2026-09-01') }), {
        now: NOW,
        retentionDays: 3,
      })
    ).toEqual({ keep: true, reason: 'scheduled_for_publication' });
  });

  it('never removes an article a human has in review', () => {
    expect(verdict({ status: ContentStatus.REVIEW })).toEqual({
      keep: true,
      reason: 'in_editorial_review',
    });
  });

  it('never removes an archived article', () => {
    expect(verdict({ status: ContentStatus.ARCHIVED })).toEqual({ keep: true, reason: 'archived' });
  });

  it('keeps a status it has never seen', () => {
    // The allow-list is the point: a status added to the enum later is
    // protected without anyone remembering to protect it.
    expect(verdict({ status: 'PENDING_LEGAL_REVIEW' as ContentStatus })).toEqual({
      keep: true,
      reason: 'unknown_status',
    });
  });

  it('keeps a DRAFT that still carries a publish date', () => {
    // The ambiguous row: status says draft, the dates say otherwise. Fails
    // closed on the evidence of an editorial decision.
    expect(verdict({ publishedAt: daysAgo(10) })).toEqual({ keep: true, reason: 'published' });
    expect(verdict({ scheduledFor: new Date('2026-09-01') })).toEqual({
      keep: true,
      reason: 'scheduled_for_publication',
    });
  });
});

/* ------------------------------------------------- the editorial intent -- */

describe('editorial intent outranks age and score', () => {
  it('keeps a draft an editor edited, however old', () => {
    expect(verdict({ createdAt: daysAgo(90), updatedById: 'user-7' })).toEqual({
      keep: true,
      reason: 'manual_publish_selection',
    });
  });

  it('keeps a draft a person created', () => {
    expect(verdict({ createdAt: daysAgo(90), createdById: 'user-7' })).toEqual({
      keep: true,
      reason: 'manual_publish_selection',
    });
  });

  it('keeps a pinned or featured draft', () => {
    expect(verdict({ pinned: true }).keep).toBe(true);
    expect(verdict({ featured: true }).keep).toBe(true);
  });

  it('removes an old agent draft nobody touched', () => {
    // The one case that qualifies: agent-created, never edited, past the
    // window, no publish intent anywhere.
    expect(verdict({ createdAt: daysAgo(10) })).toMatchObject({ keep: false });
  });

  it('does not consider a score at all', () => {
    // A low score is a recommendation, not a death sentence, and a high score
    // is not protection. The policy has no score input by construction —
    // these two rows differ only in what an editor did.
    const lowScoreUntouched = verdict({ createdAt: daysAgo(10) });
    const lowScoreSelected = verdict({ createdAt: daysAgo(10), updatedById: 'editor-1' });

    expect(lowScoreUntouched.keep).toBe(false);
    expect(lowScoreSelected.keep).toBe(true);
  });
});

/* ------------------------------------------------------- idempotency -- */

describe('running twice', () => {
  it('skips an article already soft-deleted', () => {
    expect(verdict({ deletedAt: daysAgo(1), createdAt: daysAgo(10) })).toEqual({
      keep: true,
      reason: 'already_removed',
    });
  });
});

/* ------------------------------------------------------ the query filter -- */

describe('the candidate filter', () => {
  it('asks the database only for rows that could qualify', () => {
    const filter = candidateFilter({ now: NOW, retentionDays: 3 });

    expect(filter.status).toBe(ContentStatus.DRAFT);
    expect(filter.deletedAt).toBeNull();
    expect(filter.publishedAt).toBeNull();
    expect(filter.scheduledFor).toBeNull();
    expect(filter.createdAt.lt.toISOString()).toBe('2026-08-22T12:00:00.000Z');
  });
});

/* ------------------------------------------------------------ the sweep -- */

function build(
  rows: RetentionCandidate[],
  settings: { enabled?: boolean; dryRun?: boolean; days?: number; failOn?: string; raceOn?: string } = {}
) {
  const updates: Array<Record<string, unknown>> = [];
  const state = new Map(rows.map(row => [row.id, { ...row }]));

  const prisma = {
    article: {
      // Mirrors Prisma: filter, order, then honour `cursor`/`skip`/`take`.
      // Ignoring `take` made every row arrive in one page, which hid the
      // batching entirely and let un-deleted rows be rescanned.
      // Mirrors Prisma closely enough to exercise keyset pagination: filter,
      // apply the (createdAt, id) > (after) predicate, order, then take.
      findMany: async (args: {
        where: { OR?: Array<Record<string, never>> };
        take: number;
      }) => {
        let all = [...state.values()]
          .filter(row => row.status === ContentStatus.DRAFT && row.deletedAt === null && row.publishedAt === null)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));

        const or = args.where.OR as
          | [{ createdAt: { gt: Date } }, { createdAt: Date; id: { gt: string } }]
          | undefined;

        if (or) {
          const afterCreatedAt = or[0].createdAt.gt;
          const afterId = or[1].id.gt;
          all = all.filter(
            row =>
              row.createdAt > afterCreatedAt ||
              (row.createdAt.getTime() === afterCreatedAt.getTime() && row.id > afterId)
          );
        }

        return all.slice(0, args.take);
      },
      updateMany: async (args: { where: { id: string }; data: { deletedAt: Date } }) => {
        updates.push(args);
        if (settings.failOn === args.where.id) throw new Error('deadlock detected');
        // Simulates an editor acting between scan and write.
        if (settings.raceOn === args.where.id) return { count: 0 };
        const row = state.get(args.where.id);
        if (row) row.deletedAt = args.data.deletedAt;
        return { count: 1 };
      },
      count: async () => 0,
    },
  };

  const config = {
    get: (key: string) =>
      ({
        NEWSROOM_RETENTION_ENABLED: settings.enabled ?? true,
        NEWSROOM_RETENTION_DRY_RUN: settings.dryRun ?? false,
        NEWSROOM_DRAFT_RETENTION_DAYS: settings.days ?? 3,
        NEWSROOM_RETENTION_BATCH_SIZE: 2,
      })[key],
  };

  return {
    service: new RetentionService(prisma as never, config as never),
    updates,
    state,
  };
}

describe('the sweep', () => {
  const oldDrafts = () =>
    Array.from({ length: 5 }, (_, i) =>
      draft({ id: `old-${i}`, createdAt: daysAgo(10 + i), title: `Draft ${i}` })
    );

  it('deletes every eligible draft, in batches', async () => {
    const { service, updates } = build(oldDrafts());
    const summary = await service.sweep({ now: NOW });

    expect(summary.deleted).toBe(5);
    expect(summary.failed).toBe(0);
    expect(updates).toHaveLength(5);
    // Batch size 2 across 5 rows.
    expect(summary.batches).toBeGreaterThan(1);
  });

  it('performs zero writes in dry run', async () => {
    const { service, updates } = build(oldDrafts(), { dryRun: true });
    const summary = await service.sweep({ now: NOW });

    expect(updates).toHaveLength(0);
    expect(summary.deleted).toBe(0);
    expect(summary.eligible).toBe(5);
    expect(summary.wouldDelete).toHaveLength(5);
    // Oldest first: the fixture ages rows by index, so old-4 (14 days) leads.
    // Worth asserting — an operator reading a truncated dry run should see the
    // most overdue drafts, not an arbitrary slice.
    expect(summary.wouldDelete![0]).toMatchObject({ id: 'old-4', status: ContentStatus.DRAFT });
    expect(summary.wouldDelete!.map(row => row.id)).toEqual(['old-4', 'old-3', 'old-2', 'old-1', 'old-0']);
  });

  it('does nothing at all when disabled', async () => {
    const { service, updates } = build(oldDrafts(), { enabled: false });
    const summary = await service.sweep({ now: NOW });

    expect(updates).toHaveLength(0);
    expect(summary.scanned).toBe(0);
    expect(summary.enabled).toBe(false);
  });

  it('is a no-op the second time', async () => {
    const { service, updates } = build(oldDrafts());
    await service.sweep({ now: NOW });
    const second = await service.sweep({ now: NOW });

    expect(second.deleted).toBe(0);
    expect(updates).toHaveLength(5);
  });

  it('keeps going when one deletion fails', async () => {
    const { service } = build(oldDrafts(), { failOn: 'old-2' });
    const summary = await service.sweep({ now: NOW });

    expect(summary.failed).toBe(1);
    expect(summary.deleted).toBe(4);
    expect(summary.event).toBe('RETENTION_SCAN_COMPLETED');
  });

  it('does not mark a failed row deleted', async () => {
    const { service, state } = build(oldDrafts(), { failOn: 'old-2' });
    await service.sweep({ now: NOW });

    expect(state.get('old-2')!.deletedAt).toBeNull();
  });

  it('loses the race safely when an editor acts mid-sweep', async () => {
    // The write matched zero rows because the WHERE clause no longer held.
    const { service, state } = build(oldDrafts(), { raceOn: 'old-3' });
    const summary = await service.sweep({ now: NOW });

    expect(state.get('old-3')!.deletedAt).toBeNull();
    expect(summary.deleted).toBe(4);
    expect(summary.failed).toBe(0);
    expect(summary.protectedByReason.manual_publish_selection).toBe(1);
  });

  it('re-checks every protection inside the write', async () => {
    // The race guard is the WHERE clause, so it has to carry the conditions.
    const { service, updates } = build(oldDrafts());
    await service.sweep({ now: NOW });

    expect(updates[0]!.where).toMatchObject({
      status: ContentStatus.DRAFT,
      deletedAt: null,
      publishedAt: null,
      scheduledFor: null,
      pinned: false,
      featured: false,
      createdById: null,
      updatedById: null,
    });
  });

  it('soft-deletes rather than destroying', async () => {
    const { service, updates } = build(oldDrafts());
    await service.sweep({ now: NOW });

    expect(updates[0]!.data).toEqual({ deletedAt: NOW });
  });

  it('never logs article bodies', async () => {
    const { service } = build(oldDrafts(), { dryRun: true });
    const summary = await service.sweep({ now: NOW });

    const serialised = JSON.stringify(summary);
    expect(serialised).not.toContain('<p>');
    // The headline is included because it is what makes a dry run readable.
    expect(summary.wouldDelete![0]!.title).toBe('Draft 4');
  });

  it('respects a retention override from the CLI', async () => {
    const { service } = build(oldDrafts(), { days: 3 });
    const summary = await service.sweep({ now: NOW, retentionDays: 365 });

    expect(summary.deleted).toBe(0);
    expect(summary.retentionDays).toBe(365);
  });

  it('reports a cutoff an operator can check', async () => {
    const { service } = build([], {});
    const summary = await service.sweep({ now: NOW, retentionDays: 3 });

    expect(summary.cutoff).toBe('2026-08-22T12:00:00.000Z');
  });
});
