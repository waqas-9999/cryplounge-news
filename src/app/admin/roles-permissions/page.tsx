import type { Metadata } from 'next';
import { AdminRolesPermissionsView } from '@/views/admin';

export const metadata: Metadata = { title: "Roles & Permissions" };

export default function Page() {
  return <AdminRolesPermissionsView />;
}
