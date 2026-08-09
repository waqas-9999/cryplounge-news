import type { Metadata } from 'next';
import { TermsView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/terms' },
  title: "Terms of Service",
  description: "The terms governing your use of CrypLounge.",
};

export default function Page() {
  return <TermsView />;
}
