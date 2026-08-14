import type { Metadata } from 'next';
import { AdminAiAutomationView } from '@/views/admin';

export const metadata: Metadata = { title: 'AI Automation' };

export default function Page() {
  return <AdminAiAutomationView />;
}
