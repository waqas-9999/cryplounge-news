import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isEcosystem, labelForSlug } from '@/lib/taxonomy';
import { EcosystemProjectView } from '@/views';

type Params = { params: Promise<{ ecosystem: string; project: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ecosystem, project } = await params;
  return {
    title: `${labelForSlug(project)} — ${labelForSlug(ecosystem)}`,
    alternates: { canonical: `/learn/${ecosystem}/projects/${project}` },
  };
}

export default async function Page({ params }: Params) {
  const { ecosystem, project } = await params;
  if (!isEcosystem(ecosystem)) notFound();
  return <EcosystemProjectView ecosystem={ecosystem} projectName={project} />;
}
