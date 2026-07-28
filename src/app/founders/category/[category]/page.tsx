import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { FoundersView } from '@/views';

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${labelForSlug(category)} Founders`,
    alternates: { canonical: `/founders/category/${category}` },
  };
}

export default async function Page({ params }: Params) {
  const { category } = await params;
  return <FoundersView initialCategory={category} />;
}
