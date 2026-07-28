import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { FounderDetailView } from '@/views';

type Params = { params: Promise<{ founderId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { founderId } = await params;
  return {
    title: labelForSlug(founderId),
    alternates: { canonical: `/founders/${founderId}` },
    openGraph: { type: 'profile' },
  };
}

export default async function Page({ params }: Params) {
  const { founderId } = await params;
  return <FounderDetailView founderId={founderId} />;
}
