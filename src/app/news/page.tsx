import type { Metadata } from 'next';
import { AllNewsView } from '@/views';
import { listArticles } from '@/services/news';

export const metadata: Metadata = {
  title: 'News',
  description:
    'Breaking cryptocurrency and blockchain news, reported and verified by the CrypLounge newsroom.',
  alternates: { canonical: '/news' },
};

/**
 * Page 1 of the listing is fetched here on the server. It previously loaded in
 * a client effect, so the HTML contained no headlines and no article links —
 * nothing for a crawler to index or follow without executing JavaScript.
 */
export default async function Page() {
  const { items, totalPages } = await listArticles({ perPage: 13 });
  return <AllNewsView initialArticles={items} initialTotalPages={totalPages} />;
}
