import type { Metadata } from 'next';
import { AdminNewsletterView } from '@/views/admin';

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <AdminNewsletterView />;
}
