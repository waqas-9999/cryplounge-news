import type { Metadata } from 'next';
import { AdminSettingsSEOView } from '@/views/admin';

export const metadata: Metadata = { title: "SEO Settings" };

export default function Page() {
  return <AdminSettingsSEOView />;
}
