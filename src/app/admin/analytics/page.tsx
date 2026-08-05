import type { Metadata } from 'next';
import { AdminAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: 'Analytics' };

export default function Page() {
  return <AdminAnalyticsView />;
}
