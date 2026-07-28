import type { Metadata } from 'next';
import { AdminSystemSettingsView } from '@/views/admin';

export const metadata: Metadata = { title: "System Settings" };

export default function Page() {
  return <AdminSystemSettingsView />;
}
