import type { Metadata } from 'next';
import { PrivacyView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/privacy' },
  title: "Privacy Policy",
  description: "How CrypLounge collects, uses and protects your data.",
};

export default function Page() {
  return <PrivacyView />;
}
