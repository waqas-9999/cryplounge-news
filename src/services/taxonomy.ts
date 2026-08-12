import { apiClient } from '@/lib/api-client';
import { NEWS_CATEGORIES, labelForSlug } from '@/lib/taxonomy';

/**
 * Data access for categories.
 *
 * The desks live in the database (seeded from `NEWS_CATEGORIES`), so the admin
 * and the public nav read the same list rather than each hardcoding its own.
 */

export interface NewsCategorySummary {
  id: string;
  slug: string;
  name: string;
  position: number;
  /** Live article count for the desk, from the backend `_count`. */
  articleCount: number;
}

interface BackendCategory {
  id: string;
  kind: string;
  slug: string;
  name: string;
  position: number;
  _count?: { articles?: number };
}

/** Order the public nav uses; anything unknown sorts after it, by position. */
function deskOrder(slug: string): number {
  const index = (NEWS_CATEGORIES as readonly string[]).indexOf(slug);
  return index === -1 ? NEWS_CATEGORIES.length : index;
}

/**
 * Returns an empty list rather than throwing if the backend is unreachable —
 * the caller renders its own placeholder in that case.
 */
export async function listNewsCategories(): Promise<NewsCategorySummary[]> {
  try {
    const categories = await apiClient.get<BackendCategory[]>('taxonomy/categories', {
      query: { kind: 'NEWS' },
    });

    return categories
      .map(category => ({
        id: category.id,
        slug: category.slug,
        name: category.name || labelForSlug(category.slug),
        position: category.position,
        articleCount: category._count?.articles ?? 0,
      }))
      .sort((a, b) => deskOrder(a.slug) - deskOrder(b.slug) || a.position - b.position);
  } catch {
    return [];
  }
}
