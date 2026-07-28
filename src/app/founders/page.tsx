import type { Metadata } from 'next';
import { FoundersView } from '@/views';

export const metadata: Metadata = {
  title: 'Founders',
  description: 'Profiles of the people building crypto protocols, companies and communities.',
  alternates: { canonical: '/founders' },
};

export default function Page() {
  return <FoundersView />;
}
