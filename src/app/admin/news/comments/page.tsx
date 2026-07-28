import type { Metadata } from 'next';
import { AdminNewsCommentsView } from '@/views/admin';

export const metadata: Metadata = { title: "Comments" };

export default function Page() {
  return <AdminNewsCommentsView />;
}
