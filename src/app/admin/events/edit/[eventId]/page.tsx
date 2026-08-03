import type { Metadata } from 'next';
import { AdminEventsEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Event" };

type Params = { params: Promise<{ eventId: string }> };

export default async function Page({ params }: Params) {
  const { eventId } = await params;
  return <AdminEventsEditView eventId={eventId} />;
}
