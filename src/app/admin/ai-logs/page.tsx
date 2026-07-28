import type { Metadata } from 'next';
import { AdminAILogsView } from '@/views/admin';

export const metadata: Metadata = { title: "AI Logs" };

export default function Page() {
  return <AdminAILogsView />;
}
