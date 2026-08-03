import type { Metadata } from 'next';
import { AdminFoundersListView } from '@/views/admin';

export const metadata: Metadata = { title: "Stories" };

export default function Page() {
  return <AdminFoundersListView />;
}
