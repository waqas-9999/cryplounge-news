import { adsenseConfig } from '@/config/adsense';

/**
 * `/ads.txt` — the IAB authorised-sellers file.
 *
 * Served from code rather than `public/` so the publisher ID comes from the
 * environment and cannot be committed wrong or forgotten in a redeploy.
 *
 * Without this file AdSense classifies your inventory as unauthorised and
 * throttles revenue, so it must be live before ads serve. A *malformed* file
 * is worse than none — an unparseable line invalidates the record — so when no
 * publisher ID is configured this 404s rather than emitting a placeholder.
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const { publisherId } = adsenseConfig;

  if (!publisherId) {
    return new Response('ads.txt is not configured.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Format: <domain>, <publisher id>, <relationship>, <certification authority id>
  // f08c47fec0942fa0 is Google's fixed TAG certification ID.
  const body = [
    '# CrypLounge authorised digital sellers',
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
