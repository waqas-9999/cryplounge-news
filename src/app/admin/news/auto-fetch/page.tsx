import type { Metadata } from 'next';
import { AdminNewsAutoFetchView } from '@/views/admin';

export const metadata: Metadata = { title: "Auto Fetch" };

export default function Page() {
  return <AdminNewsAutoFetchView />;
}
