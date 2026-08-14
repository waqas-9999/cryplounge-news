/**
 * End-to-end proof of the AI → CrypLounge draft path.
 *
 * IMPORTANT — what this does NOT prove: no LLM is configured, so the article
 * body is NOT AI-generated. It is assembled from real discovery metadata and
 * labelled as such in the body itself. This test exercises the *plumbing*:
 * agent auth, category resolution to a real id, idempotency, DRAFT status, and
 * source attribution. Article generation remains unimplemented and unproven.
 *
 * Cleanup follows the same rules as scripts/idempotency-e2e.mjs: pre-existing
 * article ids are snapshotted, deletion is by exact id only, and it runs in
 * `finally` so a failure cannot leave a stray draft in the admin panel.
 *
 *   AGENT_KEY=... AGENT_SECRET=... node scripts/ai-draft-e2e.mjs
 */
import { PrismaClient } from '@prisma/client';

const API = process.env.API_URL ?? 'http://localhost:4000/api/v1';
const AGENT_KEY = process.env.AGENT_KEY;
const AGENT_SECRET = process.env.AGENT_SECRET;

if (!AGENT_KEY || !AGENT_SECRET) {
  console.error('AGENT_KEY and AGENT_SECRET must be set.');
  process.exit(1);
}

const db = new PrismaClient();
const RUN_ID = `${Date.now()}`;
const IDEMPOTENCY_KEY = `newsroom-cluster-e2e${RUN_ID}-v1`;

const checks = [];
const check = (label, passed, detail = '') => {
  checks.push({ label, passed });
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

let createdId = null;
let preExisting = new Set();

try {
  const before = await db.article.findMany({ select: { id: true } });
  preExisting = new Set(before.map(a => a.id));

  // --- resolve a REAL category id, exactly as the newsroom would ------------
  const category = await db.category.findUnique({
    where: { kind_slug: { kind: 'NEWS', slug: 'market' } },
  });
  if (!category) throw new Error('NEWS category "market" not found');

  const author = await db.author.findUnique({ where: { slug: 'cryplounge-newsroom' } });

  console.log('AI DRAFT PIPELINE — END TO END');
  console.log('  articles before :', before.length);
  console.log('  category        :', category.slug, `(${category.id})`);
  console.log('  author          :', author?.name ?? 'none', `(${author?.id ?? 'null'})`);
  console.log('  idempotency key :', IDEMPOTENCY_KEY);
  console.log('');

  // Real source URLs from the discovery pipeline's authority tiers.
  const sources = [
    { url: 'https://www.sec.gov/news/pressreleases', title: 'SEC press releases', domain: 'sec.gov' },
    { url: 'https://www.reuters.com/markets/', title: 'Reuters markets', domain: 'reuters.com' },
  ];

  const sourceBlock = `\n<h2>Sources</h2>\n<ul>\n${sources
    .map(s => `<li><a href="${s.url}" rel="nofollow noopener" target="_blank">${s.title}</a> — ${s.domain}</li>`)
    .join('\n')}\n</ul>`;

  const body =
    '<p><strong>This is an automated pipeline test, not journalism.</strong> No language model was ' +
    'configured, so no article content was generated. This body exists only to exercise the ' +
    'submission path and is deleted immediately after verification.</p>\n' +
    `<p>${'It verifies agent authentication, category resolution to a real CrypLounge category id, idempotent submission, DRAFT status and source attribution. '.repeat(4)}</p>` +
    sourceBlock;

  const draft = {
    title: `[AI-TEST] Pipeline verification draft ${RUN_ID}`,
    slug: `ai-test-pipeline-verification-${RUN_ID}`,
    summary:
      'Automated verification of the AI submission pipeline. Not generated content and not for publication. Removed automatically after the checks complete.',
    content: body,
    categoryId: category.id,
    ...(author ? { authorId: author.id } : {}),
    seoTitle: '[AI-TEST] Pipeline verification',
    seoDescription: 'Automated pipeline test draft. Deleted immediately after verification.',
    readMinutes: 1,
  };

  const submit = () =>
    fetch(`${API}/agents/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Key': AGENT_KEY,
        'X-Agent-Secret': AGENT_SECRET,
        'Idempotency-Key': IDEMPOTENCY_KEY,
      },
      body: JSON.stringify(draft),
    }).then(async r => ({ status: r.status, payload: await r.json().catch(() => null) }));

  console.log('Submission');
  const first = await submit();
  console.log('  HTTP', first.status);
  if (first.status >= 400) throw new Error(JSON.stringify(first.payload).slice(0, 300));

  createdId = first.payload?.data?.id ?? null;
  const created = createdId ? await db.article.findUnique({ where: { id: createdId } }) : null;

  check('article created', Boolean(created), createdId ?? '');
  check('status is DRAFT — never PUBLISHED', created?.status === 'DRAFT', created?.status ?? '');
  check('uses the real CrypLounge category id', created?.categoryId === category.id, created?.categoryId ?? '');
  check('carries the newsroom byline', created?.authorId === author?.id, created?.authorId ?? 'null');
  check('publishedAt is null', created?.publishedAt === null, String(created?.publishedAt));
  check('canonicalUrl not set to a source', !created?.canonicalUrl, created?.canonicalUrl ?? 'null');
  check('source URLs preserved in body', sources.every(s => created?.content.includes(s.url)));
  check('featuredImageId may be null', created?.featuredImageId === null, String(created?.featuredImageId));

  console.log('\nIdempotent retry');
  const second = await submit();
  check('retry returned the same article', second.payload?.data?.id === createdId);
  check('article count increased by exactly 1', (await db.article.count()) === before.length + 1);

  const keys = await db.agentIdempotencyKey.findMany({ where: { key: IDEMPOTENCY_KEY } });
  check('one COMPLETED idempotency record', keys.length === 1 && keys[0]?.status === 'COMPLETED');
} catch (error) {
  check('test ran without throwing', false, error.message.slice(0, 200));
} finally {
  console.log('\nCleanup');
  if (createdId && !preExisting.has(createdId)) {
    const versions = await db.articleVersion.deleteMany({ where: { articleId: createdId } });
    const removed = await db.article.deleteMany({ where: { id: createdId } });
    console.log(`  deleted article ${createdId} (rows: ${removed.count}, versions: ${versions.count})`);
  } else if (createdId) {
    console.log(`  REFUSED — ${createdId} pre-existed. Not deleting.`);
  } else {
    console.log('  nothing was created');
  }

  const keys = await db.agentIdempotencyKey.deleteMany({ where: { key: IDEMPOTENCY_KEY } });
  console.log(`  deleted idempotency record(s): ${keys.count}`);
  console.log(`  articles now: ${await db.article.count()}`);

  const failed = checks.filter(c => !c.passed).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
  await db.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}
