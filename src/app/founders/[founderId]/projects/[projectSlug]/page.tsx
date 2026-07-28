import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { FounderProjectView } from '@/views';

type Params = { params: Promise<{ founderId: string; projectSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { founderId, projectSlug } = await params;
  return {
    title: `${labelForSlug(projectSlug)} — ${labelForSlug(founderId)}`,
    alternates: { canonical: `/founders/${founderId}/projects/${projectSlug}` },
  };
}

export default async function Page({ params }: Params) {
  const { founderId, projectSlug } = await params;
  return <FounderProjectView founderId={founderId} projectSlug={projectSlug} />;
}
