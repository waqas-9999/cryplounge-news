import type { Metadata } from 'next';
import { EcosystemView } from '@/views';

export const metadata: Metadata = {
  title: 'Ecosystem',
  description:
    'Discover blockchain projects by category and ecosystem — what they do, who builds them, and the reporting around them.',
  alternates: { canonical: '/ecosystem' },
};

export default function Page() {
  return <EcosystemView />;
}
