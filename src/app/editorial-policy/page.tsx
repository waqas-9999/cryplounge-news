import type { Metadata } from 'next';
import { EditorialPolicyView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/editorial-policy' },
  title: "Editorial Policy",
  description: "Our editorial standards and independence.",
};

export default function Page() {
  return <EditorialPolicyView />;
}
