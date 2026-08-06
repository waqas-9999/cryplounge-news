import type { Metadata } from 'next';
import { AdminProjectsEditView } from '@/views/admin';

export const metadata: Metadata = { title: "Edit Project" };

type Params = { params: Promise<{ projectId: string }> };

export default async function Page({ params }: Params) {
  const { projectId } = await params;
  return <AdminProjectsEditView projectId={projectId} />;
}
