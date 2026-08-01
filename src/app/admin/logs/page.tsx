import type { Metadata } from 'next';
import { AdminLogsView } from '@/views/admin';

export const metadata: Metadata = { title: "Logs" };

export default function Page() {
  return <AdminLogsView />;
}
