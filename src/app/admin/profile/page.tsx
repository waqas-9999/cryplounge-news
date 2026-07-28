import type { Metadata } from 'next';
import { AdminProfileView } from '@/views/admin';

export const metadata: Metadata = { title: "My Profile" };

export default function Page() {
  return <AdminProfileView />;
}
