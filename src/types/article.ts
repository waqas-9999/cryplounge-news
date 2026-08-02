export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  categorySlug: string;
  author: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  imageUrl?: string;

  /**
   * URL slug. Falls back to `id` where absent — see `articleSlug()`.
   */
  slug?: string;

  /** Editorial workflow state. */
  status?: ArticleStatus;

  /** Engagement metrics, populated by analytics. */
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;

  content?: string;
  featured?: boolean;
  updatedAt?: string;

  /** SEO overrides — fall back to `title`/`summary` when absent. */
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;

  /** AI-assigned editorial quality score (0-100), set by the review pipeline. */
  qualityScore?: number;
}

/** The canonical URL segment for an article. */
export function articleSlug(article: Pick<Article, 'id' | 'slug'>): string {
  return article.slug ?? article.id;
}
