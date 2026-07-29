import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isNewsCategory, labelForSlug, NEWS_CATEGORIES } from '@/lib/taxonomy';
import { MarketNewsView, BusinessView, TechnologyView, CategoryView } from '@/views';

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

export default async function Page({ params }: Params) {
  const { category } = await params;
  if (!isNewsCategory(category)) notFound();

  switch (category) {
    case 'market':
      return <MarketNewsView />;
    case 'business':
      return <BusinessView />;
    case 'technology':
      return <TechnologyView />;
    default:
      return <CategoryView category={category} />;
  }
}
