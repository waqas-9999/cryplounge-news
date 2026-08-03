import type { Metadata } from 'next';
import { SubmitEventView } from '@/views';

export const metadata: Metadata = {
  title: 'Submit Your Event',
  description: 'List your blockchain or crypto event on CrypLounge.',
};

export default function Page() {
  return <SubmitEventView />;
}
