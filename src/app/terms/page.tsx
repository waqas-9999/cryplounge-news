import type { Metadata } from 'next';
import { TermsView } from '@/views';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of CrypLounge.",
};

export default function Page() {
  return <TermsView />;
}
