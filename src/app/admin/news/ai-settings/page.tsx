import type { Metadata } from 'next';
import { AdminNewsAISettingsView } from '@/views/admin';

export const metadata: Metadata = { title: "AI Settings" };

export default function Page() {
  return <AdminNewsAISettingsView />;
}
