import type { Metadata } from 'next';
import { PrivacyView } from '@/views';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CrypLounge collects, uses and protects your data.",
};

export default function Page() {
  return <PrivacyView />;
}
