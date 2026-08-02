import { apiClient, mediaUrl } from '@/lib/api-client';
import { articleSlug, type Article, type ArticleStatus } from '@/types/article';
import type { Project } from '@/types/project';

/**
 * Data access for editorial articles.
 *
 * Backed by the real NestJS `articles` endpoints. Same contract as before:
 * async, paginated, and the only place that knows where articles come from.
 * Components never talk to the API client directly.
 */

export interface ArticleQuery {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedArticles {
  items: Article[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PER_PAGE = 12;

/** Backend article shape from `LIST_SELECT` / `DETAIL_INCLUDE`. */
interface BackendArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  updatedAt?: string;
  featured?: boolean;
  readMinutes: number | null;
  category: { id: string; slug: string; name: string } | null;
  author: { id: string; slug: string; name: string; avatarUrl?: string | null } | null;
  featuredImage: { id: string; path: string; altText?: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
}

function toArticle(a: BackendArticle): Article {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    category: a.category?.name ?? 'General',
    categorySlug: a.category?.slug ?? 'general',
    author: a.author?.name ?? 'CrypLounge Staff',
    readTime: `${a.readMinutes ?? 3} min read`,
    publishedAt: a.publishedAt ?? a.updatedAt ?? new Date().toISOString(),
    updatedAt: a.updatedAt,
    tags: a.tags.map(t => t.name),
    imageUrl: mediaUrl(a.featuredImage?.path),
    status: a.status.toLowerCase() as ArticleStatus,
    featured: a.featured,
    content: a.content,
    seoTitle: a.seoTitle ?? undefined,
    seoDescription: a.seoDescription ?? undefined,
    canonicalUrl: a.canonicalUrl ?? undefined,
    noindex: a.noindex,
  };
}

/** Canonical URL for an article. */
export function articleHref(article: Article): string {
  return `/news/${article.categorySlug}/${articleSlug(article)}`;
}

export async function listArticles(query: ArticleQuery = {}): Promise<PaginatedArticles> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const page = query.page ?? 1;

  const { items, pagination } = await apiClient.getPaginated<BackendArticle>('articles', {
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
    items: items.map(toArticle),
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
    query: { page: 1, perPage: limit, sortBy: 'publishedAt', sortOrder: 'desc' },
    auth: false,
  });
  return items.map(toArticle);
}

/**
 * Articles relevant to a project.
 *
 * The backend has no dedicated "articles related to a project" endpoint, so
 * this is a best-effort adaptation using the article search (title/summary
 * only, not tags) rather than the old mock-data tag-matching heuristic.
 */
export async function getArticlesForProject(project: Project, limit = 4): Promise<Article[]> {
  const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
    query: { search: project.name, page: 1, perPage: limit },
    auth: false,
  });
  return items.map(toArticle);
}

export async function searchArticles(query: string, limit = 12): Promise<Article[]> {
  if (!query.trim()) return [];
  const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
    query: { search: query, page: 1, perPage: limit },
    auth: false,
  });
  return items.map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const article = await apiClient.get<BackendArticle>(`articles/slug/${slug}`, { auth: false });
    return toArticle(article);
  } catch {
    return null;
  }
}
