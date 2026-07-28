import type { Metadata } from 'next';
import { FactCheckPolicyView } from '@/views';

export const metadata: Metadata = {
  title: "Fact-Check Policy",
  description: "How CrypLounge verifies claims before publication.",
};

export default function Page() {
  return <FactCheckPolicyView />;
}
