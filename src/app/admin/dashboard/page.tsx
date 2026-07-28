import type { Metadata } from 'next';
import { AdminDashboardView } from '@/views/admin';

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <AdminDashboardView />;
}
