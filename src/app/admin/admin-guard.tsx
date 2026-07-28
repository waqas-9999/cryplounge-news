'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthService } from '@/utils/adminAuth';

/**
 * Route-level protection for the admin panel.
 *
 * The session lives in (encrypted) localStorage, so the check can only run on
 * the client. Children are not rendered until the session has been verified,
 * which prevents admin markup flashing for signed-out visitors.
 *
 * NOTE: this is a UX guard, not a security boundary. Once the API exists,
 * every admin endpoint must authorise the request server-side as well —
 * anyone can set a localStorage key.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const isLoginRoute = pathname === '/admin/login';

  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    if (isLoginRoute) {
      setState('allowed');
      return;
    }
    if (AdminAuthService.isAuthenticated()) {
      setState('allowed');
    } else {
      setState('denied');
      router.replace('/admin/login');
    }
  }, [isLoginRoute, pathname, router]);

  if (state !== 'allowed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F10]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {state === 'checking' ? 'Checking your session…' : 'Redirecting to sign in…'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
