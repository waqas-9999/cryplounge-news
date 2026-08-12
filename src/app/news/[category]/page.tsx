import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isNewsCategory, labelForSlug, NEWS_CATEGORIES } from '@/lib/taxonomy';
import { MarketNewsView, BusinessView, TechnologyView, CategoryView } from '@/views';
import { listArticles } from '@/services/news';

/**
 * Editorial content changes between builds: an article published, updated or
 * deleted in the CMS must appear on the live site without a redeploy. Without
 * this the route is rendered once at build time and served from the full route
 * cache forever, which is why removed articles kept showing.
 */
export const revalidate = 60;

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return NEWS_CATEGORIES.map(category => ({ category }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  if (!isNewsCategory(category)) return { title: 'Not Found' };
  const label = labelForSlug(category);
  return {
    title: `${label} News`,
    description: `${label} news, analysis and reporting from the CrypLounge newsroom.`,
    alternates: { canonical: `/news/${category}` },
  };
}

/**
 * Category listing.
 *
 * Articles are fetched here on the server so the headlines and their links are
 * in the initial HTML. Previously every category rendered client-side, and the
 * non-market/business/technology categories additionally rendered *generated*
 * cross-promotion articles whose slugs pointed at pages that do not exist —
 * now that cards are real anchors, those would have been crawlable links to
 * 404s. Both sources are replaced with real API data here.
 */
export default async function Page({ params }: Params) {
  const { category } = await params;
  if (!isNewsCategory(category)) notFound();

  const { items, totalPages } = await listArticles({ category, perPage: 13 });

  switch (category) {
    case 'market':
      return <MarketNewsView initialArticles={items} initialTotalPages={totalPages} />;
    case 'business':
      return <BusinessView initialArticles={items} initialTotalPages={totalPages} />;
    case 'technology':
      return <TechnologyView initialArticles={items} initialTotalPages={totalPages} />;
    default: {
      // "Related" means genuinely other recent coverage, not this category
      // repeated — real rows, so every link resolves.
      const latest = await listArticles({ perPage: 20 });
      const related = latest.items.filter(article => article.categorySlug !== category).slice(0, 6);

      return <CategoryView category={category} initialArticles={items} relatedArticles={related} />;
    }
  }
}
