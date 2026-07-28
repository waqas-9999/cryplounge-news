import type { Metadata } from 'next';
import { AdminSettingsSecurityView } from '@/views/admin';

export const metadata: Metadata = { title: "Security Settings" };

export default function Page() {
  return <AdminSettingsSecurityView />;
}
