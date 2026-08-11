import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { apiClient } from '@/lib/api-client';
import { articleHref, listArticles } from '@/services/news';
import { listProjects } from '@/services/projects';
import { listResearch } from '@/services/research';
import { listRegulations } from '@/services/regulations';
import { listPages } from '@/services/pages';

/**
 * `/sitemap.xml`, generated from live content.
 *
 * Built from the API rather than a checked-in file so newly published items
 * appear without a deploy. Every URL is absolute against `siteConfig.url`, so
 * the sitemap can never advertise the Vercel preview host.
 *
 * Revalidated hourly — frequent enough for a news site, cheap enough that a
 * crawler cannot make it hammer the API.
 */
export const revalidate = 3600;

/**
 * The API caps `perPage` at 100 (`PaginationQueryDto`), so every content type
 * is walked page by page rather than requested in one oversized call.
 */
const PAGE_SIZE = 100;

/** Safety valve. A sitemap may hold 50,000 URLs; this keeps each type well under. */
const MAX_PAGES = 50;

type Entry = MetadataRoute.Sitemap[number];

function url(path: string, options: Omit<Entry, 'url'> = {}): Entry {
  return { url: `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`, ...options };
}

/**
 * Walks a paginated endpoint to exhaustion.
 *
 * A failing page stops that content type but keeps whatever was already
 * collected — a partial sitemap is far better than a 500, which Search Console
 * treats as an error.
 */
async function collect<T>(
  label: string,
  fetchPage: (page: number, perPage: number) => Promise<Page<T>>
): Promise<T[]> {
  const all: T[] = [];

  try {
    let page = 1;
    let totalPages = 1;

    do {
      const result = await fetchPage(page, PAGE_SIZE);
      all.push(...result.items);
      totalPages = Math.min(result.totalPages, MAX_PAGES);
      page += 1;
    } while (page <= totalPages);
  } catch (error) {
    console.error(`[sitemap] ${label} stopped after ${all.length} items:`, error);
  }

  return all;
}

/**
 * The service layer returns `totalPages` flat while `apiClient.getPaginated`
 * nests it under `pagination`. `collect` works against this one shape.
 */
interface Page<T> {
  items: T[];
  totalPages: number;
}

/** Adapts a service-layer list function, which already returns a flat shape. */
function fromService<T>(
  load: (query: { page: number; perPage: number }) => Promise<{ items: T[]; totalPages: number }>
) {
  return async (page: number, perPage: number): Promise<Page<T>> => {
    const { items, totalPages } = await load({ page, perPage });
    return { items, totalPages };
  };
}

/** Public list endpoints without a service-layer helper are queried directly. */
function publicList<T>(path: string) {
  return async (page: number, perPage: number): Promise<Page<T>> => {
    const result = await apiClient.getPaginated<T>(path, { query: { page, perPage }, auth: false });
    return { items: result.items, totalPages: result.pagination.totalPages };
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes. `changeFrequency`/`priority` are hints only — Google largely
  // ignores them, but they cost nothing and other crawlers still read them.
  const staticEntries: Entry[] = [
    url('/', { lastModified: now, changeFrequency: 'hourly', priority: 1 }),
    url('/news', { lastModified: now, changeFrequency: 'hourly', priority: 0.9 }),
    url('/ecosystem', { lastModified: now, changeFrequency: 'daily', priority: 0.8 }),
    url('/research', { lastModified: now, changeFrequency: 'daily', priority: 0.8 }),
    url('/regulation', { lastModified: now, changeFrequency: 'daily', priority: 0.8 }),
    url('/events', { lastModified: now, changeFrequency: 'daily', priority: 0.8 }),
    url('/founders', { lastModified: now, changeFrequency: 'daily', priority: 0.8 }),
    url('/newsletter', { changeFrequency: 'monthly', priority: 0.4 }),
    url('/about', { changeFrequency: 'monthly', priority: 0.5 }),
    url('/contact', { changeFrequency: 'monthly', priority: 0.5 }),
    url('/careers', { changeFrequency: 'monthly', priority: 0.3 }),
  ];

  type Slugged = { slug: string; updatedAt?: string | null; publishedAt?: string | null };

  const [articles, projects, research, regulations, events, founders, legalPages] = await Promise.all([
    collect('articles', fromService(listArticles)),
    collect('projects', fromService(listProjects)),
    collect('research', fromService(listResearch)),
    collect('regulations', fromService(listRegulations)),
    collect<Slugged>('events', publicList<Slugged>('events')),
    collect<Slugged>('founders', publicList<Slugged>('founders')),
    // `/pages` returns the full set unpaginated.
    listPages().catch(error => {
      console.error('[sitemap] skipped legal pages:', error);
      return [];
    }),
  ]);

  const modified = (value?: string | Date | null) => (value ? new Date(value) : undefined);

  return [
    ...staticEntries,

    ...articles.map(article =>
      url(articleHref(article), {
        lastModified: modified(article.updatedAt ?? article.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    ),

    ...projects.map(project =>
      url(`/ecosystem/${project.slug}`, { changeFrequency: 'weekly', priority: 0.6 })
    ),

    ...research.map(item => url(`/research/${item.slug}`, { changeFrequency: 'monthly', priority: 0.6 })),

    ...regulations.map(item =>
      url(`/regulation/${item.slug}`, { changeFrequency: 'monthly', priority: 0.6 })
    ),

    ...events.map(event =>
      url(`/events/${event.slug}`, {
        lastModified: modified(event.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    ),

    ...founders.map(founder =>
      url(`/founders/${founder.slug}`, {
        lastModified: modified(founder.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    ),

    // Policy pages are database-backed, so their real `updatedAt` is used.
    ...legalPages.map(page =>
      url(`/${page.slug}`, {
        lastModified: modified(page.updatedAt),
        changeFrequency: 'yearly',
        priority: 0.3,
      })
    ),
  ];
}
