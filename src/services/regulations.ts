import { apiClient } from '@/lib/api-client';

/**
 * Data access for regulation coverage.
 *
 * Backed by the real NestJS `regulations` endpoints (`LIST_SELECT` /
 * `DETAIL_INCLUDE` in `server/src/modules/regulations/regulations.service.ts`).
 */

export interface RegulationItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  countryCode: string;
  countryName: string;
  region: string | null;
  status: string;
  publishedAt: string | null;
  category: string;
  categorySlug: string;
  tags: string[];
}

export interface RegulationQuery {
  country?: string;
  region?: string;
  tag?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedRegulations {
  items: RegulationItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PER_PAGE = 12;

interface BackendRegulation {
  id: string;
  slug: string;
  title: string;
  summary: string;
  countryCode: string;
  countryName: string;
  region: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  category: { id: string; slug: string; name: string } | null;
  tags: { id: string; slug: string; name: string }[];
}

function toRegulationItem(r: BackendRegulation): RegulationItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    countryCode: r.countryCode,
    countryName: r.countryName,
    region: r.region,
    status: r.status,
    publishedAt: r.publishedAt,
    category: r.category?.name ?? 'Regulation',
    categorySlug: r.category?.slug ?? 'regulation',
    tags: r.tags.map(t => t.name),
  };
}

export async function listRegulations(query: RegulationQuery = {}): Promise<PaginatedRegulations> {
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const page = query.page ?? 1;

  const { items, pagination } = await apiClient.getPaginated<BackendRegulation>('regulations', {
    query: {
      country: query.country,
      region: query.region,
      tag: query.tag,
      search: query.search,
      page,
      perPage,
    },
    auth: false,
  });

  return {
    items: items.map(toRegulationItem),
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getRegulationBySlug(slug: string): Promise<RegulationItem | null> {
  try {
    const item = await apiClient.get<BackendRegulation>(`regulations/slug/${slug}`, { auth: false });
    return toRegulationItem(item);
  } catch {
    return null;
  }
}

export interface Jurisdiction {
  countryCode: string;
  countryName: string;
  region: string | null;
}

export async function listJurisdictions(): Promise<Jurisdiction[]> {
  return apiClient.get<Jurisdiction[]>('regulations/jurisdictions', { auth: false });
}
