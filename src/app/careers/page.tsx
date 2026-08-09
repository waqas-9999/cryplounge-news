import type { Metadata } from 'next';
import { CareersView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/careers' },
  title: "Careers",
  description: "Open roles at CrypLounge.",
};

export default function Page() {
  return <CareersView />;
}
