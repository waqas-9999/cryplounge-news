import type { Metadata } from 'next';
import { AdminNewsCreateView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Article" };

export default function Page() {
  return <AdminNewsCreateView />;
}
