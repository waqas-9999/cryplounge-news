import type { Metadata } from 'next';
import { FoundersView } from '@/views';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'The people building crypto — founder profiles, interviews and the stories behind the projects.',
  alternates: { canonical: '/founders' },
};

export default function Page() {
  return <FoundersView />;
}
