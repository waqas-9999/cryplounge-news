import { siteConfig } from '@/config/site';
import { articleHref, listArticles } from '@/services/news';

export const revalidate = 0;

const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const WINDOW_MS = 48 * 60 * 60 * 1000;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[char]!);
}

export async function GET(): Promise<Response> {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const origin = siteConfig.url.replace(/\/+$/, '');
  const articles: Awaited<ReturnType<typeof listArticles>>['items'] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await listArticles({ page, perPage: PAGE_SIZE });
    articles.push(...result.items);
    if (!result.items.length || page >= result.totalPages) break;
  }

  const entries = articles.flatMap(article => {
    if (article.status !== 'published' || article.noindex || !article.slug) return [];

    const timestamp = Date.parse(article.publishedAt);
    if (!Number.isFinite(timestamp) || timestamp < cutoff || timestamp > now) return [];

    const loc = `${origin}${articleHref(article)}`;
    try {
      const parsed = new URL(loc);
      const site = new URL(origin);
      if (parsed.protocol !== 'https:' || parsed.origin !== site.origin) return [];
    } catch {
      return [];
    }
    const date = new Date(timestamp).toISOString();
    const title = escapeXml(article.seoTitle?.trim() || article.title);

    return [
      `<url><loc>${escapeXml(loc)}</loc><news:news><news:publication><news:name>CrypLounge</news:name><news:language>en</news:language></news:publication><news:publication_date>${date}</news:publication_date><news:title>${title}</news:title></news:news></url>`,
    ];
  });

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' +
    entries.join('') +
    '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex',
    },
  });
}
