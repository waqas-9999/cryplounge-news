import type { Metadata } from 'next';
import { SearchView } from '@/views';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search CrypLounge news, research and education.',
  robots: { index: false },
};

type Params = { searchParams: Promise<{ q?: string }> };

export default async function Page({ searchParams }: Params) {
  const { q } = await searchParams;
  return <SearchView initialQuery={q} />;
}
