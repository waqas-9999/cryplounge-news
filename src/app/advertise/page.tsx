import type { Metadata } from 'next';
import { AdvertiseView } from '@/views';

export const metadata: Metadata = {
  title: "Advertise",
  description: "Sponsorship and advertising opportunities on CrypLounge.",
};

export default function Page() {
  return <AdvertiseView />;
}
