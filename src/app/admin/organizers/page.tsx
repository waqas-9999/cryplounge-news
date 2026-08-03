import type { Metadata } from 'next';
import { AdminOrganizersListView } from '@/views/admin';

export const metadata: Metadata = { title: "Organizers" };

export default function Page() {
  return <AdminOrganizersListView />;
}
