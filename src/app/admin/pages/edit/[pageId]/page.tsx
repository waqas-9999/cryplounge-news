import type { Metadata } from 'next';
import { AdminLegalPagesEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Page" };

type Params = { params: Promise<{ pageId: string }> };

export default async function Page({ params }: Params) {
  const { pageId } = await params;
  return <AdminLegalPagesEditView pageId={pageId} />;
}
