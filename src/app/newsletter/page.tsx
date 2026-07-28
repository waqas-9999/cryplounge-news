import type { Metadata } from 'next';
import { NewsletterView } from '@/views';

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Get the CrypLounge briefing in your inbox.",
};

export default function Page() {
  return <NewsletterView />;
}
