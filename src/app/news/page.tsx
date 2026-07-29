import type { Metadata } from 'next';
import { AllNewsView } from '@/views';

export const metadata: Metadata = {
  title: 'News',
  description:
    'Breaking cryptocurrency and blockchain news, reported and verified by the CrypLounge newsroom.',
  alternates: { canonical: '/news' },
};

export default function Page() {
  return <AllNewsView />;
}
