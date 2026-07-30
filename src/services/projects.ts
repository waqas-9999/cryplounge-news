import type { Project, ProjectCollection } from '@/types/project';
import { projects, projectCollections } from '@/data/projects';
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy';

/**
 * Data access for the Ecosystem directory.
 *
 * This is the only module that knows where project data lives. Every function
 * is async and every list function is paginated, so replacing the seed import
 * with `fetch('/api/projects?...')` requires no change in any caller.
 *
 * Business logic (filtering, sorting, relatedness) lives here rather than in
 * components.
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

const DEFAULT_PER_PAGE = 12;

function byNewest(a: Project, b: Project) {
  return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
}

function sortProjects(list: Project[], sort: ProjectSort): Project[] {
  const sorted = [...list];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => -byNewest(a, b));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
    default:
      return sorted.sort(byNewest);
  }
}

function matchesQuery(project: Project, query: ProjectQuery): boolean {
  if (query.category && project.category !== query.category) return false;
  if (query.network && !project.supportedNetworks.includes(query.network)) return false;
  if (query.tag && !project.tags.includes(query.tag)) return false;

  if (query.search) {
    const needle = query.search.trim().toLowerCase();
    if (needle) {
      const haystack = [project.name, project.tagline, project.about, ...project.tags]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }
  return true;
}

function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    perPage,
    total,
    totalPages,
  };
}

/** Filtered, sorted, paginated project list. */
export async function listProjects(query: ProjectQuery = {}): Promise<Paginated<Project>> {
  const filtered = projects.filter(p => matchesQuery(p, query));
  const sorted = sortProjects(filtered, query.sort ?? 'newest');
  return paginate(sorted, query.page ?? 1, query.perPage ?? DEFAULT_PER_PAGE);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find(p => p.slug === slug) ?? null;
}

/** Every slug, for `generateStaticParams`. */
export async function getAllProjectSlugs(): Promise<string[]> {
  return projects.map(p => p.slug);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  return projects.filter(p => p.featured).sort(byNewest).slice(0, limit);
}

/**
 * Newsroom-curated selection.
 *
 * There is no pageview data on the client yet, so "trending" is editorial:
 * featured or editor's-pick entries, most recent first. Swap this for a real
 * popularity signal once analytics are wired up — do not invent one here.
 */
export async function getTrendingProjects(limit = 6): Promise<Project[]> {
  return projects
    .filter(p => p.featured || p.editorsPick)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getRecentProjects(limit = 6): Promise<Project[]> {
  return [...projects].sort(byNewest).slice(0, limit);
}

export async function getEditorsPicks(limit = 4): Promise<Project[]> {
  return projects.filter(p => p.editorsPick).sort(byNewest).slice(0, limit);
}

/**
 * Similar projects: same category first, then any project sharing a tag.
 * Never returns the project itself.
 */
export async function getSimilarProjects(project: Project, limit = 4): Promise<Project[]> {
  const others = projects.filter(p => p.slug !== project.slug);

  const scored = others
    .map(candidate => {
      const sharedTags = candidate.tags.filter(t => project.tags.includes(t)).length;
      const sameCategory = candidate.category === project.category ? 3 : 0;
      const sharedNetwork = candidate.supportedNetworks.some(n =>
        project.supportedNetworks.includes(n)
      )
        ? 1
        : 0;
      return { candidate, score: sameCategory + sharedTags + sharedNetwork };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.candidate, b.candidate));

  return scored.slice(0, limit).map(entry => entry.candidate);
}

export interface CategorySummary {
  slug: ProjectCategory;
  count: number;
}

/** Category list with counts, empty categories excluded. */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  return PROJECT_CATEGORIES.map(slug => ({
    slug,
    count: projects.filter(p => p.category === slug).length,
  })).filter(entry => entry.count > 0);
}

export interface FacetSummary {
  value: string;
  count: number;
}

/** Networks that at least one project supports, most populated first. */
export async function getNetworkSummaries(): Promise<FacetSummary[]> {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const network of project.supportedNetworks) {
      counts.set(network, (counts.get(network) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Counts for a curated set of tags, empty ones excluded. */
export async function getTagSummaries(tags: readonly string[]): Promise<FacetSummary[]> {
  return tags
    .map(value => ({ value, count: projects.filter(p => p.tags.includes(value)).length }))
    .filter(entry => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function getCollections(): Promise<ProjectCollection[]> {
  return projectCollections;
}

export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  return slugs
    .map(slug => projects.find(p => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
}
