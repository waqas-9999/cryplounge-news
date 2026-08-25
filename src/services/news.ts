import { apiClient, mediaUrl } from '@/lib/api-client';
import {
  articleSlug,
  type Article,
  type ArticleStatus,
  type ArticleVisual,
  type ArticleVisualType,
} from '@/types/article';
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
  /** Present on detail reads only; list endpoints return a card. */
  visuals?: BackendArticleVisual[];
  tags: { id: string; slug: string; name: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
}

interface BackendArticleVisual {
  id: string;
  type: string;
  placement: string;
  position: number;
  relevanceReason?: string | null;
  media: {
    id: string;
    path: string;
    altText?: string | null;
    caption?: string | null;
    title?: string | null;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
  } | null;
}

const VISUAL_TYPES = ['CHART', 'PHOTO', 'INFOGRAPHIC', 'TIMELINE'] as const;

/**
 * Maps one visual, dropping anything the renderer could not use.
 *
 * Returns null for a visual with no media or an unrecognised type rather than
 * passing it through for the component to guard against. A type added to the
 * CMS enum before the frontend knows about it is the expected case here, and
 * it should be quietly absent, not a broken figure.
 */
function toVisual(v: BackendArticleVisual): ArticleVisual | null {
  if (!v.media?.path) return null;
  if (!(VISUAL_TYPES as readonly string[]).includes(v.type)) return null;

  return {
    id: v.id,
    type: v.type as ArticleVisualType,
    placement: v.placement === 'HERO' ? 'HERO' : 'INLINE',
    position: v.position,
    relevanceReason: v.relevanceReason ?? undefined,
    media: {
      id: v.media.id,
      url: mediaUrl(v.media.path),
      altText: v.media.altText ?? undefined,
      caption: v.media.caption ?? undefined,
      title: v.media.title ?? undefined,
      width: v.media.width ?? undefined,
      height: v.media.height ?? undefined,
      mimeType: v.media.mimeType ?? undefined,
    },
  };
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
    authorAvatarUrl: a.author?.avatarUrl ?? undefined,
    readTime: `${a.readMinutes ?? 3} min read`,
    publishedAt: a.publishedAt ?? a.updatedAt ?? new Date().toISOString(),
    updatedAt: a.updatedAt,
    tags: a.tags.map(t => t.name),
    imageUrl: mediaUrl(a.featuredImage?.path),
    // Order comes from the API (placement, then position). Never re-sorted.
    visuals: a.visuals?.map(toVisual).filter((v): v is ArticleVisual => v !== null),
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

/**
 * Falls back to an empty page (rather than throwing) if the backend is
 * unreachable — several statically generated pages depend on this list, and
 * a build shouldn't fail wholesale over a transient API outage.
 */
export async function listArticles(query: ArticleQuery = {}): Promise<PaginatedArticles> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const page = query.page ?? 1;

  try {
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
  } catch {
    return { items: [], page, perPage, total: 0, totalPages: 0 };
  }
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
      query: { page: 1, perPage: limit, sortBy: 'publishedAt', sortOrder: 'desc' },
      auth: false,
    });
    return items.map(toArticle);
  } catch {
    return [];
  }
}

/**
 * Articles relevant to a project.
 *
 * The backend has no dedicated "articles related to a project" endpoint, so
 * this is a best-effort adaptation using the article search (title/summary
 * only, not tags) rather than the old mock-data tag-matching heuristic.
 */
export async function getArticlesForProject(project: Project, limit = 4): Promise<Article[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
      query: { search: project.name, page: 1, perPage: limit },
      auth: false,
    });
    return items.map(toArticle);
  } catch {
    return [];
  }
}

export async function searchArticles(query: string, limit = 12): Promise<Article[]> {
  if (!query.trim()) return [];
  try {
    const { items } = await apiClient.getPaginated<BackendArticle>('articles', {
      query: { search: query, page: 1, perPage: limit },
      auth: false,
    });
    return items.map(toArticle);
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const article = await apiClient.get<BackendArticle>(`articles/slug/${slug}`, { auth: false });
    return toArticle(article);
  } catch {
    return null;
  }
}
