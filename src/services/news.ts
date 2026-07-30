import { mockArticles, articleSlug, type Article } from '@/data/mockArticles';
import type { Project } from '@/types/project';

/**
 * Data access for editorial articles.
 *
 * Same contract as the projects service: async, paginated, and the only place
 * that knows where articles come from. Components never import `@/data`.
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

function byNewest(a: Article, b: Article) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/** Canonical URL for an article. */
export function articleHref(article: Article): string {
  return `/news/${article.categorySlug}/${articleSlug(article)}`;
}

export async function listArticles(query: ArticleQuery = {}): Promise<PaginatedArticles> {
  let items = [...mockArticles];

  if (query.category) {
    items = items.filter(a => a.categorySlug === query.category);
  }
  if (query.tag) {
    const tag = query.tag.toLowerCase();
    items = items.filter(a => a.tags?.some(t => t.toLowerCase() === tag));
  }
  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    if (needle) {
      items = items.filter(a =>
        [a.title, a.summary, ...(a.tags ?? [])].join(' ').toLowerCase().includes(needle)
      );
    }
  }

  items.sort(byNewest);

  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * perPage;

  return { items: items.slice(start, start + perPage), page, perPage, total, totalPages };
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  return [...mockArticles].sort(byNewest).slice(0, limit);
}

/**
 * Articles relevant to a project.
 *
 * Matched on tags and name mentions. This is the seam where a real
 * article↔project relation will attach once content is in a database; the
 * signature does not change.
 */
export async function getArticlesForProject(project: Project, limit = 4): Promise<Article[]> {
  const needles = [project.name.toLowerCase(), ...project.tags.map(t => t.toLowerCase())];

  return [...mockArticles]
    .map(article => {
      const haystack = [article.title, article.summary, ...(article.tags ?? [])]
        .join(' ')
        .toLowerCase();
      const score = needles.reduce((sum, needle) => (haystack.includes(needle) ? sum + 1 : sum), 0);
      return { article, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.article, b.article))
    .slice(0, limit)
    .map(entry => entry.article);
}
