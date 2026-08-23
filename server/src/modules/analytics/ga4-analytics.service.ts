import { Injectable } from '@nestjs/common';
import { Ga4Client, type GaRow } from './ga4.client';

/**
 * Visitor metrics, read from Google Analytics 4.
 *
 * ## What this replaces, and what it deliberately does not
 *
 * The dashboard's *visitor* figures — users, sessions, page views, engagement,
 * bounce rate, countries, devices, traffic sources — now come from GA4, which
 * is what makes the numbers match the GA reports an editor compares them
 * against. That was the whole problem: the internal counters missed anything
 * that never reached our server (cached pages, prefetches, blocked beacons)
 * and counted things GA discards (bots we failed to spot).
 *
 * What stays internal, because GA4 does not know it: shares, bookmarks,
 * comments and article metadata. Those are CMS facts, not visitor behaviour.
 * The article table therefore merges GA4 traffic onto CMS rows rather than
 * being replaced by GA4 — an article's title and author are ours, its view
 * count is Google's.
 *
 * ## Response shapes are unchanged
 *
 * Every method returns exactly the shape the existing frontend already
 * consumes, because the brief is to change the data source and nothing else.
 * No component, chart or type on the frontend changes.
 */

/**
 * The range as the dashboard sends it.
 *
 * The query DTO parses `from`/`to` into `Date`, while a GA relative token like
 * `7daysAgo` arrives as a string. Both are accepted rather than forcing a
 * conversion on every caller.
 */
export interface DashboardRange {
  from?: string | Date;
  to?: string | Date;
}

/** The row shape every dimension report on the dashboard already expects. */
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

const METRICS = [
  'totalUsers',
  'activeUsers',
  'newUsers',
  'sessions',
  'screenPageViews',
  'averageSessionDuration',
  'bounceRate',
  'engagementRate',
] as const;

/** Metrics used for the per-dimension tables. */
const DIMENSION_METRICS = [
  'totalUsers',
  'sessions',
  'screenPageViews',
  'engagementRate',
  'averageSessionDuration',
] as const;

@Injectable()
export class Ga4AnalyticsService {
  constructor(private readonly ga: Ga4Client) {}

  get available(): boolean {
    return this.ga.configured;
  }

  /* ------------------------------------------------------------ overview -- */

  /**
   * Headline totals for the range, plus the preceding range of equal length.
   *
   * The previous period is fetched in the same call as a second date range so
   * the deltas on the cards compare like with like — GA4 computes both against
   * the same property and the same processing state, which a second request
   * made a minute later would not guarantee.
   */
  async overview(range: DashboardRange): Promise<{
    from: Date;
    to: Date;
    totalViews: number;
    current: OverviewTotals;
    previous: OverviewTotals;
    deltas: Record<string, number | null>;
  }> {
    const { startDate, endDate } = toGaRange(range);
    const previous = precedingRange(startDate, endDate);

    const report = await this.ga.runReport({
      dateRanges: [
        { startDate, endDate },
        { startDate: previous.startDate, endDate: previous.endDate },
      ],
      dimensions: ['dateRange'],
      metrics: [...METRICS],
      cacheSeconds: 300,
    });

    // With two date ranges GA labels each row `date_range_0` / `date_range_1`.
    const currentRow = report.rows.find(row => row.dimensions.dateRange === 'date_range_0');
    const previousRow = report.rows.find(row => row.dimensions.dateRange === 'date_range_1');

    const current = toTotals(currentRow);
    const prior = toTotals(previousRow);

    return {
      // Dates, matching the internal report exactly. The two branches have to
      // be interchangeable or the fallback is not a fallback; both serialise
      // to the ISO string the dashboard already parses.
      from: new Date(`${startDate}T00:00:00.000Z`),
      to: new Date(`${endDate}T23:59:59.999Z`),
      totalViews: current.pageViews,
      current,
      previous: prior,
      deltas: deltasBetween(current, prior),
    };
  }

  /* ------------------------------------------------------------ realtime -- */

