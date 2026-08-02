import type { Project, ProjectCollection, ProjectLinks, ProjectStatus } from '@/types/project';
import { projectCollections } from '@/data/projects';
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy';
import { apiClient } from '@/lib/api-client';

/**
 * Data access for the Ecosystem directory.
 *
 * Backed by the real NestJS `projects` endpoints. Every list function stays
 * async and paginated so no caller needed to change when this stopped being
 * a static seed import.
 *
 * `ProjectCollection`s (hand-curated groupings) have no backend equivalent —
 * there is no content module for them — so they still come from the local
 * seed. Everything else goes through the API.
 */

export type ProjectSort = 'newest' | 'oldest' | 'name';

export interface ProjectQuery {
  category?: string;
  network?: string;
  /** Matches against `tags` — used by the technology and use-case facets. */
  tag?: string;
  search?: string;
  sort?: ProjectSort;
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PER_PAGE = 24;

const SORT_TO_QUERY: Record<ProjectSort, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
  name: { sortBy: 'name', sortOrder: 'asc' },
};

interface BackendCategory {
  id: string;
  slug: string;
  name: string;
}
interface BackendTag {
  id: string;
  slug: string;
  name: string;
}

/** Shape returned by both `LIST_SELECT` and `DETAIL_INCLUDE` — detail adds the extra scalar/relation fields as optional. */
interface BackendProject {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  about?: string;
  keyFeatures?: string[];
  logo: string;
  accent: string;
  blockchain: string;
  supportedNetworks: string[];
  nativeToken?: string | null;
  launchYear?: number | null;
  status: 'LIVE' | 'BETA' | 'TESTNET' | 'DEPRECATED';
  verified: boolean;
  openSource?: boolean;
  featured: boolean;
  editorsPick: boolean;
  website?: string | null;
  x?: string | null;
  github?: string | null;
  discord?: string | null;
  telegram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  medium?: string | null;
  docs?: string | null;
  whitepaper?: string | null;
  createdAt: string;
  category: BackendCategory | null;
  tags: BackendTag[];
}

function toProject(p: BackendProject): Project {
  const links: ProjectLinks = {
    website: p.website ?? undefined,
    x: p.x ?? undefined,
    github: p.github ?? undefined,
    discord: p.discord ?? undefined,
    telegram: p.telegram ?? undefined,
    linkedin: p.linkedin ?? undefined,
    youtube: p.youtube ?? undefined,
    medium: p.medium ?? undefined,
    docs: p.docs ?? undefined,
    whitepaper: p.whitepaper ?? undefined,
  };

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    about: p.about ?? p.tagline,
    keyFeatures: p.keyFeatures ?? [],
    category: (p.category?.slug as ProjectCategory) ?? 'other',
    blockchain: p.blockchain,
    supportedNetworks: p.supportedNetworks,
    status: p.status.toLowerCase() as ProjectStatus,
    verified: p.verified,
    openSource: p.openSource ?? false,
    launchYear: p.launchYear ?? undefined,
    nativeToken: p.nativeToken ?? undefined,
    logo: p.logo,
    accent: p.accent,
    links,
    tags: p.tags.map(t => t.name),
    featured: p.featured,
    editorsPick: p.editorsPick,
    addedAt: p.createdAt,
  };
}

const EMPTY_PAGE = <T>(page: number, perPage: number): Paginated<T> => ({
  items: [],
  page,
  perPage,
  total: 0,
  totalPages: 0,
});

/**
 * Filtered, sorted, paginated project list.
 *
 * Falls back to an empty page (rather than throwing) if the backend is
 * unreachable — this list backs several statically generated pages, and a
 * build shouldn't fail wholesale over a transient API outage.
 */
export async function listProjects(query: ProjectQuery = {}): Promise<Paginated<Project>> {
  const sort = SORT_TO_QUERY[query.sort ?? 'newest'];
  const page = query.page ?? 1;
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;

  try {
    const { items, pagination } = await apiClient.getPaginated<BackendProject>('projects', {
      query: {
        category: query.category,
        network: query.network,
        tag: query.tag,
        search: query.search,
        page,
        perPage,
        ...sort,
      },
      auth: false,
    });

    return {
      items: items.map(toProject),
      page: pagination.page,
      perPage: pagination.perPage,
      total: pagination.total,
      totalPages: pagination.totalPages,
    };
  } catch {
    return EMPTY_PAGE(page, perPage);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const project = await apiClient.get<BackendProject>(`projects/slug/${slug}`, { auth: false });
    return toProject(project);
  } catch {
    return null;
  }
}

