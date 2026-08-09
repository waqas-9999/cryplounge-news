import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * `/robots.txt`.
 *
 * Served from code rather than `public/` so the sitemap and host lines follow
 * `NEXT_PUBLIC_SITE_URL` and can never drift onto the wrong domain.
 *
 * The admin panel and the API proxy are disallowed: they carry no public
 * content, and letting a crawler wander into `/admin` wastes crawl budget and
 * puts login pages in the index. They are protected by auth regardless — this
 * is tidiness, not a security control.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/search?'],
      },
      // Explicitly welcomed. AdSense will not serve on pages its crawler
      // cannot read, so this must never be blocked.
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
