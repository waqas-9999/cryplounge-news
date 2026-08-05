import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AnalyticsReportsService } from './analytics-reports.service';
import type { AnalyticsRangeQueryDto } from './dto/analytics.dto';

/**
 * Analytics for Events and Founders.
 *
 * One engine, two admin surfaces. The traffic, geography, device and
 * acquisition reports are *not* reimplemented here — `AnalyticsReportsService`
 * already filters by `entity`, so those come from the same code the news
 * analytics uses. Only what is genuinely specific to events and founders
 * lives in this file: status rollups, engagement clicks, and the
 * organizer/chain/company/industry breakdowns.
 */

const MAX_ROWS = 50000;

export type ContentEntity = 'Event' | 'Founder';

/**
 * Continent per ISO-3166 alpha-2 country. Only continent membership is stored
 * — this is a fixed geographic fact, not analytics data, so hardcoding it is
 * correct. Countries absent from the table are reported as "Unknown" rather
 * than guessed.
 */
const CONTINENTS: Record<string, string> = {
  AF: 'Asia', AL: 'Europe', DZ: 'Africa', AR: 'South America', AM: 'Asia', AU: 'Oceania',
  AT: 'Europe', AZ: 'Asia', BH: 'Asia', BD: 'Asia', BY: 'Europe', BE: 'Europe', BO: 'South America',
  BA: 'Europe', BR: 'South America', BG: 'Europe', KH: 'Asia', CM: 'Africa', CA: 'North America',
  CL: 'South America', CN: 'Asia', CO: 'South America', CR: 'North America', HR: 'Europe',
  CU: 'North America', CY: 'Asia', CZ: 'Europe', DK: 'Europe', DO: 'North America',
  EC: 'South America', EG: 'Africa', SV: 'North America', EE: 'Europe', ET: 'Africa',
  FI: 'Europe', FR: 'Europe', GE: 'Asia', DE: 'Europe', GH: 'Africa', GR: 'Europe',
  GT: 'North America', HK: 'Asia', HU: 'Europe', IS: 'Europe', IN: 'Asia', ID: 'Asia',
  IR: 'Asia', IQ: 'Asia', IE: 'Europe', IL: 'Asia', IT: 'Europe', JM: 'North America',
  JP: 'Asia', JO: 'Asia', KZ: 'Asia', KE: 'Africa', KW: 'Asia', LV: 'Europe', LB: 'Asia',
  LT: 'Europe', LU: 'Europe', MY: 'Asia', MT: 'Europe', MX: 'North America', MD: 'Europe',
  MA: 'Africa', NP: 'Asia', NL: 'Europe', NZ: 'Oceania', NG: 'Africa', NO: 'Europe',
  OM: 'Asia', PK: 'Asia', PA: 'North America', PY: 'South America', PE: 'South America',
  PH: 'Asia', PL: 'Europe', PT: 'Europe', QA: 'Asia', RO: 'Europe', RU: 'Europe',
  SA: 'Asia', RS: 'Europe', SG: 'Asia', SK: 'Europe', SI: 'Europe', ZA: 'Africa',
  KR: 'Asia', ES: 'Europe', LK: 'Asia', SE: 'Europe', CH: 'Europe', TW: 'Asia',
  TZ: 'Africa', TH: 'Asia', TN: 'Africa', TR: 'Asia', UA: 'Europe', AE: 'Asia',
  GB: 'Europe', US: 'North America', UY: 'South America', UZ: 'Asia', VE: 'South America',
  VN: 'Asia', ZW: 'Africa',
};

export interface CountRow {
  key: string;
  label: string;
  count: number;
}

interface EngagementEvent {
  entityId: string | null;
  meta: Prisma.JsonValue;
  sessionId: string;
}

function tally(pairs: Array<string | null | undefined>): CountRow[] {
  const map = new Map<string, number>();
  for (const value of pairs) {
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count);
}

