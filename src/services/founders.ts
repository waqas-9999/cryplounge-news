import { apiClient, mediaUrl } from '@/lib/api-client';

/**
 * Data access for founder stories.
 *
 * Backed by the real NestJS `founders` endpoints.
 */
export interface FounderDetail {
  id: string;
  slug: string;
  name: string;
  role: string;
  company: string | null;
  bio: string;
  excerpt: string;
  website: string | null;
  x: string | null;
  linkedin: string | null;
  github: string | null;
  region: string | null;
  status: string;
  publishedAt: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
  photo: string | undefined;
  tags: { id: string; slug: string; name: string }[];
  projects: { id: string; slug: string; name: string; logo: unknown }[];
  articles: { id: string; slug: string; title: string }[];
  events: { id: string; slug: string; name: string; startsAt: string }[];
}

interface BackendFounderDetail {
  id: string;
  slug: string;
  name: string;
  role: string;
  company: string | null;
  bio: string;
  excerpt: string;
  website: string | null;
  x: string | null;
  linkedin: string | null;
  github: string | null;
  region: string | null;
  status: string;
  publishedAt: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
  photo: { path: string; altText: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
  projects: { id: string; slug: string; name: string; logo: unknown }[];
  articles: { id: string; slug: string; title: string }[];
  events: { id: string; slug: string; name: string; startsAt: string }[];
}

function toDetail(founder: BackendFounderDetail): FounderDetail {
  return {
    ...founder,
    photo: mediaUrl(founder.photo?.path),
  };
}

/** Full founder record for the `/founders/[slug]` detail page. */
export async function getFounderBySlug(slug: string): Promise<FounderDetail | null> {
  try {
    const founder = await apiClient.get<BackendFounderDetail>(`founders/slug/${slug}`, { auth: false });
    return toDetail(founder);
  } catch {
    return null;
  }
}
