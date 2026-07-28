import type { Metadata } from 'next';
import { SubmitEventView } from '@/views';

export const metadata: Metadata = {
  title: "Submit an Event",
  description: "Submit a crypto event for inclusion in the CrypLounge calendar.",
};

export default function Page() {
  return <SubmitEventView />;
}