@Injectable()
export class EntityAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: AnalyticsReportsService
  ) {}

  /* ------------------------------------------------------------ overview -- */

  /**
   * Event status rollup.
   *
   * Lifecycle states (upcoming/live/completed) are derived from `startsAt` and
   * `endsAt` rather than stored, so they can never drift out of date. Cancelled
   * and postponed come from their own timestamps, which is why an event can be
   * both published and cancelled.
   */
  async eventOverview() {
    const now = new Date();
    const live: Prisma.EventWhereInput = {
      deletedAt: null,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      cancelledAt: null,
    };

    const count = (where: Prisma.EventWhereInput) =>
      this.prisma.event.count({ where: { deletedAt: null, ...where } });

    const [total, upcoming, liveNow, completed, cancelled, postponed, draft, review, published, featured] =
      await Promise.all([
        count({}),
        count({ startsAt: { gt: now }, cancelledAt: null }),
        this.prisma.event.count({ where: live }),
        count({ endsAt: { lt: now } }),
        count({ cancelledAt: { not: null } }),
        count({ postponedAt: { not: null } }),
        count({ status: ContentStatus.DRAFT }),
        count({ status: ContentStatus.REVIEW }),
        count({ status: ContentStatus.PUBLISHED }),
        count({ featured: true }),
      ]);

    return {
      total,
      upcoming,
      live: liveNow,
      completed,
      cancelled,
      postponed,
      draft,
      pendingReview: review,
      published,
      featured,
    };
  }

  async founderOverview() {
    const count = (where: Prisma.FounderWhereInput) =>
      this.prisma.founder.count({ where: { deletedAt: null, ...where } });

    const [total, published, draft, featured, verified] = await Promise.all([
      count({}),
      count({ status: ContentStatus.PUBLISHED }),
      count({ status: ContentStatus.DRAFT }),
      count({ featured: true }),
      count({ verified: true }),
    ]);

    return { total, published, draft, featured, verified };
  }

  /* ---------------------------------------------------------- geo extras -- */

  /**
   * Continent rollup, folded up from the country breakdown rather than fetched
   * separately — one query instead of two, and the two can never disagree.
   */
  async continents(entity: ContentEntity, query: AnalyticsRangeQueryDto) {
    const geography = await this.reports.geography({ ...query, entity });

    const totals = new Map<string, number>();
    for (const row of geography.countries) {
      const continent = CONTINENTS[row.key.toUpperCase()] ?? 'Unknown';
      totals.set(continent, (totals.get(continent) ?? 0) + row.visitors);
    }

    return [...totals.entries()]
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count);
  }

  /** Screen-resolution breakdown. Captured on `page_view` events by the client. */
  async screenResolutions(entity: ContentEntity, query: AnalyticsRangeQueryDto) {
    const rows = await this.prisma.analyticsEvent.findMany({
      where: this.scope(entity, query, { screenResolution: { not: null } }),
      select: { screenResolution: true },
      take: MAX_ROWS,
    });
    return tally(rows.map(r => r.screenResolution));
  }

  /* ---------------------------------------------------------- engagement -- */

  private scope(
    entity: ContentEntity,
    query: AnalyticsRangeQueryDto,
    extra: Prisma.AnalyticsEventWhereInput = {}
  ): Prisma.AnalyticsEventWhereInput {
    const lte = query.to ?? new Date();
    const gte = query.from ?? new Date(lte.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      entity,
      timestamp: { gte, lte },
      ...(query.country ? { country: query.country } : {}),
      ...(query.region ? { region: query.region } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.deviceType ? { deviceType: query.deviceType } : {}),
      ...extra,
    };
  }

  private async engagementEvents(
    entity: ContentEntity,
    query: AnalyticsRangeQueryDto
  ): Promise<EngagementEvent[]> {
    return this.prisma.analyticsEvent.findMany({
      where: this.scope(entity, query, { type: { in: ['external_link_click', 'share'] } }),
      select: { entityId: true, meta: true, sessionId: true },
      take: MAX_ROWS,
    });
  }

  /** Reads the `action` discriminator written by the client's `trackEngagement`. */
  private actionOf(meta: Prisma.JsonValue): string | null {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
    const action = (meta as Record<string, unknown>).action;
    return typeof action === 'string' ? action : null;
  }

  /**
   * Engagement click counts — registration, website, Telegram, socials, shares.
   *
   * An empty result means no instrumented click has been recorded yet, which
   * the UI must present as "no data", not as zero interest.
   */
  async engagement(entity: ContentEntity, query: AnalyticsRangeQueryDto) {
    const events = await this.engagementEvents(entity, query);
    const shares = events.filter(e => this.actionOf(e.meta) === null).length;

    return {
      available: events.length > 0,
      actions: tally(events.map(e => this.actionOf(e.meta))),
      shares,
    };
  }

  /* --------------------------------------------------------- performance -- */

  /**
   * Per-item performance: views, engaged clicks, and click-through rate.
   *
   * CTR is clicks over views. Items with no views report a `null` rate rather
   * than dividing by zero.
   */
  async performance(entity: ContentEntity, query: AnalyticsRangeQueryDto) {
    const lte = query.to ?? new Date();
    const gte = query.from ?? new Date(lte.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day = new Date(Date.UTC(gte.getUTCFullYear(), gte.getUTCMonth(), gte.getUTCDate()));

    const [views, events] = await Promise.all([
      this.prisma.viewCount.groupBy({
        by: ['entityId'],
        where: { entity, day: { gte: day, lte } },
        _sum: { count: true },
      }),
      this.engagementEvents(entity, query),
    ]);

    const records = await this.resolve(entity, [
      ...new Set([...views.map(v => v.entityId), ...events.map(e => e.entityId ?? '')]),
    ]);

    const clicksById = new Map<string, Map<string, number>>();
    for (const event of events) {
      if (!event.entityId) continue;
      const action = this.actionOf(event.meta) ?? 'share';
      const bucket = clicksById.get(event.entityId) ?? new Map<string, number>();
      bucket.set(action, (bucket.get(action) ?? 0) + 1);
      clicksById.set(event.entityId, bucket);
    }

    const rows = new Map<string, PerformanceRow>();
    for (const [key, record] of records) {
      // `resolve` maps both id and slug to the same record; dedupe on id.
      if (rows.has(record.id)) {
        // Fold in the alternate key's figures rather than dropping them.
        const existing = rows.get(record.id)!;
        existing.views += views.find(v => v.entityId === key)?._sum.count ?? 0;
        for (const [action, count] of clicksById.get(key) ?? []) {
          existing.clicks[action] = (existing.clicks[action] ?? 0) + count;
        }
        continue;
      }

      const clicks: Record<string, number> = {};
      for (const [action, count] of clicksById.get(key) ?? []) clicks[action] = count;

      rows.set(record.id, {
        id: record.id,
        slug: record.slug,
        title: record.title,
        group: record.group,
        views: views.find(v => v.entityId === key)?._sum.count ?? 0,
        clicks,
        totalClicks: 0,
        ctr: null,
      });
    }

    return [...rows.values()]
      .map(row => {
        const totalClicks = Object.values(row.clicks).reduce((sum, n) => sum + n, 0);
        return {
          ...row,
          totalClicks,
          ctr: row.views > 0 ? Math.round((totalClicks / row.views) * 1000) / 10 : null,
        };
      })
      .sort((a, b) => b.views - a.views);
  }

  /**
   * Resolve view/event keys (which may be an id or a slug) to real records,
   * carrying the grouping dimension each module reports on.
   */
  private async resolve(entity: ContentEntity, keys: string[]) {
    const ids = keys.filter(Boolean);
    const map = new Map<string, { id: string; slug: string; title: string; group: string | null }>();
    if (!ids.length) return map;

    if (entity === 'Event') {
      const events = await this.prisma.event.findMany({
        where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }], deletedAt: null },
        select: { id: true, slug: true, name: true, organizer: { select: { name: true } } },
      });
      for (const e of events) {
        const record = { id: e.id, slug: e.slug, title: e.name, group: e.organizer?.name ?? null };
        map.set(e.id, record);
        map.set(e.slug, record);
      }
      return map;
    }

    const founders = await this.prisma.founder.findMany({
      where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }], deletedAt: null },
      select: { id: true, slug: true, name: true, company: true },
    });
    for (const f of founders) {
      const record = { id: f.id, slug: f.slug, title: f.name, group: f.company };
      map.set(f.id, record);
      map.set(f.slug, record);
    }
    return map;
  }

  /* ----------------------------------------------------------- groupings -- */

  /**
   * Views grouped by a content dimension — organizer, category or chain for
   * events; company or industry for founders.
   *
   * Views are attributed by joining the rollup back to the record, so a
   * recategorised item's history follows it.
   */
  async grouped(
    entity: ContentEntity,
    dimension: 'organizer' | 'category' | 'chains' | 'company' | 'industry',
    query: AnalyticsRangeQueryDto
  ) {
    const lte = query.to ?? new Date();
    const gte = query.from ?? new Date(lte.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day = new Date(Date.UTC(gte.getUTCFullYear(), gte.getUTCMonth(), gte.getUTCDate()));

    const views = await this.prisma.viewCount.groupBy({
      by: ['entityId'],
      where: { entity, day: { gte: day, lte } },
      _sum: { count: true },
    });
    const viewsByKey = new Map(views.map(v => [v.entityId, v._sum.count ?? 0]));

    const buckets = new Map<string, { items: Set<string>; views: number }>();
    const add = (label: string, id: string, count: number) => {
      const bucket = buckets.get(label) ?? { items: new Set<string>(), views: 0 };
      bucket.items.add(id);
      bucket.views += count;
      buckets.set(label, bucket);
    };

    if (entity === 'Event') {
      const events = await this.prisma.event.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          slug: true,
          chains: true,
          organizer: { select: { name: true } },
          category: { select: { name: true } },
        },
      });

      for (const event of events) {
        const count = (viewsByKey.get(event.id) ?? 0) + (viewsByKey.get(event.slug) ?? 0);
        if (dimension === 'chains') {
          // A multi-value dimension: an event on two chains counts once for each.
          for (const chain of event.chains) add(chain, event.id, count);
        } else {
          const label = dimension === 'organizer' ? event.organizer?.name : event.category?.name;
          if (label) add(label, event.id, count);
        }
      }
    } else {
      const founders = await this.prisma.founder.findMany({
        where: { deletedAt: null },
        select: { id: true, slug: true, company: true, industry: true },
      });

      for (const founder of founders) {
        const count = (viewsByKey.get(founder.id) ?? 0) + (viewsByKey.get(founder.slug) ?? 0);
        const label = dimension === 'company' ? founder.company : founder.industry;
        if (label) add(label, founder.id, count);
      }
    }

    return [...buckets.entries()]
      .map(([label, bucket]) => ({
        key: label,
        label,
        items: bucket.items.size,
        views: bucket.views,
        avgViews: bucket.items.size ? Math.round(bucket.views / bucket.items.size) : 0,
      }))
      .sort((a, b) => b.views - a.views);
  }

  /* ----------------------------------------------------------------- SEO -- */

  /**
   * SEO health, limited to what is actually knowable.
   *
   * Organic visitors come from referrer data; the metadata audit is computed
   * from the records themselves. Indexed-page counts, broken links and
   * structured-data validation are *not* included — they need Search Console
   * and a crawler respectively, neither of which exists. Reporting them as
   * zero would read as "all healthy".
   */
  async seo(entity: ContentEntity, query: AnalyticsRangeQueryDto) {
    const acquisition = await this.reports.acquisition({ ...query, entity });
    const organic = acquisition.find(row => row.key === 'Organic Search');

    const missing =
      entity === 'Event'
        ? await this.prisma.event.findMany({
            where: {
              deletedAt: null,
              status: ContentStatus.PUBLISHED,
              OR: [{ seoTitle: null }, { seoDescription: null }, { noindex: true }],
            },
            select: { id: true, slug: true, name: true, seoTitle: true, seoDescription: true, noindex: true },
            take: 200,
          })
        : await this.prisma.founder.findMany({
            where: {
              deletedAt: null,
              status: ContentStatus.PUBLISHED,
              OR: [{ seoTitle: null }, { seoDescription: null }, { noindex: true }],
            },
            select: { id: true, slug: true, name: true, seoTitle: true, seoDescription: true, noindex: true },
            take: 200,
          });

    return {
      organicVisitors: organic?.visitors ?? 0,
      organicSessions: organic?.sessions ?? 0,
      missingMetadata: missing.map(record => ({
        id: record.id,
        slug: record.slug,
        title: record.name,
        issues: [
          !record.seoTitle && 'Missing SEO title',
          !record.seoDescription && 'Missing SEO description',
          record.noindex && 'Excluded from indexing (noindex)',
        ].filter((issue): issue is string => typeof issue === 'string'),
      })),
      /** Explicitly unavailable, so the UI can say so rather than show zero. */
      unavailable: ['indexedPages', 'brokenLinks', 'structuredDataHealth'],
    };
  }
}

interface PerformanceRow {
  id: string;
  slug: string;
  title: string;
  group: string | null;
  views: number;
  clicks: Record<string, number>;
  totalClicks: number;
  ctr: number | null;
}