  /**
   * Who is on the site right now.
   *
   * Four separate realtime calls rather than one: GA4's realtime endpoint
   * returns a row per dimension *combination*, so asking for page, country and
   * device together would produce a cross-product that has to be re-aggregated
   * three ways — and the totals would drift from what GA's own realtime screen
   * shows. Each is cached for 30 seconds, so a polling dashboard costs four
   * calls per half minute rather than four per poll.
   */
  async realtime(): Promise<{
    activeNow: number;
    windows: Array<{ minutes: number; users: number }>;
    activePages: Array<{ path: string; viewers: number }>;
    countries: Array<{ key: string; label: string; users: number }>;
    devices: Array<{ key: string; label: string; users: number }>;
  }> {
    const [total, pages, countries, devices] = await Promise.all([
      this.ga.runRealtimeReport({ metrics: ['activeUsers'] }),
      this.ga.runRealtimeReport({
        dimensions: ['unifiedScreenName'],
        metrics: ['activeUsers'],
        limit: 20,
      }),
      this.ga.runRealtimeReport({ dimensions: ['country'], metrics: ['activeUsers'], limit: 20 }),
      this.ga.runRealtimeReport({ dimensions: ['deviceCategory'], metrics: ['activeUsers'] }),
    ]);

    const activeNow = total.totals.activeUsers ?? 0;

    return {
      activeNow,
      // GA4 realtime exposes one 30-minute window, not the arbitrary buckets
      // the internal counter could produce. Reporting the window it actually
      // covers is better than interpolating three that GA never measured.
      windows: [{ minutes: 30, users: activeNow }],
      activePages: pages.rows.map(row => ({
        path: row.dimensions.unifiedScreenName || '(not set)',
        viewers: row.metrics.activeUsers,
      })),
      countries: countries.rows.map(row => ({
        key: row.dimensions.country || 'unknown',
        label: row.dimensions.country || 'Unknown',
        users: row.metrics.activeUsers,
      })),
      devices: devices.rows.map(row => ({
        key: row.dimensions.deviceCategory || 'unknown',
        label: titleCase(row.dimensions.deviceCategory || 'Unknown'),
        users: row.metrics.activeUsers,
      })),
    };
  }

  /* --------------------------------------------------------------- pages -- */

  /**
   * Most-read pages.
   *
   * `pagePath` is the key rather than `pageTitle`: titles get edited, and two
   * different articles can carry the same title, so grouping on it silently
   * merges them. The title is carried alongside for display.
   */
  async pages(
    range: DashboardRange,
    limit = 50
  ): Promise<Array<{ path: string; title: string; views: number; users: number; engagementTime: number }>> {
    const report = await this.ga.runReport({
      dateRanges: [toGaRange(range)],
      dimensions: ['pagePath', 'pageTitle'],
      metrics: ['screenPageViews', 'totalUsers', 'userEngagementDuration'],
      orderByMetric: 'screenPageViews',
      limit,
      cacheSeconds: 300,
    });

    return report.rows.map(row => ({
      path: row.dimensions.pagePath,
      title: row.dimensions.pageTitle,
      views: row.metrics.screenPageViews,
      users: row.metrics.totalUsers,
      // GA reports engagement as a total across users; per-user is what the
      // dashboard's "avg time" column means.
      engagementTime: row.metrics.totalUsers
        ? row.metrics.userEngagementDuration / row.metrics.totalUsers
        : 0,
    }));
  }

  /* ------------------------------------------------------------- sources -- */

  /**
   * Where the traffic came from.
   *
   * Grouped on `sessionSource` + `sessionMedium` rather than GA's
   * `sessionDefaultChannelGroup`, because the dashboard distinguishes
   * Twitter/X from Telegram and the channel grouping folds both into
   * "Social". The familiar labels — "Google Organic Search", "Direct" — are
   * reconstructed from the pair.
   */
  async sources(range: DashboardRange, limit = 25): Promise<DimensionRow[]> {
    const report = await this.ga.runReport({
      dateRanges: [toGaRange(range)],
      dimensions: ['sessionSource', 'sessionMedium'],
      metrics: [...DIMENSION_METRICS],
      orderByMetric: 'sessions',
      limit,
      cacheSeconds: 300,
    });

    return report.rows.map(row => {
      const source = row.dimensions.sessionSource || '(direct)';
      const medium = row.dimensions.sessionMedium || '(none)';
      return toDimensionRow(row, `${source} / ${medium}`, sourceLabel(source, medium));
    });
  }

  /* ----------------------------------------------------------- geography -- */

  async geography(range: DashboardRange): Promise<{
    countries: DimensionRow[];
    regions: DimensionRow[];
    cities: DimensionRow[];
    available: boolean;
  }> {
    const gaRange = toGaRange(range);

    const [countries, regions, cities] = await Promise.all([
      this.dimension(gaRange, 'country', 50),
      this.dimension(gaRange, 'region', 50),
      this.dimension(gaRange, 'city', 50),
    ]);

    return { countries, regions, cities, available: true };
  }

  /* ------------------------------------------------------------- devices -- */

  async devices(range: DashboardRange): Promise<DimensionRow[]> {
    // deviceCategory is exactly desktop / mobile / tablet, which is what the
    // dashboard's three-way split already renders.
    return this.dimension(toGaRange(range), 'deviceCategory', 10, titleCase);
  }

  async browsers(range: DashboardRange): Promise<DimensionRow[]> {
    return this.dimension(toGaRange(range), 'browser', 20);
  }

  async operatingSystems(range: DashboardRange): Promise<DimensionRow[]> {
    return this.dimension(toGaRange(range), 'operatingSystem', 20);
  }

  async languages(range: DashboardRange): Promise<DimensionRow[]> {
    return this.dimension(toGaRange(range), 'language', 20);
  }

  /** Referring sites only — sources whose medium GA classified as a referral. */
  async referrers(range: DashboardRange, limit = 25): Promise<DimensionRow[]> {
    const rows = await this.sources(range, 100);
    return rows.filter(row => row.key.endsWith('/ referral')).slice(0, limit);
  }

  /* ------------------------------------------------------------- helpers -- */

