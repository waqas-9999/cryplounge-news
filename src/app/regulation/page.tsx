import type { Metadata } from 'next';
import { RegulationView } from '@/views';

export const metadata: Metadata = {
  title: 'Regulation',
  description:
    'Crypto laws, taxation, compliance, licensing and enforcement, tracked by country and region.',
  alternates: { canonical: '/regulation' },
};

export default function Page() {
  return <RegulationView />;
}
