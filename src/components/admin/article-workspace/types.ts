export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Draft',
  REVIEW: 'In review',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

/**
 * Mirrors PublishingService.TRANSITIONS on the backend, which remains the
 * authority — this only keeps the UI from offering a move the API refuses.
 */
export const STATUS_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  DRAFT: ['REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'],
  REVIEW: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'],
  SCHEDULED: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

/** Statuses the backend only accepts from users holding `news.publish`. */
export const NEEDS_PUBLISH_RIGHTS: ArticleStatus[] = ['PUBLISHED', 'SCHEDULED'];

export interface FeaturedImage {
  id: string;
  url: string;
  altText: string | null;
}

/**
 * Everything the workspace edits. One object, so dirty-tracking is a comparison.
 *
 * TechiArena's workspace also edits `sources` and `keyPoints`. CrypLounge's
 * Article model and CreateArticleDto have neither, so they are not here: a
 * panel that collected them would either be refused by the API or silently
 * discarded on save.
 */
export interface ArticleDraft {
  title: string;
  summary: string;
  content: string;
  slug: string;
  status: ArticleStatus;
  /** `datetime-local` value in the editor's zone, or ''. */
  scheduledLocal: string;
  categoryId: string;
  authorId: string;
  tagIds: string[];
  featuredImage: FeaturedImage | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noindex: boolean;
}

export const EMPTY_DRAFT: ArticleDraft = {
  title: '',
  summary: '',
  content: '',
  slug: '',
  status: 'DRAFT',
  scheduledLocal: '',
  categoryId: '',
  authorId: '',
  tagIds: [],
  featuredImage: null,
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  noindex: false,
};

export interface Option {
  id: string;
  name: string;
  slug: string;
}

/** Body text for word count / reading time. */
export function bodyText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(html: string): number {
  const text = bodyText(html);
  return text ? text.split(' ').length : 0;
}

/** ~225 words a minute, clamped to the API's accepted range (1–120). */
export function readingMinutes(words: number): number {
  return Math.min(120, Math.max(1, Math.round(words / 225)));
}

/** True when the body has no readable text and no image. */
export function isBodyEmpty(html: string): boolean {
  if (/<(img|figure)\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '') === '';
}
