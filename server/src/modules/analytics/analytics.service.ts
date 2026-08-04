import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import type { TrackedEntity } from './dto/analytics.dto';
import { TRACKED_ENTITIES } from './dto/analytics.dto';

const MAX_ROWS = 20000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function innerRange(from?: Date, to?: Date): { gte: Date; lte: Date } {
  const end = to ?? new Date();
  const start = from ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { gte: start, lte: end };
}

function delta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

const DELEGATE: Record<TrackedEntity, string> = {
  Article: 'article',
  Project: 'project',
  Research: 'research',
  Regulation: 'regulation',
  Event: 'event',
  Founder: 'founder',
};

/**
 * Analytics: collection + aggregation.
 *
 * Data sources (all real):
 *  - `AnalyticsEvent`: row-per-interaction events from the public tracking
 *    endpoint. Sessions/visitors/geo/devices/referrers are reconstructed from
 *    these; never invented.
 *  - `ViewCount` + `SearchQuery`: the pre-existing daily rollup + search log.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------------------- collection -- */

  async track(dto: { events: Array<Record<string, unknown>> }): Promise<void> {
    const list = (dto.events ?? []).slice(0, 50);
    if (!list.length) return;

    const rows = list
      .filter(e => typeof e.type === 'string' && typeof e.sessionId === 'string')
      .map(e => ({
        type: String(e.type),
        sessionId: String(e.sessionId),
        visitorId: e.visitorId ? String(e.visitorId) : null,
        path: e.path ? String(e.path) : null,
        referrer: e.referrer ? String(e.referrer) : null,
        country: e.country ? String(e.country) : null,
        region: e.region ? String(e.region) : null,
        city: e.city ? String(e.city) : null,
        deviceType: e.deviceType ? String(e.deviceType) : null,
        browser: e.browser ? String(e.browser) : null,
        os: e.os ? String(e.os) : null,
        screenResolution: e.screenResolution ? String(e.screenResolution) : null,
        language: e.language ? String(e.language) : null,
        entity: e.entity ? String(e.entity) : null,
        entityId: e.entityId ? String(e.entityId) : null,
        categoryId: e.categoryId ? String(e.categoryId) : null,
        authorId: e.authorId ? String(e.authorId) : null,
        scrollDepth: typeof e.scrollDepth === 'number' ? e.scrollDepth : null,
        meta: (e.meta as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        timestamp: e.timestamp ? new Date(String(e.timestamp)) : new Date(),
      }));

    if (!rows.length) return;
    await this.prisma.analyticsEvent.createMany({ data: rows, skipDuplicates: true });
  }

  /* ------------------------------------------------------------- overview -- */

  async overview(query: Record<string, unknown>) {
    const span = innerRange(query.from as Date, query.to as Date);
    const duration = span.lte.getTime() - span.gte.getTime();
    const previous = { gte: new Date(span.gte.getTime() - duration), lte: span.gte };
    const dims = this.dims(query);

    const [cur, prev] = await Promise.all([
      this.aggregateOverview({ ...dims, timestamp: { gte: span.gte, lte: span.lte } }),
      this.aggregateOverview({ ...dims, timestamp: { gte: previous.gte, lte: previous.lte } }),
    ]);

    return {
      from: span.gte,
      to: span.lte,
      current: cur,
      previous: prev,
      deltas: {
        visitors: delta(cur.visitors, prev.visitors),
        uniqueVisitors: delta(cur.uniqueVisitors, prev.uniqueVisitors),
        sessions: delta(cur.sessions, prev.sessions),
        pageViews: delta(cur.pageViews, prev.pageViews),
        articleViews: delta(cur.articleViews, prev.articleViews),
        avgSessionDuration: delta(cur.avgSessionDuration, prev.avgSessionDuration),
        bounceRate: delta(cur.bounceRate, prev.bounceRate),
        engagementRate: delta(cur.engagementRate, prev.engagementRate),
      },
    };
  }

  private dims(query: Record<string, unknown>): Prisma.AnalyticsEventWhereInput {
    return {
      ...(query.entity ? { entity: String(query.entity) } : {}),
      ...(query.country ? { country: String(query.country) } : {}),
      ...(query.region ? { region: String(query.region) } : {}),
      ...(query.city ? { city: String(query.city) } : {}),
      ...(query.deviceType ? { deviceType: String(query.deviceType) } : {}),
      ...(query.browser ? { browser: String(query.browser) } : {}),
      ...(query.os ? { os: String(query.os) } : {}),
      ...(query.language ? { language: String(query.language) } : {}),
      ...(query.authorId ? { authorId: String(query.authorId) } : {}),
      ...(query.categoryId ? { categoryId: String(query.categoryId) } : {}),
    };
  }

  private async aggregateOverview(where: Prisma.AnalyticsEventWhereInput) {
    const [eventRows, pageViews, articleViews, engagedSessions, shares] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        select: { sessionId: true, type: true, timestamp: true, visitorId: true },
        orderBy: { timestamp: 'asc' },
        take: MAX_ROWS,
      }),
      this.prisma.analyticsEvent.count({ where: { ...where, type: 'page_view' } }),
      this.prisma.analyticsEvent.count({ where: { ...where, type: 'article_view' } }),
      this.prisma.analyticsEvent.count({ where: { ...where, type: 'article_scroll', scrollDepth: { gte: 25 } } }),
      this.prisma.analyticsEvent.count({ where: { ...where, type: 'share' } }),
    ]);

    const visitorSet = new Set<string>();
    const sessionSet = new Set<string>();
    const bySession = new Map<string, { first: number; last: number; pageViews: number }>();
    for (const ev of eventRows) {
      sessionSet.add(ev.sessionId);
      if (ev.visitorId) visitorSet.add(ev.visitorId);
      const t = ev.timestamp.getTime();
      const cur = bySession.get(ev.sessionId) ?? { first: t, last: t, pageViews: 0 };
      cur.first = Math.min(cur.first, t);
      cur.last = Math.max(cur.last, t);
      if (ev.type === 'page_view') cur.pageViews += 1;
      bySession.set(ev.sessionId, cur);
    }

    const sessions = sessionSet.size;
    const sessionsList = [...bySession.values()];
    const totalDuration = sessionsList.reduce((sum, s) => sum + (s.last - s.first), 0);
    const avgSessionDuration = sessionsList.length
      ? Math.round(totalDuration / sessionsList.length / 1000)
      : 0;
    const multiPage = sessionsList.filter(s => s.pageViews > 1).length;
    const bounced = sessionsList.filter(s => s.pageViews <= 1).length;

    return {
      visitors: sessions,
      uniqueVisitors: visitorSet.size,
      sessions,
      pageViews,
      articleViews,
      shares,
      avgSessionDuration,
      bounceRate: sessions === 0 ? 0 : Math.round((bounced / sessions) * 1000) / 10,
      engagementRate: sessions === 0 ? 0 : Math.round(((engagedSessions + multiPage) / sessions) * 1000) / 10,
    };
  }

  /* ------------------------------------------------------------- traffic -- */

  async traffic(query: Record<string, unknown>) {
    const { gte, lte } = innerRange(query.from as Date, query.to as Date);
    const granularity = this.pickGranularity(gte, lte);
    const where: Prisma.AnalyticsEventWhereInput = { timestamp: { gte, lte }, ...this.dims(query) };

    const rows = await this.prisma.analyticsEvent.findMany({
      where,
      select: { timestamp: true, type: true, sessionId: true },
      take: MAX_ROWS,
    });

    const buckets = new Map<
      string,
      { label: string; visitors: Set<string>; sessions: Set<string>; pageViews: number; articleViews: number }
    >();
    for (const ev of rows) {
      const key = this.bucketKey(ev.timestamp, granularity);
      const b = buckets.get(key) ?? {
        label: this.bucketLabel(ev.timestamp, granularity, key),
        visitors: new Set<string>(),
        sessions: new Set<string>(),
        pageViews: 0,
        articleViews: 0,
      };
      b.sessions.add(ev.sessionId);
      if (ev.type === 'page_view') {
        b.visitors.add(ev.sessionId);
        b.pageViews += 1;
      }
      if (ev.type === 'article_view') b.articleViews += 1;
      buckets.set(key, b);
    }

    return {
      granularity,
      points: [...buckets.values()]
        .sort((a, b) => (a.label < b.label ? -1 : 1))
        .map(b => ({
          label: b.label,
          visitors: b.visitors.size,
          sessions: b.sessions.size,
          pageViews: b.pageViews,
          articleViews: b.articleViews,
        })),
    };
  }

  private pickGranularity(from: Date, to: Date): 'hourly' | 'daily' | 'weekly' | 'monthly' {
    const days = (to.getTime() - from.getTime()) / 86400000;
    if (days <= 2) return 'hourly';
    if (days <= 60) return 'daily';
    if (days <= 365) return 'weekly';
    return 'monthly';
  }

  private bucketKey(d: Date, g: string): string {
    if (g === 'hourly') return d.toISOString().slice(0, 13);
    if (g === 'daily') return d.toISOString().slice(0, 10);
    if (g === 'weekly') {
      const start = d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000;
      return `w${new Date(start).toISOString().slice(0, 10)}`;
    }
    return d.toISOString().slice(0, 7);
  }

  private bucketLabel(d: Date, g: string, key: string): string {
    if (g === 'hourly') {
      const h = new Date(`${key}:00:00Z`);
      return h.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
    }
    if (g === 'daily') {
      const dt = new Date(`${key}T00:00:00Z`);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (g === 'weekly') {
      const dt = new Date(`${key.slice(1)}T00:00:00Z`);
      return `Wk of ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    const dt = new Date(`${key}-01T00:00:00Z`);
    return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /* ------------------------------------------------------------ realtime -- */

  async realtime() {
    const now = Date.now();
    const [activeNow, windows, activePagesRows] = await Promise.all([
      this.distinctSessionCount({ timestamp: { gte: new Date(now - 5 * 60 * 1000) } }),
      Promise.all(
        [5, 15, 30].map(minutes =>
          this.distinctSessionCount({ timestamp: { gte: new Date(now - minutes * 60 * 1000) } }).then(
            users => ({ minutes, users })
          )
        )
      ),
      this.prisma.analyticsEvent.findMany({
        where: { timestamp: { gte: new Date(now - 30 * 60 * 1000) }, type: 'page_view', path: { not: null } },
        select: { path: true, sessionId: true },
        orderBy: { timestamp: 'desc' },
        take: 1000,
      }),
    ]);

    const pageMap = new Map<string, Set<string>>();
    for (const ev of activePagesRows) {
      if (!ev.path) continue;
      const set = pageMap.get(ev.path) ?? new Set<string>();
      set.add(ev.sessionId);
      pageMap.set(ev.path, set);
    }

    return {
      activeNow,
      windows,
      activePages: [...pageMap.entries()]
        .map(([path, s]) => ({ path, viewers: s.size }))
        .sort((a, b) => b.viewers - a.viewers)
        .slice(0, 12),
    };
  }

  private async distinctSessionCount(where: Prisma.AnalyticsEventWhereInput): Promise<number> {
    const rows = await this.prisma.analyticsEvent.findMany({
      where,
      select: { sessionId: true },
      distinct: ['sessionId'],
    });
    return rows.length;
  }

  private delegateOf(entity: TrackedEntity): string {
    return DELEGATE[entity];
  }
}