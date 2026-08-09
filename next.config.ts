import type { NextConfig } from 'next';

/**
 * Image sources allowed through Next's optimizer.
 *
 * `next/image` refuses any remote host not listed here, so every origin that
 * can appear in content must be present:
 *  - Cloudinary: the production media provider (`CloudinaryStorageProvider`).
 *  - The API origin: legacy local-storage uploads served from `/uploads`.
 *  - Unsplash: the placeholder imagery in `src/lib/images.ts`.
 */
function imageHosts(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ];

  // The backend origin varies per environment, so it is derived rather than
  // hardcoded — otherwise uploads 404 through the optimizer outside production.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const { protocol, hostname, port } = new URL(apiUrl);
      patterns.push({
        protocol: protocol.replace(':', '') as 'http' | 'https',
        hostname,
        ...(port ? { port } : {}),
      });
    } catch {
      // A malformed API URL must not break the build; the optimizer simply
      // won't accept that origin.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHosts(),
    /**
     * AVIF first, then WebP. Both are far smaller than JPEG at equal quality,
     * which is the single biggest lever on LCP for an image-heavy news site.
     */
    formats: ['image/avif', 'image/webp'],
    // Cache optimized derivatives for a day rather than the 60s default, so
    // repeat visitors and crawlers don't force constant re-encoding.
    minimumCacheTTL: 86400,
  },

  /**
   * One URL per page. Without this, `/news` and `/news/` are two URLs serving
   * identical content — the duplicate-content problem this audit is fixing.
   * Next redirects the trailing-slash form to the canonical one.
   */
  trailingSlash: false,

  // Drops the `X-Powered-By: Next.js` header — no SEO effect, less fingerprinting.
  poweredByHeader: false,

  /** Long-lived immutable caching for the generated logo and social image. */
  async headers() {
    return [
      {
        source: '/logo.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' }],
      },
    ];
  },
};

export default nextConfig;
