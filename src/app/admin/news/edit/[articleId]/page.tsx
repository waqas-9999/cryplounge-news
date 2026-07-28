import type { Metadata } from 'next';
import { AdminNewsEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Article" };

type Params = { params: Promise<{ articleId: string }> };

export default async function Page({ params }: Params) {
  const { articleId } = await params;
  return <AdminNewsEditView articleId={articleId} />;
}
