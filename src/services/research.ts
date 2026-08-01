import { apiClient, mediaUrl } from '@/lib/api-client';

/**
 * Data access for research reports.
 *
 * Backed by the real NestJS `research` endpoints (`LIST_SELECT` /
 * `DETAIL_INCLUDE` in `server/src/modules/research/research.service.ts`).
 */

export interface ResearchItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  publishedAt: string | null;
  featured: boolean;
  category: string;
  categorySlug: string;
  author: string;
  imageUrl?: string;
  tags: string[];
}

export interface ResearchQuery {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResearch {
  items: ResearchItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PER_PAGE = 12;

interface BackendResearch {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  publishedAt: string | null;
  featured: boolean;
  createdAt: string;
  category: { id: string; slug: string; name: string } | null;
  author: { id: string; slug: string; name: string } | null;
  coverImage: { id: string; path: string; altText?: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
}

function toResearchItem(r: BackendResearch): ResearchItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    status: r.status,
    publishedAt: r.publishedAt,
    featured: r.featured,
    category: r.category?.name ?? 'Research',
    categorySlug: r.category?.slug ?? 'research',
    author: r.author?.name ?? 'CrypLounge Research',
    imageUrl: mediaUrl(r.coverImage?.path),
    tags: r.tags.map(t => t.name),
  };
}

export async function listResearch(query: ResearchQuery = {}): Promise<PaginatedResearch> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const page = query.page ?? 1;

  const { items, pagination } = await apiClient.getPaginated<BackendResearch>('research', {
    query: {
      category: query.category,
      tag: query.tag,
      search: query.search,
      page,
      perPage,
    },
    auth: false,
  });

  return {
    items: items.map(toResearchItem),
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getResearchBySlug(slug: string): Promise<ResearchItem | null> {
  try {
    const item = await apiClient.get<BackendResearch>(`research/slug/${slug}`, { auth: false });
    return toResearchItem(item);
  } catch {
    return null;
  }
}
