'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppNavigate, useCurrentPageKey } from '@/lib/navigation';
import { setupOutboundLinkTracking, trackPageView } from '@/utils/analytics';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

/**
 * Renders the public site chrome. Auth screens and the admin panel supply
 * their own layouts, so the header/footer are omitted there.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const navigate = useAppNavigate();
  const currentPage = useCurrentPageKey();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');
  const showChrome = !isAuthRoute && !isAdminRoute;

  useEffect(() => {
    if (isAdminRoute) return;
    trackPageView({ meta: { page: currentPage, title: document.title } });
  }, [pathname, currentPage, isAdminRoute]);

  // Outbound-link tracking is attached once for the whole public site rather
  // than per page, so a single listener covers every link in the tree.
  useEffect(() => {
    if (isAdminRoute) return;
    return setupOutboundLinkTracking();
  }, [isAdminRoute]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {showChrome && <Header onNavigate={navigate} currentPage={currentPage} />}
      {children}
      {showChrome && <Footer onNavigate={navigate} />}
    </div>
  );
}
