'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthService } from '@/utils/adminAuth';

/**
 * Route-level protection for the admin panel.
 *
 * The access token lives in memory and the session is restored from a
 * persisted refresh token via the real backend (`POST /auth/refresh`, then
 * `GET /auth/me`), so the check can only run on the client. Children are not
 * rendered until the session has been verified, which prevents admin markup
 * flashing for signed-out visitors.
 *
 * NOTE: this is a UX guard, not a security boundary. Every admin endpoint
 * authorises the request server-side independently (`JwtAuthGuard` +
 * `@RequirePermissions`) — this guard only controls what renders client-side.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const isLoginRoute = pathname === '/admin/login' || pathname === '/admin/accept-invite';

  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    if (isLoginRoute) {
      setState('allowed');
      return;
    }

    let cancelled = false;

    if (AdminAuthService.isAuthenticated()) {
      setState('allowed');
      return;
    }

    AdminAuthService.restoreSession().then(session => {
      if (cancelled) return;
      if (session) {
        setState('allowed');
      } else {
        setState('denied');
        router.replace('/admin/login');
      }
    });

    return () => {
      cancelled = true;
    };
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
