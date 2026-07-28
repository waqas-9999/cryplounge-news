'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * The app was originally built around a state-based router where every page was
 * identified by a bare string ("home", "news/markets", "admin/dashboard") and
 * navigation happened through an `onNavigate(page)` prop.
 *
 * These helpers translate between that legacy page-key space and real URLs so
 * the existing page components keep working while the App Router owns routing.
 * As pages are converted to `<Link>`/`useRouter` directly, their use of this
 * shim can be dropped.
 */

/** "home" -> "/", "news/markets" -> "/news/markets" */
export function pageKeyToHref(page: string): string {
  if (!page || page === 'home') return '/';
  return page.startsWith('/') ? page : `/${page}`;
}

/** "/" -> "home", "/news/markets" -> "news/markets" */
export function hrefToPageKey(pathname: string): string {
  if (!pathname || pathname === '/') return 'home';
  return pathname.replace(/^\/+/, '');
}

/**
 * Drop-in replacement for the old `onNavigate` prop.
 */
export function useAppNavigate(): (page: string) => void {
  const router = useRouter();
  return useCallback(
    (page: string) => {
      router.push(pageKeyToHref(page));
    },
    [router]
  );
}

/**
 * The legacy `currentPage` value, derived from the URL.
 */
export function useCurrentPageKey(): string {
  const pathname = usePathname();
  return hrefToPageKey(pathname ?? '/');
}
