import type { Metadata } from 'next';
import { AdminProjectsListView } from '@/views/admin';

export const metadata: Metadata = { title: 'Ecosystem Projects' };

export default function Page() {
  return <AdminProjectsListView />;
}
