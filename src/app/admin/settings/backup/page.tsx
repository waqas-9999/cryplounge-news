import type { Metadata } from 'next';
import { AdminSettingsBackupView } from '@/views/admin';

export const metadata: Metadata = { title: "Backup Settings" };

export default function Page() {
  return <AdminSettingsBackupView />;
}
