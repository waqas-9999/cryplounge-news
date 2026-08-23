import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * The Google Analytics 4 Data API client.
 *
 * ## Why this is a separate, thin layer
 *
 * Everything Google-specific lives here: authentication, the property id, the
 * cache, and the shape of a report request. The service above it asks for rows
 * and gets rows. That separation is what keeps "GA4 is the source of truth"
 * from meaning "every report method now knows about protobuf-shaped responses
 * with `metricValues[3].value`".
 *
 * ## Credentials
 *
 * `GOOGLE_APPLICATION_CREDENTIALS` names a service-account key file, and the
 * Google client library reads it directly. This code never opens it, never
 * logs it and never puts any part of it in a response — the frontend calls our
 * API, and our API calls Google. A key that reached the browser would be a key
 * anyone could use to read the property.
 *
 * ## When GA is not configured
 *
 * `configured` is false and every caller falls back to the internal counters.
 * A missing reporting integration must not take the admin panel down, and it
 * must not silently render zeros that look like real traffic — the reports say
 * which source they came from, so the UI can be honest about it.
 */

export interface GaDateRange {
  /** `YYYY-MM-DD`, or a GA4 relative token like `today` / `7daysAgo`. */
  startDate: string;
  endDate: string;
}

export interface GaReportRequest {
  dateRanges: GaDateRange[];
  dimensions?: string[];
  metrics: string[];
  limit?: number;
  orderByMetric?: string;
  /** Seconds to cache this exact request. */
  cacheSeconds?: number;
}

/** One row, flattened: dimension values by name, metric values by name. */
export interface GaRow {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
}

export interface GaReport {
  rows: GaRow[];
  /** Property-wide totals for the requested metrics, when GA returned them. */
  totals: Record<string, number>;
}

interface CacheEntry {
  expiresAt: number;
  value: GaReport;
}

@Injectable()
export class Ga4Client {
  private readonly logger = new Logger(Ga4Client.name);
  private client: BetaAnalyticsDataClient | null = null;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly config: ConfigService) {}

  /** True when a property id and credentials are both present. */
  get configured(): boolean {
    return Boolean(this.propertyId && this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS'));
  }

  private get propertyId(): string | undefined {
    const raw = this.config.get<string>('GA_PROPERTY_ID');
    if (!raw) return undefined;
    // Accept either `123456789` or the `properties/123456789` form people
    // copy out of the GA interface.
    return raw.startsWith('properties/') ? raw : `properties/${raw}`;
  }

  /**
   * Built once, lazily.
   *
   * Constructing the client reads the key file, so doing it at module load
   * would make an unconfigured environment fail at boot rather than at the
   * first analytics request.
   */
  private instance(): BetaAnalyticsDataClient {
    this.client ??= new BetaAnalyticsDataClient();
    return this.client;
  }

  /**
   * Runs a report, with caching.
   *
   * The cache is keyed on the whole request, so two panels asking for the same
   * range and dimensions cost one Google call. Quota on the Data API is per
   * property and per day, and an admin leaving the dashboard open on a 30
   * second realtime poll will exhaust it without this.
   */
  async runReport(request: GaReportRequest): Promise<GaReport> {
    const key = JSON.stringify(request);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const [response] = await this.instance().runReport({
      property: this.propertyId,
      dateRanges: request.dateRanges,
      dimensions: request.dimensions?.map(name => ({ name })),
      metrics: request.metrics.map(name => ({ name })),
      limit: request.limit,
      orderBys: request.orderByMetric
        ? [{ metric: { metricName: request.orderByMetric }, desc: true }]
        : undefined,
    });

    const report = this.flatten(
      response.rows ?? [],
      request.dimensions ?? [],
      request.metrics,
      response.totals?.[0]?.metricValues ?? []
    );

    this.cache.set(key, {
      value: report,
      expiresAt: Date.now() + (request.cacheSeconds ?? 300) * 1000,
    });

    return report;
  }

  /**
   * The realtime report, which is a different endpoint with its own rules.
   *
   * Realtime accepts no date range — it is always the last 30 minutes — and
   * supports a much smaller set of dimensions and metrics than the standard
   * report. Kept separate rather than folded into `runReport` because a shared
   * signature would have to reject half its own arguments.
   */
  async runRealtimeReport(request: {
    dimensions?: string[];
    metrics: string[];
    limit?: number;
    cacheSeconds?: number;
  }): Promise<GaReport> {
    const key = `realtime:${JSON.stringify(request)}`;
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const [response] = await this.instance().runRealtimeReport({
      property: this.propertyId,
      dimensions: request.dimensions?.map(name => ({ name })),
      metrics: request.metrics.map(name => ({ name })),
      limit: request.limit,
    });

    const report = this.flatten(
      response.rows ?? [],
      request.dimensions ?? [],
      request.metrics,
      response.totals?.[0]?.metricValues ?? []
    );

    // 30 seconds, per the brief. Long enough to stop a polling dashboard
    // burning quota, short enough that "active now" still means now.
    this.cache.set(key, {
      value: report,
      expiresAt: Date.now() + (request.cacheSeconds ?? 30) * 1000,
    });

    return report;
  }

  /** Drops every cached report. Used by tests and after a config change. */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Turns GA's positional arrays into rows keyed by name.
   *
   * GA returns dimension and metric values as parallel arrays whose meaning is
   * given by the request. Reading `metricValues[2]` at the call site is how a
   * reordered request becomes a silently wrong number, so the mapping happens
   * once, here, against the names that were asked for.
   */
  private flatten(
    rows: Array<{
      dimensionValues?: Array<{ value?: string | null } | null> | null;
      metricValues?: Array<{ value?: string | null } | null> | null;
    }>,
    dimensionNames: string[],
    metricNames: string[],
    totalValues: Array<{ value?: string | null } | null>
  ): GaReport {
    const mapped: GaRow[] = rows.map(row => {
      const dimensions: Record<string, string> = {};
      dimensionNames.forEach((name, index) => {
        dimensions[name] = row.dimensionValues?.[index]?.value ?? '';
      });

      const metrics: Record<string, number> = {};
      metricNames.forEach((name, index) => {
        metrics[name] = toNumber(row.metricValues?.[index]?.value);
      });

      return { dimensions, metrics };
    });

    const totals: Record<string, number> = {};
    metricNames.forEach((name, index) => {
      totals[name] = toNumber(totalValues[index]?.value);
    });

    return { rows: mapped, totals };
  }

  /** Logs a failure without leaking anything about the credentials. */
  logFailure(report: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`GA4 ${report} report failed, falling back to internal counters: ${message}`);
  }
}

/** GA returns every number as a string, and an absent metric as undefined. */
export function toNumber(value: string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
