import type { Metadata } from 'next';
import { AdminNewsletterCampaignNewView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Newsletter" };

export default function Page() {
  return <AdminNewsletterCampaignNewView />;
}
