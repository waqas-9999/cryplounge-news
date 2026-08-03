import type { Metadata } from 'next';
import { AdminEventsCreateView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Event" };

export default function Page() {
  return <AdminEventsCreateView />;
}
