import type { Metadata } from 'next';
import { AdminUsersView } from '@/views/admin';

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <AdminUsersView />;
}
