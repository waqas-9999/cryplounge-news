import type { Metadata } from 'next';
import { ResearchView } from '@/views';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'In-depth market, project and ecosystem analysis, industry reports and educational guides from CrypLounge.',
  alternates: { canonical: '/research' },
};

export default function Page() {
  return <ResearchView />;
}
