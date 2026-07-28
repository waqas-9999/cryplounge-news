import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isNewsCategory, labelForSlug, NEWS_CATEGORIES } from '@/lib/taxonomy';
import {
  LatestView,
  MarketsView,
  EcosystemNewsView,
  RegulationView,
  ResearchView,
  BusinessView,
  FinanceView,
  GeopoliticsView,
  TechnologyView,
  CategoryView,
} from '@/views';

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
    description: `The latest ${label.toLowerCase()} news, analysis and reporting from CrypLounge.`,
    alternates: { canonical: `/news/${category}` },
  };
}

export default async function Page({ params }: Params) {
  const { category } = await params;
  if (!isNewsCategory(category)) notFound();

  switch (category) {
    case 'latest':
      return <LatestView />;
    case 'markets':
      return <MarketsView />;
    case 'ecosystem':
      return <EcosystemNewsView />;
    case 'regulation':
      return <RegulationView />;
    case 'research':
      return <ResearchView />;
    case 'business':
      return <BusinessView />;
    case 'finance':
      return <FinanceView />;
    case 'geopolitics':
      return <GeopoliticsView />;
    case 'technology':
      return <TechnologyView />;
    default:
      return <CategoryView category={category} />;
  }
}
