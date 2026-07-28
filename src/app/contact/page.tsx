import type { Metadata } from 'next';
import { ContactView } from '@/views';

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the CrypLounge newsroom.",
};

export default function Page() {
  return <ContactView />;
}
