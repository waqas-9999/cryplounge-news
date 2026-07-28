import type { Metadata } from 'next';
import { EventsView } from '@/views';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Conferences, hackathons, AMAs and token launches across the crypto calendar.',
  alternates: { canonical: '/events' },
};

export default function Page() {
  return <EventsView />;
}
