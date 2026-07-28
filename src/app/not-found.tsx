import type { Metadata } from 'next';
import { NotFoundView } from '@/views';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
