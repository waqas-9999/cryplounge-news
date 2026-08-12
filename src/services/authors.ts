import { apiClient } from '@/lib/api-client';

/**
 * Data access for author profiles.
 *
 * Backed by the real `authors` endpoints. The profile includes only published,
 * non-deleted work — the backend filters it, so an unpublished or deleted
 * article never appears on a byline page.
 */

export interface AuthorArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  readMinutes: number | null;
  category: { slug: string; name: string } | null;
}

export interface AuthorProfile {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  x: string | null;
  linkedin: string | null;
  website: string | null;
  createdAt: string;
  articles: AuthorArticle[];
}

/** Null when the author does not exist or the backend is unreachable. */
export async function getAuthorBySlug(slug: string): Promise<AuthorProfile | null> {
  try {
    return await apiClient.get<AuthorProfile>(`authors/slug/${encodeURIComponent(slug)}`, {
      auth: false,
    });
  } catch {
    return null;
  }
}
