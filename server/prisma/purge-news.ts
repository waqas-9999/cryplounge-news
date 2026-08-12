/**
 * Hard-deletes every news article, plus the authors and tags left orphaned by
 * that deletion.
 *
 * Why this exists: the seed used to import `src/data/mockArticles.ts` into the
 * `Article` table, so the site shipped with demo journalism in the database.
 * Deleting an article in the CMS only sets `deletedAt`, so those rows survive
 * — hidden from the site, but still counted, still in version history, and
 * still restorable. This removes them for good, ahead of real publishing.
 *
 * Destructive and irreversible. It refuses to run without an explicit
 * confirmation, and `--dry-run` reports what it would delete without touching
 * anything.
 *
 *   npx tsx prisma/purge-news.ts --dry-run
 *   PURGE_CONFIRM=DELETE_ALL_ARTICLES npx tsx prisma/purge-news.ts
 *
 * Take a database backup first.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const dryRun = process.argv.includes('--dry-run');
const CONFIRM = 'DELETE_ALL_ARTICLES';

async function main() {
  const total = await db.article.count();
  const live = await db.article.count({ where: { deletedAt: null } });

  console.log(`articles: ${total} total (${live} live, ${total - live} already soft-deleted)`);

  if (dryRun) {
    const orphanAuthors = await db.author.count({
      where: { articles: { none: {} }, research: { none: {} } },
    });
    console.log(`would delete: ${total} articles, their versions, and any author/tag left orphaned`);
    console.log(`authors currently orphaned: ${orphanAuthors}`);
    console.log('dry run — nothing was changed.');
    return;
  }

  if (process.env.PURGE_CONFIRM !== CONFIRM) {
    throw new Error(
      `Refusing to delete ${total} articles.\n` +
        `Re-run with PURGE_CONFIRM=${CONFIRM} once you have a backup, ` +
        'or pass --dry-run to preview.'
    );
  }

  // Versions cascade from Article, but deleting them first keeps the delete
  // from depending on cascade behaviour holding for every row.
  const versions = await db.articleVersion.deleteMany({});
  const articles = await db.article.deleteMany({});

  // Authors and tags are shared with other content types, so only the ones
  // now attached to nothing are removed.
  const authors = await db.author.deleteMany({
    where: { articles: { none: {} }, research: { none: {} } },
  });
  const tags = await db.tag.deleteMany({
    where: {
      articles: { none: {} },
      projects: { none: {} },
      research: { none: {} },
      regulations: { none: {} },
      events: { none: {} },
      founders: { none: {} },
    },
  });

  console.log(
    `deleted — articles: ${articles.count}, versions: ${versions.count}, ` +
      `orphaned authors: ${authors.count}, orphaned tags: ${tags.count}`
  );
  console.log('Categories were left intact: the seven news desks stay.');
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
