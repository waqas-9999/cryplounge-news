import type { Metadata } from 'next';
import { AdminLegalPagesCreateView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Page" };

export default function Page() {
  return <AdminLegalPagesCreateView />;
}
