import type { Metadata } from 'next';
import { AdminGuard } from './admin-guard';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | CrypLounge Admin',
  },
  // The admin panel must never be indexed.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
