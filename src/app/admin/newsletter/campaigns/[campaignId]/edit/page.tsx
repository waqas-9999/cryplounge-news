import type { Metadata } from 'next';
import { AdminNewsletterCampaignEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Newsletter" };

type Params = { params: Promise<{ campaignId: string }> };

export default async function Page({ params }: Params) {
  const { campaignId } = await params;
  return <AdminNewsletterCampaignEditView campaignId={campaignId} />;
}
