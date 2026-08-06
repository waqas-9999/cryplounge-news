import type { Metadata } from 'next';
import { AdminNewsletterCampaignsView } from '@/views/admin';

export const metadata: Metadata = { title: "Newsletter Campaigns" };

export default function Page() {
  return <AdminNewsletterCampaignsView />;
}
