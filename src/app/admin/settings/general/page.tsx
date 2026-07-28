import type { Metadata } from 'next';
import { AdminSettingsGeneralView } from '@/views/admin';

export const metadata: Metadata = { title: "General Settings" };

export default function Page() {
  return <AdminSettingsGeneralView />;
}
