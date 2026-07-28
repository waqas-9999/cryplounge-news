import type { Metadata } from 'next';
import { AdminNewsCategoriesView } from '@/views/admin';

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <AdminNewsCategoriesView />;
}
