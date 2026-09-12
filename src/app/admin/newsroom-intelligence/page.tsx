import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminNewsroomIntelligenceView } from '@/views/admin';

export const metadata: Metadata = { title: 'Newsroom Intelligence' };

export default function Page() {
  // The view reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-dvh bg-[#07080A]" />}>
      <AdminNewsroomIntelligenceView />
    </Suspense>
  );
}
