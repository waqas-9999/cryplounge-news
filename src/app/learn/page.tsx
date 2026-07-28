import type { Metadata } from 'next';
import { LearnView } from '@/views';

export const metadata: Metadata = {
  title: "Learn",
  description: "Structured crypto and blockchain education, from basics to advanced.",
};

export default function Page() {
  return <LearnView />;
}
