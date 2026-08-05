/**
 * Typed client for the admin analytics API.
 *
 * Every function here maps 1:1 onto an endpoint in
 * `server/src/modules/analytics/analytics.controller.ts`. No figure is
 * computed locally beyond formatting — if a number is not in the response, it
 * is not available, and the UI must say so rather than derive a plausible
 * substitute.
 */

import { apiClient } from '@/lib/api-client';

/* ---------------------------------------------------------------- types --- */

export interface DimensionRow {
  key: string;
  label: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  articleViews: number;
  engagementRate: number;
  avgSessionDuration: number;
}

export interface OverviewTotals {
  visitors: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  articleViews: number;
  shares: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
}

export interface Overview {
  from: string;
  to: string;
  totalViews: number;
  current: OverviewTotals;
  previous: OverviewTotals;
  deltas: Record<string, number | null>;
}

export interface TrafficPoint {
  label: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  articleViews: number;
}

export interface Traffic {
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  points: TrafficPoint[];
}

export interface Realtime {
  activeNow: number;
  windows: Array<{ minutes: number; users: number }>;
  activePages: Array<{ path: string; viewers: number }>;
}

export interface Geography {
  countries: DimensionRow[];
  regions: DimensionRow[];
  cities: DimensionRow[];
  available: boolean;
}

export interface Audience {
  available: boolean;
  new: number;
  returning: number;
  newRate: number;
  returningRate: number;
  trend: Array<{ date: string; new: number; returning: number }>;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  categoryId: string | null;
  author: string | null;
  authorId: string | null;
  publishedAt: string | null;
  readMinutes: number;
  views: number;
  uniqueReaders: number;
  avgReadTime: number;
  engagementRate: number;
  shares: number;
  bookmarks: number;
  comments: number;
  completions: number;
}

