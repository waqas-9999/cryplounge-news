import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isEcosystem, labelForSlug } from '@/lib/taxonomy';
import { CrypLearnView, EcosystemLearnHubView, EcosystemLearnView } from '@/views';

type Params = { params: Promise<{ ecosystem: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ecosystem } = await params;
  if (ecosystem === 'crypto') {
    return { title: 'Crypto Fundamentals', description: 'Learn blockchain and crypto from first principles.' };
  }
  if (ecosystem === 'ecosystem') {
    return { title: 'Ecosystem Learning Hub', description: 'Pick an ecosystem and learn how to build on it.' };
  }
  const label = labelForSlug(ecosystem);
  return {
    title: `Learn ${label}`,
    description: `Courses, tutorials and guides for the ${label} ecosystem.`,
    alternates: { canonical: `/learn/${ecosystem}` },
  };
}

export default async function Page({ params }: Params) {
  const { ecosystem } = await params;
  if (ecosystem === 'crypto') return <CrypLearnView />;
  if (ecosystem === 'ecosystem') return <EcosystemLearnHubView />;
  if (!isEcosystem(ecosystem)) notFound();
  return <EcosystemLearnView ecosystem={ecosystem} />;
}
