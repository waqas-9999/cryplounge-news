import type { Metadata } from 'next';
import { SubmitEventView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/events/submit' },
  title: 'Submit Your Event',
  description: 'List your blockchain or crypto event on CrypLounge.',
};

export default function Page() {
  return <SubmitEventView />;
}