  /** One dimension, the standard five metrics, ordered by sessions. */
  private async dimension(
    range: { startDate: string; endDate: string },
    dimension: string,
    limit: number,
    label: (value: string) => string = value => value
  ): Promise<DimensionRow[]> {
    const report = await this.ga.runReport({
      dateRanges: [range],
      dimensions: [dimension],
      metrics: [...DIMENSION_METRICS],
      orderByMetric: 'sessions',
      limit,
      cacheSeconds: 300,
    });

    return report.rows.map(row => {
      const raw = row.dimensions[dimension] || 'unknown';
      return toDimensionRow(row, raw, label(raw));
    });
  }
}

/* ---------------------------------------------------------------- mapping -- */

function toDimensionRow(row: GaRow, key: string, label: string): DimensionRow {
  return {
    key,
    label,
    visitors: row.metrics.totalUsers,
    sessions: row.metrics.sessions,
    pageViews: row.metrics.screenPageViews,
    // GA4 cannot distinguish an article view from any other page view without
    // a content grouping configured on the property. Reporting page views
    // here would overstate it, so it carries the same figure the dashboard
    // labels "views" and nothing is invented.
    articleViews: row.metrics.screenPageViews,
    // GA returns engagementRate and bounceRate as 0-1; the dashboard renders
    // percentages.
    engagementRate: row.metrics.engagementRate * 100,
    avgSessionDuration: row.metrics.averageSessionDuration,
  };
}

function toTotals(row: GaRow | undefined): OverviewTotals {
  const metrics = row?.metrics ?? {};

  return {
    visitors: metrics.totalUsers ?? 0,
    // GA's "active users" is the closest thing it has to a unique visitor,
    // and it is the number shown on the GA home screen an editor compares
    // against.
    uniqueVisitors: metrics.activeUsers ?? 0,
    sessions: metrics.sessions ?? 0,
    pageViews: metrics.screenPageViews ?? 0,
    articleViews: metrics.screenPageViews ?? 0,
    // Not a GA concept. Shares are recorded by the CMS and merged in by the
    // controller; zero here means "GA does not know", not "nobody shared".
    shares: 0,
    avgSessionDuration: metrics.averageSessionDuration ?? 0,
    bounceRate: (metrics.bounceRate ?? 0) * 100,
    engagementRate: (metrics.engagementRate ?? 0) * 100,
  };
}

/** Percentage change per metric, null when the previous period was empty. */
function deltasBetween(current: OverviewTotals, previous: OverviewTotals): Record<string, number | null> {
  const deltas: Record<string, number | null> = {};

  for (const key of Object.keys(current) as Array<keyof OverviewTotals>) {
    const before = previous[key];
    const after = current[key];
    // A rise from zero has no meaningful percentage, and rendering it as
    // +100% or +∞ is how a dashboard reports a fiction confidently.
    deltas[key] = before === 0 ? null : ((after - before) / before) * 100;
  }

  return deltas;
}

/* ----------------------------------------------------------------- dates -- */

/** GA4 wants `YYYY-MM-DD`; the dashboard sends ISO timestamps. */
export function toGaDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/**
 * The dashboard's range, as GA4 wants it.
 *
 * Defaults to the last 28 days when the dashboard sends nothing, matching
 * GA4's own default so an unfiltered dashboard and an unfiltered GA report
 * show the same figures.
 */
export function toGaRange(range: DashboardRange): {
  startDate: string;
  endDate: string;
} {
  const end = range.to ? new Date(range.to) : new Date();
  const start = range.from ? new Date(range.from) : new Date(end.getTime() - 27 * 86_400_000);

  return { startDate: toGaDate(start), endDate: toGaDate(end) };
}

/** The equally-long range immediately before this one, for the deltas. */
export function precedingRange(startDate: string, endDate: string): {
  startDate: string;
  endDate: string;
} {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  const previousEnd = new Date(start.getTime() - 86_400_000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86_400_000);

  return { startDate: toGaDate(previousStart), endDate: toGaDate(previousEnd) };
}

/* ---------------------------------------------------------------- labels -- */

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * The human label for a source/medium pair.
 *
 * These are the names an editor recognises from the GA acquisition report, so
 * the dashboard and GA read the same way. Anything unrecognised falls through
 * to the raw pair rather than being forced into a bucket.
 */
export function sourceLabel(source: string, medium: string): string {
  const key = source.toLowerCase();

  if (key === '(direct)') return 'Direct';
  if (key.includes('google') && medium === 'organic') return 'Google Organic Search';
  if (medium === 'organic') return `${titleCase(source)} Organic Search`;
  if (key.includes('t.co') || key.includes('twitter') || key === 'x.com') return 'Twitter/X';
  if (key.includes('telegram') || key === 't.me') return 'Telegram';
  if (key.includes('reddit')) return 'Reddit';
  if (key.includes('facebook')) return 'Facebook';
  if (key.includes('linkedin')) return 'LinkedIn';
  if (medium === 'referral') return `${source} (Referral)`;
  if (medium === '(none)') return titleCase(source);

  return `${source} / ${medium}`;
}
