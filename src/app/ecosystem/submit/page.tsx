import type { Metadata } from 'next';
import { SubmitProjectView } from '@/views';

export const metadata: Metadata = {
  title: 'Submit Your Project',
  description: 'List your blockchain or crypto project in the CrypLounge Ecosystem directory.',
};

export default function Page() {
  return <SubmitProjectView />;
}
