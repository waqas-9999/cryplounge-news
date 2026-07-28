import type { Metadata } from 'next';
import { AdminNewsModerationView } from '@/views/admin';

export const metadata: Metadata = { title: "Moderation Queue" };

export default function Page() {
  return <AdminNewsModerationView />;
}
