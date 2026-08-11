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
  const articles = await getLatestArticles(5);
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

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

      <div className="grid lg:grid-cols-2 gap-5">
        <Link
          href={articleHref(lead)}
          className="group flex flex-col justify-end min-h-[280px] lg:min-h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 hover:border-[#FFD200] dark:hover:border-[#FFD200] transition-colors"
        >
          <span className="inline-flex items-center gap-2 mb-4 self-start px-2.5 py-1 rounded-full bg-[#FFD200]/10 text-[#EFB81A] dark:text-[#FFD200] text-xs font-medium uppercase tracking-wide">
            {lead.category}
          </span>
          <h4 className="text-xl md:text-2xl text-gray-900 dark:text-white font-serif leading-snug line-clamp-3 group-hover:text-[#EFB81A] dark:group-hover:text-[#FFD200] transition-colors">
            {lead.title}
          </h4>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{lead.author}</span>
            <span aria-hidden="true">·</span>
            <span>{lead.readTime}</span>
          </div>
        </Link>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {rest.map(article => (
            <li key={article.id}>
              <Link
                href={articleHref(article)}
                className="group block h-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-[#FFD200] dark:hover:border-[#FFD200] transition-colors"
              >
                <span className="block text-xs text-[#EFB81A] dark:text-[#FFD200] mb-2">{article.category}</span>
                <span className="block text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#EFB81A] dark:group-hover:text-[#FFD200] transition-colors">
                  {article.title}
                </span>
                <span className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{article.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
