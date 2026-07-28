import type { Metadata } from 'next';
import { AdminUserAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: "User Analytics" };

export default function Page() {
  return <AdminUserAnalyticsView />;
}
