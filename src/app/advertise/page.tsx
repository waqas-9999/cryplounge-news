import type { Metadata } from 'next';
import { AdvertiseView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/advertise' },
  title: "Advertise",
  description: "Sponsorship and advertising opportunities on CrypLounge.",
};

export default function Page() {
  return <AdvertiseView />;
}
