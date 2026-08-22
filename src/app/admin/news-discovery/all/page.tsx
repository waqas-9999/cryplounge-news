import type { Metadata } from 'next';
import { AdminAllDiscoveredNewsView } from '@/views/admin';

export const metadata: Metadata = { title: 'All Discovered News' };

export default function Page() {
  return <AdminAllDiscoveredNewsView />;
}
