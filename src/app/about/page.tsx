import type { Metadata } from 'next';
import { AboutView } from '@/views';

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we cover, and how CrypLounge is funded.",
};

export default function Page() {
  return <AboutView />;
}
