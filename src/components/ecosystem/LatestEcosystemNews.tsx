import Link from 'next/link';
import { SectionHeader } from '@/components/section/SectionHeader';
import { getLatestArticles, articleHref } from '@/services/news';

/**
 * A single, deliberately small news block for the Ecosystem homepage.
 *
 * The Ecosystem section is a directory: news supports project discovery rather
 * than competing with it, so this sits last and stays compact.
 */
export async function LatestEcosystemNews() {
  const articles = await getLatestArticles(4);
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="ecosystem-news">
      <h2 id="ecosystem-news" className="sr-only">
        Latest Ecosystem News
      </h2>
      <SectionHeader
        as="h3"
        title="Latest Ecosystem News"
        description="Reporting from the newsroom on the projects above."
        href="/news/industry"
        linkLabel="All news"
      />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map(article => (
          <li key={article.id}>
            <Link
              href={articleHref(article)}
              className="group block h-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-[#EFB81A] transition-colors"
            >
              <span className="block text-xs text-[#EFB81A] mb-2">{article.category}</span>
              <span className="block text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-[#EFB81A] transition-colors">
                {article.title}
              </span>
              <span className="block mt-2 text-xs text-gray-400 dark:text-gray-500">
                {article.readTime}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
