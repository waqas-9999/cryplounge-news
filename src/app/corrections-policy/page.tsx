import type { Metadata } from 'next';
import { CorrectionsPolicyView } from '@/views';

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: "How we handle and publish corrections.",
};

export default function Page() {
  return <CorrectionsPolicyView />;
}
