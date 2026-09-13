import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminEditorialRecoveryView } from '@/views/admin';

export const metadata: Metadata = { title: 'Editorial Recovery' };

export default function Page() {
  // The inspector is addressed by `?story=`, which needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-dvh bg-gray-50 dark:bg-gray-950" />}>
      <AdminEditorialRecoveryView />
    </Suspense>
  );
}
