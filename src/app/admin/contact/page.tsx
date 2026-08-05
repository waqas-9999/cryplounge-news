import type { Metadata } from 'next';
import { AdminContactView } from '@/views/admin';

export const metadata: Metadata = { title: "Contact Messages" };

export default function Page() {
  return <AdminContactView />;
}
