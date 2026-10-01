import type { ArticleSource } from '@/types/article';

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

/** One key-point line, with a local key so editing never remounts the input. */
export interface KeyPointRow {
  key: string;
  text: string;
}

/** The public page shows at most this many; the API refuses more. */
export const MAX_KEY_POINTS = 8;

/** One FAQ row, with a local key so editing never remounts the inputs. */
export interface FaqRow {
  key: string;
  question: string;
  answer: string;
}

/** The API refuses more than this many FAQs. */
export const MAX_FAQS = 10;

export interface SourceRow extends ArticleSource {
  /** Local key for stable list rendering; never sent to the API. */
  key: string;
}

/** Everything the workspace edits. One object, so dirty-tracking is a comparison. */
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
  sources: SourceRow[];
  keyPoints: KeyPointRow[];
  faqs: FaqRow[];
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
  sources: [],
  keyPoints: [],
  faqs: [],
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

/** Body text for word count / reading time, including FAQ and captions. */
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

export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let keySeq = 0;
export const newKey = () => `src-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;
