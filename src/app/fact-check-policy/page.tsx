import type { Metadata } from 'next';
import { FactCheckPolicyView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/fact-check-policy' },
  title: "Fact-Check Policy",
  description: "How CrypLounge verifies claims before publication.",
};

export default function Page() {
  return <FactCheckPolicyView />;
}
