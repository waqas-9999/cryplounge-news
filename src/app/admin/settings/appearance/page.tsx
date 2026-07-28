import type { Metadata } from 'next';
import { AdminSettingsAppearanceView } from '@/views/admin';

export const metadata: Metadata = { title: "Appearance" };

export default function Page() {
  return <AdminSettingsAppearanceView />;
}
