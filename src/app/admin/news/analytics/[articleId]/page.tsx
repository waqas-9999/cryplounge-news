import type { Metadata } from 'next';
import { AdminNewsDetailAnalyticsView } from '@/views/admin';

export const metadata: Metadata = { title: "Article Analytics" };

type Params = { params: Promise<{ articleId: string }> };

export default async function Page({ params }: Params) {
  const { articleId } = await params;
  return <AdminNewsDetailAnalyticsView articleId={articleId} />;
}
