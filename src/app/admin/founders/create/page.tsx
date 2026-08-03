import type { Metadata } from 'next';
import { AdminFoundersCreateView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Story" };

export default function Page() {
  return <AdminFoundersCreateView />;
}
