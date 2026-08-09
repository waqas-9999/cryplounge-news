import type { Metadata } from 'next';
import { NewsletterView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/newsletter' },
  title: "Newsletter",
  description: "Get the CrypLounge briefing in your inbox.",
};

export default function Page() {
  return <NewsletterView />;
}
