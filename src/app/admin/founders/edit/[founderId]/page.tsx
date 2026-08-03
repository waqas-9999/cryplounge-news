import type { Metadata } from 'next';
import { AdminFoundersEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Story" };

type Params = { params: Promise<{ founderId: string }> };

export default async function Page({ params }: Params) {
  const { founderId } = await params;
  return <AdminFoundersEditView founderId={founderId} />;
}
