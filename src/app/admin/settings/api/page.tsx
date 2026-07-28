import type { Metadata } from 'next';
import { AdminSettingsAPIView } from '@/views/admin';

export const metadata: Metadata = { title: "API Settings" };

export default function Page() {
  return <AdminSettingsAPIView />;
}
