import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  AnalyticsRangeQueryDto,
  ArticleAnalyticsQueryDto,
  TopContentQueryDto,
} from './dto/analytics.dto';

/**
 * Detailed analytics reports, powering `/admin/analytics`.
 *
 * Split from `AnalyticsService` — which owns collection plus the summary the
 * admin dashboard already uses — so that the working dashboard endpoints are
 * not disturbed by changes here.
 *
 * Every figure is derived from `AnalyticsEvent`, `ViewCount` or `SearchQuery`.
 * A dimension the collection layer does not populate returns an empty array,
 * never a placeholder: the UI is responsible for saying "tracking not
 * available" rather than this service inventing a plausible number.
 */

/** Upper bound on rows pulled into memory for any one aggregation. */
const MAX_ROWS = 50000;

/** A session counts as engaged at or beyond this scroll depth. */
const ENGAGED_SCROLL_DEPTH = 25;

/** Reading-depth milestones reported by the client. */
export const DEPTH_MILESTONES = [25, 50, 75, 90, 100] as const;

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

/** One event row, in the shape every aggregation below consumes. */
interface EventRow {
  sessionId: string;
  visitorId: string | null;
  type: string;
  timestamp: Date;
  scrollDepth: number | null;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function round(value: number, places = 1): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Country codes are stored; names are resolved for display only. */
const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

function countryLabel(code: string): string {
  try {
    return COUNTRY_NAMES.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const LANGUAGE_NAMES = new Intl.DisplayNames(['en'], { type: 'language' });

function languageLabel(tag: string): string {
  try {
    return LANGUAGE_NAMES.of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/* ------------------------------------------------------------ acquisition -- */

/** Referrer host → marketing channel. Order matters; first match wins. */
const CHANNEL_RULES: Array<{ channel: string; test: RegExp }> = [
  { channel: 'Organic Search', test: /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./i },
  {
    channel: 'Social',
    test: /(^|\.)(x|twitter|t|facebook|fb|instagram|linkedin|reddit|telegram|youtube|tiktok|threads|mastodon|discord)\.(com|co|me|org|net|social)/i,
  },
  { channel: 'Newsletter', test: /(^|\.)(mailchimp|substack|beehiiv|convertkit|sendgrid|campaign-archive)\./i },
];

/** Social platform display names, for the dedicated social report. */
const SOCIAL_PLATFORMS: Array<{ name: string; test: RegExp }> = [
  { name: 'X / Twitter', test: /(^|\.)(x|twitter|t)\.co(m)?$/i },
  { name: 'Facebook', test: /(^|\.)(facebook|fb)\./i },
  { name: 'LinkedIn', test: /(^|\.)linkedin\./i },
  { name: 'Reddit', test: /(^|\.)reddit\./i },
  { name: 'Telegram', test: /(^|\.)(telegram|t)\.(org|me)$/i },
  { name: 'YouTube', test: /(^|\.)youtube\.|(^|\.)youtu\.be$/i },
  { name: 'Instagram', test: /(^|\.)instagram\./i },
  { name: 'TikTok', test: /(^|\.)tiktok\./i },
];

/** Hostname of a referrer, or null when it is absent or unparseable. */
function refHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function channelOf(referrer: string | null, selfHosts: string[]): string {
  const host = refHost(referrer);
  if (!host) return 'Direct';
  if (selfHosts.some(self => host === self || host.endsWith(`.${self}`))) return 'Direct';
  return CHANNEL_RULES.find(r => r.test.test(host))?.channel ?? 'Referral';
}

@Injectable()
export class AnalyticsReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------- scoping -- */

  private range(query: AnalyticsRangeQueryDto): { gte: Date; lte: Date } {
    const lte = query.to ?? new Date();
    const gte = query.from ?? new Date(lte.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { gte, lte };
  }

  /**
   * The `where` every report shares: the date range plus whichever global
   * filters the admin has applied. Undefined filters are omitted entirely so
   * they never narrow the query.
   */
  private scope(query: AnalyticsRangeQueryDto): Prisma.AnalyticsEventWhereInput {
    const { gte, lte } = this.range(query);
    return {
      timestamp: { gte, lte },
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.country ? { country: query.country } : {}),
      ...(query.region ? { region: query.region } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.deviceType ? { deviceType: query.deviceType } : {}),
      ...(query.browser ? { browser: query.browser } : {}),
      ...(query.os ? { os: query.os } : {}),
      ...(query.language ? { language: query.language } : {}),
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
  }

  /* ---------------------------------------------------------- aggregation -- */

  /**
   * Collapse raw events into session-level metrics.
   *
   * Duration is last-event minus first-event within a session, which is the
   * standard approximation — the true dwell time of the final page is not
   * observable without an unload beacon.
   */
  private summarise(rows: EventRow[]): Omit<DimensionRow, 'key' | 'label'> {
    const visitors = new Set<string>();
    const sessions = new Map<
      string,
      { first: number; last: number; pageViews: number; engaged: boolean }
    >();
    let pageViews = 0;
    let articleViews = 0;

    for (const row of rows) {
      if (row.visitorId) visitors.add(row.visitorId);
      const t = row.timestamp.getTime();
      const session = sessions.get(row.sessionId) ?? {
        first: t,
        last: t,
        pageViews: 0,
        engaged: false,
      };
      session.first = Math.min(session.first, t);
      session.last = Math.max(session.last, t);

      if (row.type === 'page_view') {
        session.pageViews += 1;
        pageViews += 1;
      }
      if (row.type === 'article_view') articleViews += 1;
      if (
        row.type === 'article_complete' ||
        (row.type === 'article_scroll' && (row.scrollDepth ?? 0) >= ENGAGED_SCROLL_DEPTH)
      ) {
        session.engaged = true;
      }
      sessions.set(row.sessionId, session);
    }

    const list = [...sessions.values()];
    const engaged = list.filter(s => s.engaged || s.pageViews > 1).length;
    const totalDuration = list.reduce((sum, s) => sum + (s.last - s.first), 0);

    return {
      // A visitorId is only present once the client has stored one, so the
      // session count is the reliable visitor floor.
      visitors: visitors.size || list.length,
      sessions: list.length,
      pageViews,
      articleViews,
      engagementRate: list.length ? round((engaged / list.length) * 100) : 0,
      avgSessionDuration: list.length ? Math.round(totalDuration / list.length / 1000) : 0,
    };
  }

  /**
   * Generic breakdown over any single stored dimension (country, browser, …).
   *
   * Rows where the dimension is NULL are dropped rather than bucketed as
   * "Unknown": a NULL means the collection layer never captured that field,
   * and showing it as a category would misrepresent absent data as a finding.
   */
  private async breakdown(
    query: AnalyticsRangeQueryDto,
    field: 'country' | 'region' | 'city' | 'deviceType' | 'browser' | 'os' | 'language',
    options: { label?: (key: string) => string; limit?: number } = {}
  ): Promise<DimensionRow[]> {
    const rows = await this.prisma.analyticsEvent.findMany({
      where: { ...this.scope(query), [field]: { not: null } },
      select: {
        [field]: true,
        sessionId: true,
        visitorId: true,
        type: true,
        timestamp: true,
        scrollDepth: true,
      } as Prisma.AnalyticsEventSelect,
      take: MAX_ROWS,
    });

    const grouped = new Map<string, EventRow[]>();
    for (const row of rows as unknown as Array<EventRow & Record<string, string | null>>) {
      const key = row[field];
      if (!key) continue;
      const bucket = grouped.get(key) ?? [];
      bucket.push(row);
      grouped.set(key, bucket);
    }

    const label = options.label ?? ((k: string) => k);
    return [...grouped.entries()]
      .map(([key, group]) => ({ key, label: label(key), ...this.summarise(group) }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, options.limit ?? 100);
  }

  /* ----------------------------------------------------------- geography -- */

  /**
   * Countries, regions and cities in one call.
   *
   * Deliberately one endpoint rather than three: the geography panel always
   * renders all three levels together, and the drill-down filters client-side
   * from data already loaded.
   */
  async geography(query: AnalyticsRangeQueryDto) {
    const [countries, regions, cities] = await Promise.all([
      this.breakdown(query, 'country', { label: countryLabel }),
      this.breakdown(query, 'region'),
      this.breakdown(query, 'city'),
    ]);

    return {
      countries,
      regions,
      cities,
      /**
       * Lets the UI distinguish "nobody visited" from "geography was never
       * captured" — the two need very different empty states.
       */
      available: countries.length > 0,
    };
  }

  /* ------------------------------------------------------------- audience -- */

  async devices(query: AnalyticsRangeQueryDto) {
    return this.breakdown(query, 'deviceType');
  }

  async browsers(query: AnalyticsRangeQueryDto) {
    return this.breakdown(query, 'browser');
  }

  async operatingSystems(query: AnalyticsRangeQueryDto) {
    return this.breakdown(query, 'os');
  }

  async languages(query: AnalyticsRangeQueryDto) {
    return this.breakdown(query, 'language', { label: languageLabel });
  }

  /**
   * New vs returning.
   *
   * A visitor is "returning" when their first ever event predates the start of
   * the selected range — which is why this looks outside the range rather than
   * classifying from in-range data alone.
   */
  async audience(query: AnalyticsRangeQueryDto) {
    const { gte, lte } = this.range(query);

    const inRange = await this.prisma.analyticsEvent.findMany({
      where: { ...this.scope(query), visitorId: { not: null } },
      select: { visitorId: true, sessionId: true, timestamp: true },
      take: MAX_ROWS,
    });

    const visitorIds = [...new Set(inRange.map(r => r.visitorId).filter((v): v is string => !!v))];
    if (!visitorIds.length) {
      return { available: false, new: 0, returning: 0, newRate: 0, returningRate: 0, trend: [] };
    }

    // One grouped query rather than N lookups: the earliest event per visitor.
    const firstSeen = await this.prisma.analyticsEvent.groupBy({
      by: ['visitorId'],
      where: { visitorId: { in: visitorIds } },
      _min: { timestamp: true },
    });

    const returningIds = new Set(
      firstSeen
        .filter(f => f._min.timestamp !== null && f._min.timestamp < gte)
        .map(f => f.visitorId)
        .filter((v): v is string => !!v)
    );

    const byDay = new Map<string, { new: Set<string>; returning: Set<string> }>();
    for (const row of inRange) {
      if (!row.visitorId) continue;
      const day = row.timestamp.toISOString().slice(0, 10);
      const bucket = byDay.get(day) ?? { new: new Set<string>(), returning: new Set<string>() };
      (returningIds.has(row.visitorId) ? bucket.returning : bucket.new).add(row.visitorId);
      byDay.set(day, bucket);
    }

    const returning = visitorIds.filter(id => returningIds.has(id)).length;
    const fresh = visitorIds.length - returning;
    const total = visitorIds.length;

    return {
      available: true,
      from: gte,
      to: lte,
      new: fresh,
      returning,
      newRate: round((fresh / total) * 100),
      returningRate: round((returning / total) * 100),
      trend: [...byDay.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, b]) => ({ date, new: b.new.size, returning: b.returning.size })),
    };
  }

  /* --------------------------------------------------------- acquisition -- */

  /** Hostnames that are *us*, so self-referrals are not counted as Referral traffic. */
  private async selfHosts(): Promise<string[]> {
    const setting = await this.prisma.setting
      .findFirst({ where: { key: 'site.url' }, select: { value: true } })
      .catch(() => null);

    const configured = typeof setting?.value === 'string' ? refHost(setting.value) : null;
    return [configured, refHost(process.env.SITE_URL ?? ''), 'localhost'].filter(
      (h): h is string => !!h
    );
  }

  private async referrerRows(query: AnalyticsRangeQueryDto) {
    return this.prisma.analyticsEvent.findMany({
      where: this.scope(query),
      select: {
        referrer: true,
        sessionId: true,
        visitorId: true,
        type: true,
        timestamp: true,
        scrollDepth: true,
      },
      take: MAX_ROWS,
    });
  }

  /** Traffic grouped into marketing channels (Direct, Organic Search, Social, …). */
  async acquisition(query: AnalyticsRangeQueryDto) {
    const [rows, selfHosts] = await Promise.all([this.referrerRows(query), this.selfHosts()]);

    const grouped = new Map<string, EventRow[]>();
    for (const row of rows) {
      const channel = channelOf(row.referrer, selfHosts);
      const bucket = grouped.get(channel) ?? [];
      bucket.push(row);
      grouped.set(channel, bucket);
    }

    return [...grouped.entries()]
      .map(([key, group]) => ({ key, label: key, ...this.summarise(group) }))
      .sort((a, b) => b.visitors - a.visitors);
  }

  /** Individual referring domains. Self-referrals and direct traffic excluded. */
  async referrers(query: AnalyticsRangeQueryDto) {
    const [rows, selfHosts] = await Promise.all([this.referrerRows(query), this.selfHosts()]);

    const grouped = new Map<string, EventRow[]>();
    for (const row of rows) {
      const host = refHost(row.referrer);
      if (!host || selfHosts.some(self => host === self || host.endsWith(`.${self}`))) continue;
      const bucket = grouped.get(host) ?? [];
      bucket.push(row);
      grouped.set(host, bucket);
    }

    return [...grouped.entries()]
      .map(([key, group]) => ({ key, label: key, ...this.summarise(group) }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 100);
  }

  /** Referrers narrowed to known social platforms and labelled with the platform name. */
  async social(query: AnalyticsRangeQueryDto) {
    const rows = await this.referrerRows(query);

    const grouped = new Map<string, EventRow[]>();
    for (const row of rows) {
      const host = refHost(row.referrer);
      if (!host) continue;
      const platform = SOCIAL_PLATFORMS.find(p => p.test.test(host))?.name;
      if (!platform) continue;
      const bucket = grouped.get(platform) ?? [];
      bucket.push(row);
      grouped.set(platform, bucket);
    }

    return [...grouped.entries()]
      .map(([key, group]) => ({ key, label: key, ...this.summarise(group) }))
      .sort((a, b) => b.visitors - a.visitors);
  }

  /* -------------------------------------------------------------- content -- */

  /**
   * Article view events are keyed by whatever the page had to hand — the slug
   * on public article pages, the id elsewhere. Both are resolved here so an
   * article is never split across two rows.
   */
  private async resolveArticles(keys: string[]) {
    if (!keys.length) return new Map<string, ResolvedArticle>();

    const articles = await this.prisma.article.findMany({
      where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }], deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
        readMinutes: true,
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    });

    const byKey = new Map<string, ResolvedArticle>();
    for (const article of articles) {
      byKey.set(article.id, article);
      byKey.set(article.slug, article);
    }
    return byKey;
  }

  /** Per-article event rows in range, bucketed by the article they belong to. */
  private async articleEventGroups(query: AnalyticsRangeQueryDto) {
    const rows = await this.prisma.analyticsEvent.findMany({
      where: { ...this.scope(query), entityId: { not: null }, entity: 'Article' },
      select: {
        entityId: true,
        sessionId: true,
        visitorId: true,
        type: true,
        timestamp: true,
        scrollDepth: true,
      },
      take: MAX_ROWS,
    });

    const grouped = new Map<string, EventRow[]>();
    for (const row of rows) {
      if (!row.entityId) continue;
      const bucket = grouped.get(row.entityId) ?? [];
      bucket.push(row);
      grouped.set(row.entityId, bucket);
    }
    return grouped;
  }

  /**
   * Article performance table.
   *
   * Views come from the `ViewCount` rollup (authoritative and complete);
   * reader/engagement metrics come from events, which only exist for the
   * period since event tracking was deployed. An article can therefore show
   * views with zero unique readers, which is accurate rather than a bug.
   */
  async articles(query: ArticleAnalyticsQueryDto) {
    const { gte, lte } = this.range(query);
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [viewRows, eventGroups] = await Promise.all([
      this.prisma.viewCount.groupBy({
        by: ['entityId'],
        where: { entity: 'Article', day: { gte: startOfUtcDay(gte), lte } },
        _sum: { count: true },
      }),
      this.articleEventGroups(query),
    ]);

    const keys = [...new Set([...viewRows.map(v => v.entityId), ...eventGroups.keys()])];
    const resolved = await this.resolveArticles(keys);

    // Merge the two sources onto one row per real article.
    const merged = new Map<string, ArticleRow>();
    for (const key of keys) {
      const article = resolved.get(key);
      if (!article) continue;
      if (query.categoryId && article.category?.id !== query.categoryId) continue;
      if (query.authorId && article.author?.id !== query.authorId) continue;

      const existing = merged.get(article.id) ?? this.emptyArticleRow(article);
      existing.views += viewRows.find(v => v.entityId === key)?._sum.count ?? 0;

      const events = eventGroups.get(key);
      if (events) {
        const summary = this.summarise(events);
        existing.uniqueReaders += summary.visitors;
        existing.engagementRate = summary.engagementRate;
        existing.avgReadTime = summary.avgSessionDuration;
        existing.shares += events.filter(e => e.type === 'share').length;
        existing.bookmarks += events.filter(e => e.type === 'bookmark').length;
        existing.comments += events.filter(e => e.type === 'comment').length;
        existing.completions += events.filter(e => e.type === 'article_complete').length;
      }
      merged.set(article.id, existing);
    }

    let items = [...merged.values()];

    if (query.search) {
      const needle = query.search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(needle));
    }

    const sortKey = (query.sortBy ?? 'views') as keyof ArticleRow;
    const direction = query.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
      return String(left ?? '').localeCompare(String(right ?? '')) * direction;
    });

    const total = items.length;
    return {
      items: items.slice((page - 1) * perPage, page * perPage),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        hasNext: page * perPage < total,
        hasPrevious: page > 1,
      },
    };
  }

  private emptyArticleRow(article: ResolvedArticle): ArticleRow {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category?.name ?? null,
      categoryId: article.category?.id ?? null,
      author: article.author?.name ?? null,
      authorId: article.author?.id ?? null,
      publishedAt: article.publishedAt,
      readMinutes: article.readMinutes,
      views: 0,
      uniqueReaders: 0,
      avgReadTime: 0,
      engagementRate: 0,
      shares: 0,
      bookmarks: 0,
      comments: 0,
      completions: 0,
    };
  }

  /** Everything the single-article analytics view needs, in one round trip. */
  async articleDetail(articleId: string, query: AnalyticsRangeQueryDto) {
    const { gte, lte } = this.range(query);

    const article = await this.prisma.article.findFirst({
      where: { OR: [{ id: articleId }, { slug: articleId }], deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
        readMinutes: true,
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    });
    if (!article) return null;

    // Events may be keyed by either identifier, so match on both.
    const identifiers = [article.id, article.slug];
    const eventWhere: Prisma.AnalyticsEventWhereInput = {
      entityId: { in: identifiers },
      timestamp: { gte, lte },
    };

    const [events, viewRows] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where: eventWhere,
        select: {
          sessionId: true,
          visitorId: true,
          type: true,
          timestamp: true,
          scrollDepth: true,
          referrer: true,
          country: true,
          deviceType: true,
        },
        take: MAX_ROWS,
      }),
      this.prisma.viewCount.findMany({
        where: { entity: 'Article', entityId: { in: identifiers }, day: { gte: startOfUtcDay(gte), lte } },
        select: { day: true, count: true },
        orderBy: { day: 'asc' },
      }),
    ]);

    const summary = this.summarise(events);
    const selfHosts = await this.selfHosts();

    const byDay = new Map<string, number>();
    for (const row of viewRows) {
      const key = row.day.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + row.count);
    }

    const tally = <T>(list: T[], keyOf: (item: T) => string | null) => {
      const map = new Map<string, number>();
      for (const item of list) {
        const key = keyOf(item);
        if (!key) continue;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
      return [...map.entries()]
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        publishedAt: article.publishedAt,
        readMinutes: article.readMinutes,
        category: article.category?.name ?? null,
        author: article.author?.name ?? null,
      },
      totals: {
        views: viewRows.reduce((sum, r) => sum + r.count, 0),
        uniqueReaders: summary.visitors,
        avgReadTime: summary.avgSessionDuration,
        engagementRate: summary.engagementRate,
        shares: events.filter(e => e.type === 'share').length,
        bookmarks: events.filter(e => e.type === 'bookmark').length,
        comments: events.filter(e => e.type === 'comment').length,
        completions: events.filter(e => e.type === 'article_complete').length,
      },
      viewsOverTime: [...byDay.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, views]) => ({ date, views })),
      readingDepth: this.depthFrom(events),
      trafficSources: tally(events, e => {
        const host = refHost(e.referrer);
        if (!host) return 'Direct';
        return selfHosts.some(s => host === s || host.endsWith(`.${s}`)) ? 'Direct' : host;
      }),
      geography: tally(events, e => (e.country ? countryLabel(e.country) : null)),
      devices: tally(events, e => e.deviceType),
    };
  }

  /**
   * Reading-depth funnel.
   *
   * Each milestone counts *distinct sessions* that reached at least that
   * depth, so the funnel is monotonically non-increasing the way a funnel
   * must be — counting raw events would let 50% exceed 25%.
   */
  private depthFrom(events: Array<{ sessionId: string; type: string; scrollDepth: number | null }>) {
    const readers = new Set(
      events.filter(e => e.type === 'article_view' || e.type === 'page_view').map(e => e.sessionId)
    );
    const depthEvents = events.filter(e => e.type === 'article_scroll' && e.scrollDepth !== null);
    const completions = new Set(
      events.filter(e => e.type === 'article_complete').map(e => e.sessionId)
    );

    if (!depthEvents.length && !completions.size) {
      return { available: false, base: readers.size, milestones: [] };
    }

    const base = readers.size || new Set(depthEvents.map(e => e.sessionId)).size;

    return {
      available: true,
      base,
      milestones: DEPTH_MILESTONES.map(depth => {
        const reached = new Set(
          depthEvents.filter(e => (e.scrollDepth ?? 0) >= depth).map(e => e.sessionId)
        );
        if (depth === 100) for (const s of completions) reached.add(s);
        return {
          depth,
          sessions: reached.size,
          rate: base ? round((reached.size / base) * 100) : 0,
        };
      }),
    };
  }

  /** Site-wide reading depth, across every article in range. */
  async readingDepth(query: AnalyticsRangeQueryDto) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { ...this.scope(query) },
      select: { sessionId: true, type: true, scrollDepth: true },
      take: MAX_ROWS,
    });
    return this.depthFrom(events);
  }

  /* ------------------------------------------------- categories & authors -- */

  /**
   * Category and author performance.
   *
   * Attribution is by joining view rows to the article, not by reading the
   * event's own `categoryId`/`authorId` — that keeps the numbers correct for
   * events recorded before those columns were populated, and stays right when
   * an article is later recategorised.
   */
  private async contentGroupedBy(dimension: 'category' | 'author', query: AnalyticsRangeQueryDto) {
    const { gte, lte } = this.range(query);

    const [viewRows, eventGroups] = await Promise.all([
      this.prisma.viewCount.groupBy({
        by: ['entityId'],
        where: { entity: 'Article', day: { gte: startOfUtcDay(gte), lte } },
        _sum: { count: true },
      }),
      this.articleEventGroups(query),
    ]);

    const keys = [...new Set([...viewRows.map(v => v.entityId), ...eventGroups.keys()])];
    const resolved = await this.resolveArticles(keys);

    const buckets = new Map<
      string,
      { id: string; label: string; views: number; articles: Set<string>; events: EventRow[] }
    >();

    for (const key of keys) {
      const article = resolved.get(key);
      if (!article) continue;
      const target = dimension === 'category' ? article.category : article.author;
      if (!target) continue;

      const bucket = buckets.get(target.id) ?? {
        id: target.id,
        label: target.name,
        views: 0,
        articles: new Set<string>(),
        events: [],
      };
      bucket.views += viewRows.find(v => v.entityId === key)?._sum.count ?? 0;
      bucket.articles.add(article.id);
      bucket.events.push(...(eventGroups.get(key) ?? []));
      buckets.set(target.id, bucket);
    }

    return [...buckets.values()]
      .map(b => {
        const summary = this.summarise(b.events);
        return {
          id: b.id,
          label: b.label,
          articles: b.articles.size,
          views: b.views,
          uniqueReaders: b.events.length ? summary.visitors : 0,
          avgReadTime: summary.avgSessionDuration,
          engagementRate: summary.engagementRate,
        };
      })
      .sort((a, b) => b.views - a.views);
  }

  async categories(query: AnalyticsRangeQueryDto) {
    return this.contentGroupedBy('category', query);
  }

  /** Author performance, each row carrying that author's single best article. */
  async authors(query: AnalyticsRangeQueryDto) {
    const [rows, articles] = await Promise.all([
      this.contentGroupedBy('author', query),
      this.articles({ ...query, perPage: 100, page: 1 } as ArticleAnalyticsQueryDto),
    ]);

    return rows.map(row => {
      const best = articles.items
        .filter(a => a.authorId === row.id)
        .sort((a, b) => b.views - a.views)[0];
      return {
        ...row,
        topArticle: best ? { id: best.id, title: best.title, views: best.views } : null,
      };
    });
  }

  /* ------------------------------------------------------------- trending -- */

  /**
   * Articles growing fastest right now.
   *
   * Growth compares the trailing 24h against the 24h before it, so a piece
   * with steady traffic scores zero and a genuine spike surfaces. Articles
   * with no prior views report `null` growth rather than an infinite one.
   */
  async trending(query: TopContentQueryDto) {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const rows = await this.prisma.analyticsEvent.findMany({
      where: {
        entity: 'Article',
        entityId: { not: null },
        type: { in: ['article_view', 'page_view'] },
        timestamp: { gte: twoDaysAgo },
      },
      select: { entityId: true, timestamp: true },
      take: MAX_ROWS,
    });

    const counts = new Map<string, { current: number; previous: number }>();
    for (const row of rows) {
      if (!row.entityId) continue;
      const bucket = counts.get(row.entityId) ?? { current: 0, previous: 0 };
      if (row.timestamp >= dayAgo) bucket.current += 1;
      else bucket.previous += 1;
      counts.set(row.entityId, bucket);
    }

    const resolved = await this.resolveArticles([...counts.keys()]);

    return [...counts.entries()]
      .map(([key, c]) => {
        const article = resolved.get(key);
        if (!article || c.current === 0) return null;
        return {
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category?.name ?? null,
          views: c.current,
          viewsPerHour: round(c.current / 24, 2),
          growth: c.previous === 0 ? null : round(((c.current - c.previous) / c.previous) * 100),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.views - a.views)
      .slice(0, query.limit ?? 10);
  }

  /* --------------------------------------------------- publishing insights -- */

  /**
   * When to publish, and how an article's traffic decays.
   *
   * Derived by measuring each view event's age relative to its article's
   * `publishedAt`. Requires event-level timestamps, so it covers only the
   * period since event tracking was deployed.
   */
  async publishing(query: AnalyticsRangeQueryDto) {
    const { gte, lte } = this.range(query);

    const articles = await this.prisma.article.findMany({
      where: { deletedAt: null, publishedAt: { not: null, gte: new Date(gte.getTime() - 30 * 86400000) } },
      select: { id: true, slug: true, publishedAt: true },
    });
    if (!articles.length) {
      return { available: false, byHour: [], byDay: [], lifecycle: [] };
    }

    const publishedAt = new Map<string, Date>();
    for (const a of articles) {
      if (!a.publishedAt) continue;
      publishedAt.set(a.id, a.publishedAt);
      publishedAt.set(a.slug, a.publishedAt);
    }

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        entity: 'Article',
        entityId: { in: [...publishedAt.keys()] },
        type: { in: ['article_view', 'page_view'] },
        timestamp: { gte, lte },
      },
      select: { entityId: true, timestamp: true },
      take: MAX_ROWS,
    });

    if (!events.length) return { available: false, byHour: [], byDay: [], lifecycle: [] };

    const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, views: 0, articles: 0 }));
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDay = DAY_NAMES.map((day, index) => ({ day, index, views: 0, articles: 0 }));

    const LIFECYCLE = [
      { bucket: '0–1 hour', maxHours: 1 },
      { bucket: '1–6 hours', maxHours: 6 },
      { bucket: '6–24 hours', maxHours: 24 },
      { bucket: '1–3 days', maxHours: 72 },
      { bucket: '3–7 days', maxHours: 168 },
      { bucket: '7+ days', maxHours: Infinity },
    ];
    const lifecycle = LIFECYCLE.map(l => ({ bucket: l.bucket, views: 0 }));

    for (const event of events) {
      if (!event.entityId) continue;
      const published = publishedAt.get(event.entityId);
      if (!published) continue;

      byHour[published.getUTCHours()].views += 1;
      byDay[published.getUTCDay()].views += 1;

      const ageHours = (event.timestamp.getTime() - published.getTime()) / 3600000;
      if (ageHours < 0) continue;
      const index = LIFECYCLE.findIndex(l => ageHours <= l.maxHours);
      lifecycle[index === -1 ? LIFECYCLE.length - 1 : index].views += 1;
    }

    // How many distinct articles were published in each slot, so "views per
    // article" is comparable across hours with very different volumes.
    for (const article of articles) {
      if (!article.publishedAt) continue;
      byHour[article.publishedAt.getUTCHours()].articles += 1;
      byDay[article.publishedAt.getUTCDay()].articles += 1;
    }

    const perArticle = <T extends { views: number; articles: number }>(row: T) => ({
      ...row,
      viewsPerArticle: row.articles ? round(row.views / row.articles) : 0,
    });

    return {
      available: true,
      byHour: byHour.map(perArticle),
      byDay: byDay.map(perArticle),
      lifecycle,
    };
  }

  /* ---------------------------------------------------------------- export -- */

  /**
   * Turn report rows into CSV. Values are quoted and inner quotes doubled.
   *
   * Accepts `object` rather than an index-signature type so the concrete row
   * interfaces above can be passed straight through without restating them.
   */
  toCsv(rows: readonly object[]): string {
    if (!rows.length) return '';
    const columns = [...new Set(rows.flatMap(r => Object.keys(r)))];

    const cell = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const text = value instanceof Date ? value.toISOString() : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    return [
      columns.map(cell).join(','),
      ...rows.map(row =>
        columns.map(column => cell((row as Record<string, unknown>)[column])).join(',')
      ),
    ].join('\r\n');
  }
}

export interface ResolvedArticle {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
  readMinutes: number;
  category: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  categoryId: string | null;
  author: string | null;
  authorId: string | null;
  publishedAt: Date | null;
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
