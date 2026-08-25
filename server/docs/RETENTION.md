# Draft retention

Automatic cleanup of old AI-generated drafts.

## What it does

Once a day at 04:00, articles that are **all** of the following are soft-deleted:

- status `DRAFT`
- `createdAt` strictly older than the retention window (default 3 days)
- `publishedAt` is null and `scheduledFor` is null
- not `pinned`, not `featured`
- `createdById` and `updatedById` are both null — no person has touched it
- not already soft-deleted

Anything else is kept.

## Soft delete, and what that means

The job sets `deletedAt`, exactly as an editor pressing delete does. It does
**not** run `DELETE`.

- A mistake is recoverable with a single `UPDATE`.
- No foreign keys change, so nothing is orphaned: `ArticleVersion` rows,
  `Media`, categories, tags and sources are untouched by construction.
- **It does not reclaim disk.** Soft-deleted rows still occupy storage. If the
  goal is to shrink the database, see "What actually uses the space" below.

Cloudinary and other object storage are never touched. Media cleanup is a
separate concern and deliberately not part of this job.

## Status classification

| Status | Verdict | Why |
|---|---|---|
| `DRAFT` | **ELIGIBLE** | subject to age and the protections above |
| `REVIEW` | KEEP | a human has it in hand |
| `SCHEDULED` | KEEP | queued to publish |
| `PUBLISHED` | KEEP | never removed, at any age |
| `ARCHIVED` | KEEP | deliberately retired, not abandoned |
| anything else | KEEP | unknown statuses fail closed |

The policy is an **allow-list**: a status is eligible only if named eligible in
`retention-policy.ts`. A status added to the enum later is protected without
anyone remembering to protect it.

## Editorial intent beats age, and score is not consulted

`ContentStatus` has no "approved" or "publish queued" value, so editorial
intent is read from the fields that exist: `createdById`, `updatedById`,
`pinned`, `featured`, `publishedAt`, `scheduledFor`. Any of them protects the
row regardless of age.

**The article's score is never an input.** A story scoring 42 that an editor
selected is worth more than one scoring 95 that nobody looked at. Retention is
storage housekeeping; it does not rank content and it never overrules a person.

## The race

An editor can act between the scan and the write. Every deletion is a
conditional `updateMany` whose WHERE clause repeats all the protections, so if
the row changed underneath, zero rows match and the article survives. The
database decides, not the job. That case is logged as
`RETENTION_DRAFT_PROTECTED` with `reason: state_changed_during_sweep`.

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `NEWSROOM_RETENTION_ENABLED` | `false` | master switch |
| `NEWSROOM_RETENTION_DRY_RUN` | `true` | report only, change nothing |
| `NEWSROOM_DRAFT_RETENTION_DAYS` | `3` | the window |
| `NEWSROOM_RETENTION_BATCH_SIZE` | `100` | rows per page |

Both safety flags default to the safe value, so a partial configuration does
nothing rather than something.

### Changing the window

Set `NEWSROOM_DRAFT_RETENTION_DAYS`. It is read in one place; nothing
hardcodes 3.

### Disabling

Set `NEWSROOM_RETENTION_ENABLED=false`. The cron still fires and returns
immediately.

## Rollout

**Phase 1 — observe.**

```bash
NEWSROOM_RETENTION_ENABLED=true
NEWSROOM_RETENTION_DRY_RUN=true
```

Read `RETENTION_SCAN_COMPLETED`, check `wouldDelete`, confirm nothing you care
about is listed. Leave it here for a few days.

**Phase 2 — enable.**

```bash
NEWSROOM_RETENTION_DRY_RUN=false
```

## Manual runs

```bash
npm run newsroom:cleanup-drafts -- --dry-run
```

```bash
npm run newsroom:cleanup-drafts -- --days=7 --dry-run
```

Dry run is the default; `--execute` is required to write, and `--dry-run` wins
if both are passed. The command cannot delete because a flag was forgotten.

## Logging

`RETENTION_SCAN_STARTED`, `RETENTION_DRAFT_FOUND`, `RETENTION_DRAFT_DELETED`,
`RETENTION_DRAFT_PROTECTED`, `RETENTION_DRAFT_FAILED`,
`RETENTION_SCAN_COMPLETED`, `RETENTION_SCAN_FAILED`,
`RETENTION_STORAGE_REPORT`.

Headlines are logged; **article bodies never are**.

## Indexes

None added. `Article` holds roughly 90 live rows and the sweep completes in
about two seconds against production. `@@index([status, publishedAt])` already
exists. A composite `[status, createdAt]` index would be justified in the tens
of thousands of rows; adding one now would cost writes and buy nothing.

Revisit if `draftsTotal` in the storage report reaches five figures.

## What actually uses the space

Measured on the AI database, which is the large one:

| Table | Rows | Size |
|---|---|---|
| `NewsCluster` | 62,587 | 38 MB |
| `TrendSnapshot` | 62,586 | 30 MB |
| `AIJob` | 13,537 | 28 MB |
| `ArticleDraft` | 97 | 320 kB |

Draft retention addresses the bottom row. **Removing every draft would recover
about 0.3% of the database.** Clusters, trend snapshots and jobs are 91% of it,
and 16,276 clusters are already older than three days.

Those tables are pipeline artifacts rather than editorial content, so cleaning
them is a lower-risk change than this one — but it is a separate job against a
separate database, and it is not implemented here.
