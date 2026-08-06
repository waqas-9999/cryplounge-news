import type { Metadata } from 'next';
import { AdminNewsletterCampaignDetailView } from '@/views/admin';

export const metadata: Metadata = { title: "Campaign" };

type Params = { params: Promise<{ campaignId: string }> };

export default async function Page({ params }: Params) {
  const { campaignId } = await params;
  return <AdminNewsletterCampaignDetailView campaignId={campaignId} />;
}
