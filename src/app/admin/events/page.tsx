import type { Metadata } from 'next';
import { AdminEventsListView } from '@/views/admin';

export const metadata: Metadata = { title: "Events" };

export default function Page() {
  return <AdminEventsListView />;
}
