import type { Metadata } from 'next';
import { AdminLoginView } from '@/views/admin';

export const metadata: Metadata = { title: "Sign In" };

export default function Page() {
  return <AdminLoginView />;
}
