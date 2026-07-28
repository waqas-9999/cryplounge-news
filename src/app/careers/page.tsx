import type { Metadata } from 'next';
import { CareersView } from '@/views';

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at CrypLounge.",
};

export default function Page() {
  return <CareersView />;
}
