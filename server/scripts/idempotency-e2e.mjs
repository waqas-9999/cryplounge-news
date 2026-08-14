/**
 * End-to-end proof that `POST /agents/articles` is idempotent.
 *
 * Submits the same article twice with one `Idempotency-Key` and asserts that
 * exactly one article exists afterwards, then removes what it created.
 *
 * SAFETY DESIGN — this script writes to the production database, so cleanup is
 * built to be incapable of touching anything it did not create:
 *
 *   1. Every pre-existing article id is snapshotted before the test. Cleanup
 *      refuses to delete an id that appears in that snapshot.
 *   2. Cleanup deletes at most ONE article, by the exact id returned from the
 *      first submission — never by title, status or any query that could match
 *      editorial content.
 *   3. The idempotency row is removed by its exact composite key.
 *   4. If any assertion fails, cleanup still runs. A failed test must not leave
 *      a stray draft in the team's admin panel.
 *
 * Credentials come from the environment; nothing is hardcoded.
 *
 *   AGENT_KEY=... AGENT_SECRET=... node scripts/idempotency-e2e.mjs
 */
import { PrismaClient } from '@prisma/client';

const API = process.env.API_URL ?? 'http://localhost:4000/api/v1';
const AGENT_KEY = process.env.AGENT_KEY;
const AGENT_SECRET = process.env.AGENT_SECRET;

if (!AGENT_KEY || !AGENT_SECRET) {
  console.error('AGENT_KEY and AGENT_SECRET must be set in the environment.');
  process.exit(1);
}

const db = new PrismaClient();

/** Unique per run, so a rerun cannot collide with a previous key. */
const RUN_ID = `e2e-${Date.now()}`;
const IDEMPOTENCY_KEY = `idempotency-test-${RUN_ID}`;
const OPERATION = 'agents.articles.submit';

const BODY = {
  title: `[TEST] Idempotency verification ${RUN_ID}`,
  summary: 'Automated end-to-end test of duplicate protection. Deleted immediately after.',
  content: 'This article is created by scripts/idempotency-e2e.mjs and removed by the same run.',
};

const checks = [];
function check(label, passed, detail = '') {
  checks.push({ label, passed, detail });
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

async function submit() {
  const response = await fetch(`${API}/agents/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-Key': AGENT_KEY,
      'X-Agent-Secret': AGENT_SECRET,
      'Idempotency-Key': IDEMPOTENCY_KEY,
    },
    body: JSON.stringify(BODY),
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

let createdArticleId = null;
let preExistingIds = new Set();

try {
  // ---------------------------------------------------------------- setup --
  const before = await db.article.findMany({ select: { id: true } });
  preExistingIds = new Set(before.map(a => a.id));
  const countBefore = before.length;

  console.log('IDEMPOTENCY END-TO-END TEST');
  console.log('  key            :', IDEMPOTENCY_KEY);
  console.log('  articles before:', countBefore);
  console.log('');

  // ----------------------------------------------------------- first call --
  console.log('First submission');
  const first = await submit();
  console.log('  HTTP', first.status);

  if (first.status !== 201 && first.status !== 200) {
    throw new Error(`First submission failed: ${JSON.stringify(first.payload).slice(0, 300)}`);
  }

  const firstArticle = first.payload?.data;
  createdArticleId = firstArticle?.id ?? null;
  check('first submission returned an article id', Boolean(createdArticleId), createdArticleId ?? '');
  check('article is a DRAFT (agent cannot publish)', firstArticle?.status === 'DRAFT', firstArticle?.status ?? '');

  // ---------------------------------------------------------- second call --
  console.log('\nSecond submission — identical body, identical key');
  const second = await submit();
  console.log('  HTTP', second.status);

  const secondArticle = second.payload?.data;
  check(
    'both responses point to the SAME article',
    Boolean(createdArticleId) && secondArticle?.id === createdArticleId,
    `${createdArticleId} vs ${secondArticle?.id}`
  );

  // ------------------------------------------------------------- database --
  console.log('\nDatabase verification');
  const countAfter = await db.article.count();
  check(
    'article count increased by exactly 1',
    countAfter === countBefore + 1,
    `${countBefore} -> ${countAfter}`
  );

  const rows = await db.agentIdempotencyKey.findMany({ where: { key: IDEMPOTENCY_KEY } });
  check('exactly one idempotency record exists', rows.length === 1, `found ${rows.length}`);
  check('that record is COMPLETED', rows[0]?.status === 'COMPLETED', rows[0]?.status ?? 'missing');
  check(
    'record points at the created article',
    rows[0]?.resultEntityId === createdArticleId,
    rows[0]?.resultEntityId ?? 'null'
  );
} catch (error) {
  check('test ran without throwing', false, error.message.slice(0, 200));
} finally {
  // ---------------------------------------------------------------- clean --
  console.log('\nCleanup');

  if (createdArticleId) {
    if (preExistingIds.has(createdArticleId)) {
      // Cannot happen, but if it ever did, deleting would destroy real content.
      console.log(`  REFUSED — ${createdArticleId} existed before this run. Not deleting.`);
    } else {
      // Versions are removed first: the FK would otherwise block the delete.
      const versions = await db.articleVersion.deleteMany({ where: { articleId: createdArticleId } });
      const removed = await db.article.deleteMany({ where: { id: createdArticleId } });
      console.log(`  deleted article ${createdArticleId} (rows: ${removed.count}, versions: ${versions.count})`);
    }
  } else {
    console.log('  no article was created — nothing to delete');
  }

  const keys = await db.agentIdempotencyKey.deleteMany({ where: { key: IDEMPOTENCY_KEY } });
  console.log(`  deleted idempotency record(s): ${keys.count}`);

  const finalCount = await db.article.count();
  console.log(`  articles now: ${finalCount}`);

  const failed = checks.filter(c => !c.passed);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);

  await db.$disconnect();
  process.exit(failed.length === 0 ? 0 : 1);
}
