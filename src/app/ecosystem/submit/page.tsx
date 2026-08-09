import type { Metadata } from 'next';
import { SubmitProjectView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/ecosystem/submit' },
  title: 'Submit Your Project',
  description: 'List your blockchain or crypto project in the CrypLounge Ecosystem directory.',
};

export default function Page() {
  return <SubmitProjectView />;
}
