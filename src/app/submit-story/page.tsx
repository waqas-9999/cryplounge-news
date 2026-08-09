import type { Metadata } from 'next';
import { SubmitStoryView } from '@/views';

export const metadata: Metadata = {
  // Absolute canonical, so the page never self-reports a preview-host URL.
  alternates: { canonical: '/submit-story' },
  title: "Submit a Story",
  description: "Pitch a story or send the newsroom a tip.",
};

export default function Page() {
  return <SubmitStoryView />;
}
