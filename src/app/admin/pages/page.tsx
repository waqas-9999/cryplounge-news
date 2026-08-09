import type { Metadata } from 'next';
import { AdminLegalPagesListView } from '@/views/admin';

export const metadata: Metadata = { title: "Legal Pages" };

export default function Page() {
  return <AdminLegalPagesListView />;
}
