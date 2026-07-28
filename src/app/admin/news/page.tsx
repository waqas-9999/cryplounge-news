import type { Metadata } from 'next';
import { AdminNewsListView } from '@/views/admin';

export const metadata: Metadata = { title: "News" };

export default function Page() {
  return <AdminNewsListView />;
}
