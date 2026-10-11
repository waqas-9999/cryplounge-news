import { NextResponse, type NextRequest } from 'next/server';
import { siteConfig } from '@/config/site';

const CANONICAL_HOST = new URL(siteConfig.url).host;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://api.cryplounge.com/api/v1';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isCanonical =
    host === CANONICAL_HOST || host.startsWith('localhost');

  if (!isCanonical) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Check article existence before Next.js starts streaming the page.
  const match = request.nextUrl.pathname.match(
    /^\/news\/([^/]+)\/([^/]+)\/?$/
  );

  if (!match) return response;

  const category = match[1];
  const slug = match[2];

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL.replace(/\/+$/, '')}/articles/slug/${encodeURIComponent(slug)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      }
    );

    // Only a confirmed missing article should become a real 404.
    if (apiResponse.status === 404) {
      return new NextResponse(
        `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Page Not Found | CrypLounge</title>
<style>
body{margin:0;background:#0b1020;color:#f4f6fb;font:16px/1.6 Arial,sans-serif}
main{max-width:680px;margin:15vh auto;padding:32px}
h1{font-size:36px;margin-bottom:8px}
p{color:#b6bfd3}
a{color:#8db8ff}
</style>
</head>
<body>
<main>
<p>CrypLounge</p>
<h1>Page not found</h1>
<p>This article may have been removed or its address may have changed.</p>
<a href="/">Return to CrypLounge homepage</a>
</main>
</body>
</html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    // If the API responds successfully, let the normal page handle
    // article/category validation. Other API errors fail open.
    void category;
  } catch {
    // A timeout or temporary API failure must not be mistaken for 404.
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
