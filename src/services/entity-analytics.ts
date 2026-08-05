/**
 * Client for the dedicated Event and Founder analytics modules.
 *
 * Maps onto `admin/events/analytics/*` and `admin/founders/analytics/*`. The
 * two modules expose identical report shapes apart from their overview and
 * grouping dimensions, so one client serves both.
 */

import { apiClient } from '@/lib/api-client';
import type { AnalyticsFilters, Audience, DimensionRow, Geography, ReadingDepth } from './analytics';

export type EntityModule = 'events' | 'founders';

export interface CountRow {
  key: string;
  label: string;
  count: number;
}

export interface EventOverview {
  total: number;
  upcoming: number;
  live: number;
  completed: number;
  cancelled: number;
  postponed: number;
  draft: number;
  pendingReview: number;
  published: number;
  featured: number;
}

export interface FounderOverview {
  total: number;
  published: number;
  draft: number;
  featured: number;
  verified: number;
}

export interface DeviceBundle {
  devices: DimensionRow[];
  browsers: DimensionRow[];
  operatingSystems: DimensionRow[];
  languages: DimensionRow[];
  screenResolutions: CountRow[];
}

export interface SourceBundle {
  channels: DimensionRow[];
  referrers: DimensionRow[];
  social: DimensionRow[];
}

export interface Engagement {
  available: boolean;
  actions: CountRow[];
  shares: number;
}

export interface PerformanceRow {
  id: string;
  slug: string;
  title: string;
  group: string | null;
  views: number;
  clicks: Record<string, number>;
  totalClicks: number;
  ctr: number | null;
}

export interface GroupedRow {
  key: string;
  label: string;
  items: number;
  views: number;
  avgViews: number;
}

export interface SeoReport {
  organicVisitors: number;
  organicSessions: number;
  missingMetadata: Array<{ id: string; slug: string; title: string; issues: string[] }>;
  unavailable: string[];
}

type Query = Record<string, string | number | boolean | undefined>;

const get = <T>(module: EntityModule, path: string, filters: AnalyticsFilters, signal?: AbortSignal) =>
  apiClient.get<T>(`admin/${module}/analytics/${path}`, {
    query: filters as Query,
    signal,
  });

export const entityAnalyticsApi = {
  eventOverview: (signal?: AbortSignal) =>
    apiClient.get<EventOverview>('admin/events/analytics/overview', { signal }),
  founderOverview: (signal?: AbortSignal) =>
    apiClient.get<FounderOverview>('admin/founders/analytics/overview', { signal }),

  audience: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<Audience>(m, 'traffic', f, s),
  geography: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<Geography>(m, 'geography', f, s),
  continents: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<CountRow[]>(m, 'continents', f, s),
  devices: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<DeviceBundle>(m, 'devices', f, s),
  sources: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<SourceBundle>(m, 'sources', f, s),
  engagement: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<Engagement>(m, 'engagement', f, s),
  readingDepth: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) =>
    get<ReadingDepth>(m, 'reading-depth', f, s),
  performance: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) =>
    get<PerformanceRow[]>(m, 'performance', f, s),
  seo: (m: EntityModule, f: AnalyticsFilters, s?: AbortSignal) => get<SeoReport>(m, 'seo', f, s),
  grouped: (m: EntityModule, dimension: string, f: AnalyticsFilters, s?: AbortSignal) =>
    get<GroupedRow[]>(m, dimension, f, s),
};

/** Human labels for the engagement actions emitted by `trackEngagement`. */
export const ENGAGEMENT_LABELS: Record<string, string> = {
  register: 'Registration Link',
  website: 'Official Website',
  telegram: 'Telegram',
  x: 'X / Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  online_url: 'Online Event Link',
  organizer: 'Organizer',
  copy_link: 'Copy Link',
  related_project: 'Related Project',
  related_event: 'Related Event',
  related_article: 'Related Article',
  related_research: 'Related Research',
  share: 'Share',
};

/** Builds the module's CSV export path, carrying the active filters. */
export function moduleExportUrl(module: EntityModule, filters: AnalyticsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  return `admin/${module}/analytics/export?${params.toString()}`;
}
