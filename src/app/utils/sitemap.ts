/**
 * Sitemap Generation Utility
 * Generates XML sitemap for SEO optimization
 */

import { SITE_URL } from './seo';
import {
  NEWS_CATEGORIES,
  MARKET_ECOSYSTEMS,
  MARKET_CATEGORIES,
  LEARN_ECOSYSTEMS,
  LEARN_CATEGORIES,
} from './routes';

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap XML
 */
export function generateSitemap(): string {
  const urls: SitemapURL[] = [];

  // Add homepage
  urls.push({
    loc: SITE_URL,
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0],
  });

  // Add main sections
  urls.push(
    {
      loc: `${SITE_URL}/news`,
      changefreq: 'hourly',
      priority: 0.9,
    },
    {
      loc: `${SITE_URL}/market`,
      changefreq: 'hourly',
      priority: 0.9,
    },
    {
      loc: `${SITE_URL}/learn`,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${SITE_URL}/founders`,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      loc: `${SITE_URL}/events`,
      changefreq: 'daily',
      priority: 0.8,
    }
  );

  // Add news categories
  NEWS_CATEGORIES.forEach(category => {
    urls.push({
      loc: `${SITE_URL}/news/${category}`,
      changefreq: 'hourly',
      priority: 0.8,
    });
  });

  // Market pages removed from platform

  // Add learn pages
  // Main learn sections
  urls.push(
    {
      loc: `${SITE_URL}/learn/crypto`,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      loc: `${SITE_URL}/learn/ecosystem`,
      changefreq: 'weekly',
      priority: 0.8,
    }
  );

  // Ecosystem learn pages
  LEARN_ECOSYSTEMS.forEach(ecosystem => {
    urls.push({
      loc: `${SITE_URL}/learn/${ecosystem}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    // Overview and tutorials
    urls.push(
      {
        loc: `${SITE_URL}/learn/${ecosystem}/overview`,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/learn/${ecosystem}/tutorials`,
        changefreq: 'weekly',
        priority: 0.7,
      }
    );

    // Categories
    LEARN_CATEGORIES.forEach(category => {
      urls.push({
        loc: `${SITE_URL}/learn/${ecosystem}/${category}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

/**
 * Get sitemap as downloadable blob
 */
export function downloadSitemap(): void {
  const xml = generateSitemap();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `# CrypLounge Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay for specific bots
User-agent: Googlebot
Crawl-delay: 0

User-agent: Bingbot
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /
`;
}
