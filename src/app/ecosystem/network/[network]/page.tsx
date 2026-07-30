import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DirectoryListing } from '@/components/ecosystem/DirectoryListing';
import { NETWORKS, isNetwork, labelForSlug } from '@/lib/taxonomy';
import { listProjects } from '@/services/projects';

type Params = { params: Promise<{ network: string }> };

export function generateStaticParams() {
  return NETWORKS.map(network => ({ network }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { network } = await params;
  if (!isNetwork(network)) return { title: 'Not Found' };
  const label = labelForSlug(network);
  return {
    title: `${label} Projects`,
    description: `Projects deployed on ${label}, from the CrypLounge ecosystem directory.`,
    alternates: { canonical: `/ecosystem/network/${network}` },
  };
}

export default async function Page({ params }: Params) {
  const { network } = await params;
  if (!isNetwork(network)) notFound();

  const { items } = await listProjects({ network, perPage: 100, sort: 'name' });
  const label = labelForSlug(network);

  return (
    <DirectoryListing
      eyebrow="Blockchain"
      title={`Projects on ${label}`}
      description={`Every directory entry that supports ${label}.`}
      breadcrumbs={[{ label: 'Ecosystem', href: '/ecosystem' }, { label }]}
      projects={items}
      emptyMessage={`No projects supporting ${label} have been added yet.`}
    />
  );
}
