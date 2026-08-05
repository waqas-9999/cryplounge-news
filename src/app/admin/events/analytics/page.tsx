import type { Metadata } from 'next';
import { AdminEventsAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: 'Events Analytics' };

export default function Page() {
  return <AdminEventsAnalyticsView />;
}
