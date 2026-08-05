import type { Metadata } from 'next';
import { AdminFoundersAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: 'Founder Analytics' };

export default function Page() {
  return <AdminFoundersAnalyticsView />;
}
