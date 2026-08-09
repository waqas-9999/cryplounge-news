import type { Metadata } from 'next';

/**
 * The unsubscribe page is a client component (it reads the token from the
 * query string), so it cannot export `metadata` itself — this layout supplies
 * it instead.
 *
 * `noindex, nofollow`: a per-recipient utility page with a token in the URL.
 * It has no value in search results, and indexing it would publish live
 * unsubscribe tokens, letting anyone who found the result unsubscribe that
 * reader.
 */
export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Manage your CrypLounge newsletter subscription.',
  robots: { index: false, follow: false },
};

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
