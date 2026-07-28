import type { Metadata } from 'next';
import { AdminSettingsEmailView } from '@/views/admin';

export const metadata: Metadata = { title: "Email Settings" };

export default function Page() {
  return <AdminSettingsEmailView />;
}
