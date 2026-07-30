import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DirectoryListing } from '@/components/ecosystem/DirectoryListing';
import { PROJECT_CATEGORIES, isProjectCategory, labelForSlug } from '@/lib/taxonomy';
import { listProjects } from '@/services/projects';

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return PROJECT_CATEGORIES.map(category => ({ category }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  if (!isProjectCategory(category)) return { title: 'Not Found' };
  const label = labelForSlug(category);
  return {
    title: `${label} Projects`,
    description: `Every ${label} project in the CrypLounge directory — what each one does and which chains it runs on.`,
    alternates: { canonical: `/ecosystem/category/${category}` },
  };
}

export default async function Page({ params }: Params) {
  const { category } = await params;
  if (!isProjectCategory(category)) notFound();

  const { items } = await listProjects({ category, perPage: 100, sort: 'name' });
  const label = labelForSlug(category);

  return (
    <DirectoryListing
      eyebrow="Category"
      title={`${label} Projects`}
      description={`Projects categorised as ${label}.`}
      breadcrumbs={[{ label: 'Ecosystem', href: '/ecosystem' }, { label }]}
      projects={items}
      emptyMessage={`No ${label} projects have been added to the directory yet.`}
    />
  );
}
