import type { Metadata } from 'next';
import { AdminAcceptInviteView } from '@/views/admin';

export const metadata: Metadata = { title: "Accept Invitation" };

export default function Page() {
  return <AdminAcceptInviteView />;
}
