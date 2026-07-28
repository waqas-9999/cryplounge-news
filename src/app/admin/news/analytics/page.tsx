import type { Metadata } from 'next';
import { AdminNewsAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: "News Analytics" };

export default function Page() {
  return <AdminNewsAnalyticsView />;
}