/**
 * Every slug, for `generateStaticParams`.
 *
 * Returns `[]` (rather than throwing) if the backend is unreachable during
 * build — pages fall back to on-demand rendering instead of failing the
 * whole build.
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const slugs: string[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const { items, pagination } = await apiClient.getPaginated<BackendProject>('projects', {
        query: { page, perPage: 100 },
        auth: false,
      });
      slugs.push(...items.map(p => p.slug));
      totalPages = pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    return slugs;
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendProject>('projects', {
      query: { page: 1, perPage: limit, featured: true },
      auth: false,
    });
    return items.map(toProject);
  } catch {
    return [];
  }
}

/**
 * Newsroom-curated selection.
 *
 * There is no pageview data on the client yet, so "trending" is editorial:
 * featured or editor's-pick entries, most recent first. This still filters
 * client-side after fetching a page of results since the backend has no
 * combined featured-OR-editorsPick filter.
 */
export async function getTrendingProjects(limit = 6): Promise<Project[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendProject>('projects', {
      query: { page: 1, perPage: Math.max(limit * 4, 24) },
      auth: false,
    });
    return items
      .filter(p => p.featured || p.editorsPick)
      .slice(0, limit)
      .map(toProject);
  } catch {
    return [];
  }
}

export async function getRecentProjects(limit = 6): Promise<Project[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendProject>('projects', {
      query: { page: 1, perPage: limit, sortBy: 'createdAt', sortOrder: 'desc' },
      auth: false,
    });
    return items.map(toProject);
  } catch {
    return [];
  }
}

export async function getEditorsPicks(limit = 4): Promise<Project[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendProject>('projects', {
      query: { page: 1, perPage: Math.max(limit * 4, 24) },
      auth: false,
    });
    return items
      .filter(p => p.editorsPick)
      .slice(0, limit)
      .map(toProject);
  } catch {
    return [];
  }
}

/** Same category first, then shared tags — delegates to the backend's `similar` endpoint. */
export async function getSimilarProjects(project: Project, limit = 4): Promise<Project[]> {
  try {
    const items = await apiClient.get<BackendProject[]>(`projects/slug/${project.slug}/similar`, {
      query: { limit },
      auth: false,
    });
    return items.slice(0, limit).map(toProject);
  } catch {
    return [];
  }
}

export interface CategorySummary {
  slug: ProjectCategory;
  count: number;
}

interface BackendFacets {
  categories: { id: string; slug: string; name: string; count: number }[];
  networks: { value: string; count: number }[];
}

/** Category list with counts, empty categories excluded. */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  try {
    const facets = await apiClient.get<BackendFacets>('projects/facets', { auth: false });
    const counts = new Map(facets.categories.map(c => [c.slug, c.count]));
    return PROJECT_CATEGORIES.map(slug => ({ slug, count: counts.get(slug) ?? 0 })).filter(
      entry => entry.count > 0
    );
  } catch {
    return [];
  }
}

export interface FacetSummary {
  value: string;
  count: number;
}

/** Networks that at least one project supports, most populated first. */
export async function getNetworkSummaries(): Promise<FacetSummary[]> {
  try {
    const facets = await apiClient.get<BackendFacets>('projects/facets', { auth: false });
    return facets.networks;
  } catch {
    return [];
  }
}

/** Counts for a curated set of tags, empty ones excluded. */
export async function getTagSummaries(tags: readonly string[]): Promise<FacetSummary[]> {
  try {
    const results = await Promise.all(
      tags.map(async value => {
        const { pagination } = await apiClient.getPaginated<BackendProject>('projects', {
          query: { tag: value, page: 1, perPage: 1 },
          auth: false,
        });
        return { value, count: pagination.total };
      })
    );
    return results.filter(entry => entry.count > 0).sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export async function getCollections(): Promise<ProjectCollection[]> {
  return projectCollections;
}

export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  const results = await Promise.all(slugs.map(getProjectBySlug));
  return results.filter((p): p is Project => Boolean(p));
}
