import type { Metadata } from 'next';
import { DirectoryListing } from '@/components/ecosystem/DirectoryListing';
import { PROJECT_TECHNOLOGIES, PROJECT_USE_CASES, labelForSlug } from '@/lib/taxonomy';
import { listProjects } from '@/services/projects';

type Params = { params: Promise<{ tag: string }> };

/**
 * Tags are open-ended, so only the curated technology and use-case facets are
 * prerendered. Any other tag still resolves, rendered on demand.
 */
export function generateStaticParams() {
  return [...PROJECT_TECHNOLOGIES, ...PROJECT_USE_CASES].map(tag => ({ tag }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = labelForSlug(tag);
  return {
    title: `${label} Projects`,
    description: `Crypto projects tagged ${label} in the CrypLounge ecosystem directory.`,
    alternates: { canonical: `/ecosystem/tag/${tag}` },
  };
}

export default async function Page({ params }: Params) {
  const { tag } = await params;
  const { items } = await listProjects({ tag, perPage: 100, sort: 'name' });
  const label = labelForSlug(tag);

  return (
    <DirectoryListing
      eyebrow="Tag"
      title={`${label} Projects`}
      description={`Directory entries tagged ${label}.`}
      breadcrumbs={[{ label: 'Ecosystem', href: '/ecosystem' }, { label }]}
      projects={items}
      emptyMessage={`Nothing is tagged ${label} yet.`}
    />
  );
}
