import type { Metadata } from 'next';
import { AdminReportsExportView } from '@/views/admin';

export const metadata: Metadata = { title: "Reports & Export" };

export default function Page() {
  return <AdminReportsExportView />;
}
