export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

/** Inline visual kinds the newsroom produces. Mirrors the CMS enum. */
export type ArticleVisualType = 'CHART' | 'PHOTO' | 'INFOGRAPHIC' | 'TIMELINE';

export type ArticleVisualPlacement = 'HERO' | 'INLINE';

/**
 * A visual placed in an article body.
 *
 * The asset lives on `media`; this describes where it sits. Every field the
 * CMS may omit is optional here rather than defaulted, because a caption the
 * writer never produced and a caption that failed to load are different
 * things, and the renderer treats them differently.
 */
export interface ArticleVisual {
  id: string;
  type: ArticleVisualType;
  placement: ArticleVisualPlacement;
  position: number;
  /** Editorial rationale from the writer. Not reader-facing. */
  relevanceReason?: string;
  media: {
    id: string;
    /** Resolved absolute URL. Absent when the asset cannot be located. */
    url?: string;
    altText?: string;
    caption?: string;
    title?: string;
    width?: number;
    height?: number;
    mimeType?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  categorySlug: string;
  author: string;
  authorAvatarUrl?: string;
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

  /**
   * Inline visuals, already ordered by the API on `placement` then `position`.
   * The frontend preserves that order and never re-sorts.
   */
  visuals?: ArticleVisual[];
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
