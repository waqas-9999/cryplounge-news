import type { Metadata } from 'next';
import { EditorialPolicyView } from '@/views';

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "Our editorial standards and independence.",
};

export default function Page() {
  return <EditorialPolicyView />;
}
