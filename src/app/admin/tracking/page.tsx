import type { Metadata } from 'next';
import { AdminTrackingView } from '@/views/admin';

export const metadata: Metadata = { title: "Behavior Tracking" };

export default function Page() {
  return <AdminTrackingView />;
}
