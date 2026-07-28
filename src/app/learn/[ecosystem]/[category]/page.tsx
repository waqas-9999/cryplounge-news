import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isEcosystem, labelForSlug } from '@/lib/taxonomy';
import { EcosystemCategoryView, EcosystemOverviewView, EcosystemTutorialsView } from '@/views';

type Params = { params: Promise<{ ecosystem: string; category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ecosystem, category } = await params;
  return {
    title: `${labelForSlug(category)} — ${labelForSlug(ecosystem)}`,
    alternates: { canonical: `/learn/${ecosystem}/${category}` },
  };
}

export default async function Page({ params }: Params) {
  const { ecosystem, category } = await params;
  if (!isEcosystem(ecosystem)) notFound();
  if (category === 'overview') return <EcosystemOverviewView ecosystem={ecosystem} />;
  if (category === 'tutorials') return <EcosystemTutorialsView ecosystem={ecosystem} />;
  return <EcosystemCategoryView ecosystem={ecosystem} category={category} />;
}
