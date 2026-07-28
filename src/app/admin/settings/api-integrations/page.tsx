import type { Metadata } from 'next';
import { AdminSettingsAPIIntegrationsView } from '@/views/admin';

export const metadata: Metadata = { title: "API Integrations" };

export default function Page() {
  return <AdminSettingsAPIIntegrationsView />;
}
