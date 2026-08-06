import type { Metadata } from 'next';
import { AdminProjectsCreateView } from '@/views/admin';

export const metadata: Metadata = { title: "Create Project" };

export default function Page() {
  return <AdminProjectsCreateView />;
}