export interface PaginatedArticles {
  items: ArticleRow[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ReadingDepth {
  available: boolean;
  base: number;
  milestones: Array<{ depth: number; sessions: number; rate: number }>;
}

export interface ContentGroupRow {
  id: string;
  label: string;
  articles: number;
  views: number;
  uniqueReaders: number;
  avgReadTime: number;
  engagementRate: number;
  topArticle?: { id: string; title: string; views: number } | null;
}

export interface TrendingRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  views: number;
  viewsPerHour: number;
  growth: number | null;
}

export interface Publishing {
  available: boolean;
  byHour: Array<{ hour: number; views: number; articles: number; viewsPerArticle: number }>;
  byDay: Array<{ day: string; index: number; views: number; articles: number; viewsPerArticle: number }>;
  lifecycle: Array<{ bucket: string; views: number }>;
}

export interface SearchAnalytics {
  totalSearches: number;
  topTerms: Array<{ term: string; count: number }>;
  zeroResultTerms: Array<{ term: string; count: number }>;
}

export interface ArticleDetail {
  article: {
    id: string;
    slug: string;
    title: string;
    publishedAt: string | null;
    readMinutes: number;
    category: string | null;
    author: string | null;
  };
  totals: {
    views: number;
    uniqueReaders: number;
    avgReadTime: number;
    engagementRate: number;
    shares: number;
    bookmarks: number;
    comments: number;
    completions: number;
  };
  viewsOverTime: Array<{ date: string; views: number }>;
  readingDepth: ReadingDepth;
  trafficSources: Array<{ key: string; label: string; count: number }>;
  geography: Array<{ key: string; label: string; count: number }>;
  devices: Array<{ key: string; label: string; count: number }>;
}

/* --------------------------------------------------------------- filters -- */

/** The global filter set shared by every panel on the analytics page. */
export interface AnalyticsFilters {
  from?: string;
  to?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  language?: string;
  authorId?: string;
  categoryId?: string;
}

type Query = Record<string, string | number | boolean | undefined>;

function toQuery(filters: AnalyticsFilters, extra: Query = {}): Query {
  return { ...filters, ...extra };
}

/* -------------------------------------------------------------- fetchers -- */

const get = <T>(path: string, filters: AnalyticsFilters, extra: Query = {}, signal?: AbortSignal) =>
  apiClient.get<T>(`admin/analytics/${path}`, { query: toQuery(filters, extra), signal });

export const analyticsApi = {
  overview: (f: AnalyticsFilters, signal?: AbortSignal) => get<Overview>('overview', f, {}, signal),
  traffic: (f: AnalyticsFilters, signal?: AbortSignal) => get<Traffic>('traffic', f, {}, signal),
  realtime: (signal?: AbortSignal) => get<Realtime>('realtime', {}, {}, signal),
  geography: (f: AnalyticsFilters, signal?: AbortSignal) => get<Geography>('geography', f, {}, signal),
  devices: (f: AnalyticsFilters, signal?: AbortSignal) => get<DimensionRow[]>('devices', f, {}, signal),
  browsers: (f: AnalyticsFilters, signal?: AbortSignal) => get<DimensionRow[]>('browsers', f, {}, signal),
  operatingSystems: (f: AnalyticsFilters, signal?: AbortSignal) =>
    get<DimensionRow[]>('operating-systems', f, {}, signal),
  languages: (f: AnalyticsFilters, signal?: AbortSignal) => get<DimensionRow[]>('languages', f, {}, signal),
  audience: (f: AnalyticsFilters, signal?: AbortSignal) => get<Audience>('audience', f, {}, signal),
  acquisition: (f: AnalyticsFilters, signal?: AbortSignal) =>
    get<DimensionRow[]>('acquisition', f, {}, signal),
  referrers: (f: AnalyticsFilters, signal?: AbortSignal) => get<DimensionRow[]>('referrers', f, {}, signal),
  social: (f: AnalyticsFilters, signal?: AbortSignal) => get<DimensionRow[]>('social', f, {}, signal),
  articles: (f: AnalyticsFilters, extra: Query, signal?: AbortSignal) =>
    get<PaginatedArticles>('articles', f, extra, signal),
  articleDetail: (id: string, f: AnalyticsFilters, signal?: AbortSignal) =>
    get<ArticleDetail>(`articles/${encodeURIComponent(id)}`, f, {}, signal),
  readingDepth: (f: AnalyticsFilters, signal?: AbortSignal) =>
    get<ReadingDepth>('reading-depth', f, {}, signal),
  categories: (f: AnalyticsFilters, signal?: AbortSignal) =>
    get<ContentGroupRow[]>('categories', f, {}, signal),
  authors: (f: AnalyticsFilters, signal?: AbortSignal) => get<ContentGroupRow[]>('authors', f, {}, signal),
  trending: (f: AnalyticsFilters, signal?: AbortSignal) => get<TrendingRow[]>('trending', f, {}, signal),
  publishing: (f: AnalyticsFilters, signal?: AbortSignal) => get<Publishing>('publishing', f, {}, signal),
  search: (f: AnalyticsFilters, signal?: AbortSignal) => get<SearchAnalytics>('search', f, {}, signal),
};

/* ---------------------------------------------------------------- ranges -- */

export type RangePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom';

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 Days',
  last30: 'Last 30 Days',
  last90: 'Last 90 Days',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
  custom: 'Custom Range',
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/** Resolve a preset to a concrete `[from, to]` pair in ISO form. */
export function resolveRange(preset: RangePreset, custom?: { from: string; to: string }) {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { from: startOfDay(now).toISOString(), to: now.toISOString() };
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 86400000);
      return { from: startOfDay(yesterday).toISOString(), to: endOfDay(yesterday).toISOString() };
    }
    case 'last7':
      return { from: startOfDay(new Date(now.getTime() - 6 * 86400000)).toISOString(), to: now.toISOString() };
    case 'last30':
      return { from: startOfDay(new Date(now.getTime() - 29 * 86400000)).toISOString(), to: now.toISOString() };
    case 'last90':
      return { from: startOfDay(new Date(now.getTime() - 89 * 86400000)).toISOString(), to: now.toISOString() };
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: now.toISOString() };
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: first.toISOString(), to: last.toISOString() };
    }
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: now.toISOString() };
    case 'custom':
      return custom?.from && custom?.to
        ? { from: new Date(custom.from).toISOString(), to: endOfDay(new Date(custom.to)).toISOString() }
        : { from: startOfDay(new Date(now.getTime() - 29 * 86400000)).toISOString(), to: now.toISOString() };
  }
}

/* ------------------------------------------------------------ formatting -- */

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/** Compact form for axis ticks, where space is tight (12.4K, 1.2M). */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** Seconds as `m:ss`, or `h:mm:ss` once it passes an hour. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Builds the CSV export URL for a report, carrying the active filters. */
export function exportUrl(type: string, filters: AnalyticsFilters, entityId?: string): string {
  const params = new URLSearchParams();
  params.set('type', type);
  if (entityId) params.set('entityId', entityId);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  return `admin/analytics/export?${params.toString()}`;
}
