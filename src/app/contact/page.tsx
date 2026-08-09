import type { Metadata } from 'next';
import { ContactView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/contact' },
  title: "Contact",
  description: "Get in touch with the CrypLounge newsroom.",
};

export default function Page() {
  return <ContactView />;
}
