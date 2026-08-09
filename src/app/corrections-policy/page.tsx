import type { Metadata } from 'next';
import { CorrectionsPolicyView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/corrections-policy' },
  title: "Corrections Policy",
  description: "How we handle and publish corrections.",
};

export default function Page() {
  return <CorrectionsPolicyView />;
}
