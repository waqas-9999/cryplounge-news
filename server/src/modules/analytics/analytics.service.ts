import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  AnalyticsRangeQueryDto,
  RecordViewDto,
  TopContentQueryDto,
  TrackedEntity,
} from './dto/analytics.dto';
import { TRACKED_ENTITIES } from './dto/analytics.dto';

/** Title/slug lookup per tracked entity, since each model names them differently. */
const TITLE_FIELD: Record<TrackedEntity, 'title' | 'name'> = {
  Article: 'title',
  Project: 'name',
  Research: 'title',
  Regulation: 'title',
  Event: 'name',
  Founder: 'name',
};

/** Prisma delegate name for each tracked entity, i.e. `prisma[delegate]`. */
const DELEGATE: Record<TrackedEntity, string> = {
  Article: 'article',
  Project: 'project',
  Research: 'research',
  Regulation: 'regulation',
  Event: 'event',
  Founder: 'founder',
};

/** Midnight UTC of the day a view happened on, matching ViewCount.day's granularity. */
function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Traffic and search analytics built on `ViewCount` and `SearchQuery`.
 *
 * There is no session or event table here on purpose — this reports only
 * what the schema actually records (views per day per entity, and search
 * terms with their result counts). Metrics like bounce rate or session
 * duration would have to be invented, and invented numbers are worse than
 * no numbers.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records one view. Upserts the day's row so a busy page does not create a
   * write per pageview — one row per entity per day, incremented in place.
   */
  async recordView(dto: RecordViewDto): Promise<void> {
    const day = startOfUtcDay(new Date());

    await this.prisma.viewCount.upsert({
      where: { entity_entityId_day: { entity: dto.entity, entityId: dto.entityId, day } },
      create: { entity: dto.entity, entityId: dto.entityId, day, count: 1 },
      update: { count: { increment: 1 } },
    });
  }

  private range(query: AnalyticsRangeQueryDto) {
    const to = query.to ?? new Date();
    const from = query.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { gte: startOfUtcDay(from), lte: startOfUtcDay(to) };
  }

  /** Total views in range, broken down by content type. */
  async overview(query: AnalyticsRangeQueryDto) {
    const day = this.range(query);

    const rows = await this.prisma.viewCount.groupBy({
      by: ['entity'],
      where: { day, ...(query.entity ? { entity: query.entity } : {}) },
      _sum: { count: true },
    });

    const byEntity = Object.fromEntries(TRACKED_ENTITIES.map(entity => [entity, 0]));
    for (const row of rows) {
      byEntity[row.entity] = row._sum.count ?? 0;
    }

    const totalViews = Object.values(byEntity).reduce((sum, count) => sum + count, 0);

    return { from: day.gte, to: day.lte, totalViews, byEntity };
  }

  /** Daily view totals across the range, for a trend chart. */
  async trend(query: AnalyticsRangeQueryDto) {
    const day = this.range(query);

    const rows = await this.prisma.viewCount.groupBy({
      by: ['day'],
      where: { day, ...(query.entity ? { entity: query.entity } : {}) },
      _sum: { count: true },
      orderBy: { day: 'asc' },
    });

    return rows.map(row => ({ day: row.day, views: row._sum.count ?? 0 }));
  }

  /** Best-viewed records for one content type in range. */
  async topContent(query: TopContentQueryDto) {
    const entity = query.entity ?? 'Article';
    const day = this.range(query);
    const take = Math.min(query.limit ?? 10, 50);

    const counts = await this.prisma.viewCount.groupBy({
      by: ['entityId'],
      where: { entity, day },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take,
    });

    if (counts.length === 0) return [];

    const delegate = (this.prisma as unknown as Record<string, any>)[DELEGATE[entity]];
    const titleField = TITLE_FIELD[entity];

    const records = await delegate.findMany({
      where: { id: { in: counts.map(row => row.entityId) }, deletedAt: null },
      select: { id: true, slug: true, [titleField]: true },
    });

    const byId = new Map(records.map((record: { id: string }) => [record.id, record]));

    return counts
      .map(row => ({ ...(byId.get(row.entityId) as object), views: row._sum.count ?? 0 }))
      .filter(row => 'id' in row);
  }

  /**
   * Top and zero-result search terms — the content-gap signal editors act on.
   */
  async search(query: AnalyticsRangeQueryDto) {
    const to = query.to ?? new Date();
    const from = query.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const createdAt = { gte: from, lte: to };

    const [topTerms, zeroResultTerms, totalSearches] = await Promise.all([
      this.prisma.searchQuery.groupBy({
        by: ['term'],
        where: { createdAt },
        _count: { _all: true },
        orderBy: { _count: { term: 'desc' } },
        take: 20,
      }),
      this.prisma.searchQuery.groupBy({
        by: ['term'],
        where: { createdAt, resultCount: 0 },
        _count: { _all: true },
        orderBy: { _count: { term: 'desc' } },
        take: 20,
      }),
      this.prisma.searchQuery.count({ where: { createdAt } }),
    ]);

    return {
      totalSearches,
      topTerms: topTerms.map(row => ({ term: row.term, count: row._count._all })),
      zeroResultTerms: zeroResultTerms.map(row => ({ term: row.term, count: row._count._all })),
    };
  }
}
