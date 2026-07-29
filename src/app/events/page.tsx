import type { Metadata } from 'next';
import { EventsView } from '@/views';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Conferences, hackathons, workshops and meetups across the crypto and blockchain calendar.',
  alternates: { canonical: '/events' },
};

export default function Page() {
  return <EventsView />;
}
