import { NextResponse, type NextRequest } from 'next/server';
import { siteConfig } from '@/config/site';

/**
 * Keeps duplicate hosts out of Google's index.
 *
 * The site is reachable at both `cryplounge.com` and the Vercel deployment
 * URL. Serving identical content on two hosts splits ranking signals and can
 * get the wrong one indexed as the original, so every host except the
 * canonical one is marked `noindex`.
 *
 * `X-Robots-Tag` is used rather than a redirect on purpose: redirecting the
 * Vercel host would break preview deployments, which are the reason it exists.
 * The header suppresses indexing while leaving the deployment fully usable.
 *
 * Canonical tags still point at `siteConfig.url` from every host, so a crawler
 * that reaches a preview is told where the real page lives.
 */

const CANONICAL_HOST = new URL(siteConfig.url).host;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // `host` reflects the host the visitor actually used, which is what matters
  // here — `request.nextUrl` can carry the deployment's own origin.
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isCanonical = host === CANONICAL_HOST || host.startsWith('localhost');

  if (!isCanonical) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  /**
   * Skips Next internals and static assets — they are never indexed, so
   * running middleware for them is pure overhead on every request.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
};
