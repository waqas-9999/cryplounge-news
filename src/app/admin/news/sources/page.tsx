import type { Metadata } from 'next';
import { AdminNewsSourcesView } from '@/views/admin';

export const metadata: Metadata = { title: "Sources" };

export default function Page() {
  return <AdminNewsSourcesView />;
}
