import type { Metadata } from 'next';
import { AdminQualifiedNewsView } from '@/views/admin';

export const metadata: Metadata = { title: 'Qualified News' };

export default function Page() {
  return <AdminQualifiedNewsView />;
}
