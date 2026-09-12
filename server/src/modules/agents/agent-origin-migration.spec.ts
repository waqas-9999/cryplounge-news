import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The agent-origin migration, read as text.
 *
 * The jest suite deliberately never touches a database, so these tests pin the
 * properties of the backfill that would be dangerous to lose in an edit. They
 * do not execute it: running the SQL against a disposable Postgres with
 * fixtures is a separate verification step.
 *
 * The property that matters most: `"createdById" IS NULL` narrows the rows the
 * backfill may touch, and is never on its own a reason to attribute one.
 */

const sql = readFileSync(
  join(__dirname, '..', '..', '..', 'prisma', 'migrations', '20260912020000_add_agent_origin', 'migration.sql'),
  'utf8'
);

/** The statement with comments removed, so prose cannot satisfy a pattern. */
const code = sql
  .split('\n')
  .map(line => line.replace(/--.*$/, ''))
  .join('\n');

const backfill = code.slice(code.indexOf('WITH unique_agent_names'));

describe('the agent-origin schema change', () => {
  it('adds both columns as nullable, guarded for re-runs', () => {
    expect(code).toMatch(/ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "createdByAgentId" TEXT;/);
    expect(code).toMatch(/ALTER TABLE "Media"\s+ADD COLUMN IF NOT EXISTS "uploadedByAgentId" TEXT;/);
    expect(code).not.toMatch(/ADD COLUMN[^;]*NOT NULL/);
  });

  it('matches the index and constraint names Prisma generates for the schema', () => {
    for (const name of [
      'Article_createdByAgentId_status_idx',
      'Media_uploadedByAgentId_idx',
      'Article_createdByAgentId_fkey',
      'Media_uploadedByAgentId_fkey',
    ]) {
      expect(code).toContain(`"${name}"`);
    }
  });

  it('fails closed when an agent is deleted', () => {
    expect(code.match(/ON DELETE SET NULL/g)).toHaveLength(2);
    expect(code).not.toMatch(/ON DELETE CASCADE/);
  });
});

describe('the article agent-origin backfill', () => {
  it('attributes only from records that name an agent', () => {
    expect(backfill).toContain('"AgentIdempotencyKey"');
    expect(backfill).toContain('"AgentRequestLog"');
    expect(backfill).toContain('"AuditLog"');
  });

  it('refuses an article whose evidence names more than one agent', () => {
    expect(backfill).toMatch(/HAVING COUNT\(DISTINCT agent_id\) = 1/);
  });

  it('uses an audit name only when exactly one agent holds that name', () => {
    expect(backfill).toMatch(/GROUP BY "name"\s+HAVING COUNT\(\*\) = 1/);
  });

  it('never attributes an article that has a human creator', () => {
    expect(backfill).toMatch(/ar\."createdById" IS NULL/);
  });

  it('does not treat a null creator as evidence', () => {
    // The only place the null check appears is the final guard on the UPDATE;
    // no evidence source selects articles by it.
    const evidence = backfill.slice(0, backfill.indexOf('UPDATE "Article"'));
    expect(evidence).not.toMatch(/createdById/);
  });

  it('is idempotent', () => {
    expect(backfill).toMatch(/ar\."createdByAgentId" IS NULL/);
  });

  it('writes only the origin column', () => {
    const set = backfill.slice(backfill.indexOf('SET'), backfill.indexOf('FROM resolved'));
    expect(set.trim()).toBe('SET "createdByAgentId" = r.agent_id');
  });

  it('does not backfill media ownership', () => {
    expect(code).not.toMatch(/UPDATE "Media"/);
  });
});
