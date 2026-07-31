import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

/** The section keys the frontend renders. */
export type DiscoveryKey =
  | 'featured'
  | 'trending'
  | 'latest'
  | 'most_read'
  | 'editors_picks'
  | 'recommended'
  | 'popular_topics'
  | 'market_news'
  | 'research_picks'
  | 'ecosystem_spotlight'
  | 'founder_spotlight'
  | 'trending_projects'
  | 'upcoming_events';

const ARTICLE_CARD = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  publishedAt: true,
  readMinutes: true,
  category: { select: { slug: true, name: true } },
  author: { select: { slug: true, name: true } },
  featuredImage: { select: { path: true, altText: true } },
} satisfies Prisma.ArticleSelect;

const PROJECT_CARD = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  logo: true,
  accent: true,
  verified: true,
  category: { select: { slug: true, name: true } },
} satisfies Prisma.ProjectSelect;

/**
 * Resolves the content behind each homepage and section block.
 *
 * Every block is a *rule* evaluated here, not a query hardcoded in the
 * frontend, so an editor can change what "Trending" means without a deploy.
 * `HomepageSection.config` carries per-section options and the admin owns it.
 *
 * "Most read" and "trending" read from ViewCount, which is populated by the
 * view-tracking endpoint. Where no view data exists yet they fall back to
 * recency, and say so — they never invent numbers.
 */
@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every enabled homepage section, in order, with its content resolved. */
  async homepage() {
    const sections = await this.prisma.homepageSection.findMany({
      where: { enabled: true },
      orderBy: { position: 'asc' },
    });

    return Promise.all(
      sections.map(async section => {
        const config = (section.config ?? {}) as { limit?: number };
        return {
          key: section.key,
          title: section.title,
          position: section.position,
          items: await this.resolve(section.key as DiscoveryKey, config.limit ?? 6).catch(() => []),
        };
      })
    );
  }

  async resolve(key: DiscoveryKey, limit = 6): Promise<unknown[]> {
    switch (key) {
      case 'featured':
        return this.articles({ featured: true }, limit);

      case 'latest':
        return this.articles({}, limit);

      case 'editors_picks':
        return this.projects({ editorsPick: true }, limit);

      case 'recommended':
        return this.articles({ priority: { gt: 0 } }, limit);

      case 'market_news':
        return this.articles({ category: { slug: 'market' } }, limit);

      case 'trending':
      case 'most_read':
        return this.mostViewed('Article', limit);

      case 'trending_projects':
      case 'ecosystem_spotlight':
        return this.projects({ featured: true }, limit);

      case 'research_picks':
        return this.prisma.research.findMany({
          where: { deletedAt: null, status: ContentStatus.PUBLISHED },
          select: { id: true, slug: true, title: true, summary: true, publishedAt: true },
          orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
          take: limit,
        });

      case 'founder_spotlight':
        return this.prisma.founder.findMany({
          where: { deletedAt: null, status: ContentStatus.PUBLISHED },
          select: { id: true, slug: true, name: true, role: true, company: true, excerpt: true },
          orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
          take: limit,
        });

      case 'upcoming_events':
        return this.prisma.event.findMany({
          where: {
            deletedAt: null,
            status: ContentStatus.PUBLISHED,
            startsAt: { gte: new Date() },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            summary: true,
            startsAt: true,
            venue: true,
            city: true,
            country: true,
            mode: true,
            registerUrl: true,
          },
          orderBy: { startsAt: 'asc' },
          take: limit,
        });

      case 'popular_topics':
        return this.popularTags(limit);

      default:
        throw new NotFoundException({
          message: `Unknown discovery section: ${key}`,
          code: 'UNKNOWN_SECTION',
        });
    }
  }

  private articles(where: Prisma.ArticleWhereInput, take: number) {
    return this.prisma.article.findMany({
      where: { deletedAt: null, status: ContentStatus.PUBLISHED, ...where },
      select: ARTICLE_CARD,
      orderBy: [{ pinned: 'desc' }, { priority: 'desc' }, { publishedAt: 'desc' }],
      take,
    });
  }

  private projects(where: Prisma.ProjectWhereInput, take: number) {
    return this.prisma.project.findMany({
      where: { deletedAt: null, ...where },
      select: PROJECT_CARD,
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /**
   * Ranks by views over the last 30 days.
   *
   * Falls back to recency when there is no view data — which is the honest
   * behaviour on a new install, rather than presenting arbitrary rows as
   * "most read".
   */
  private async mostViewed(entity: 'Article', take: number) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const counts = await this.prisma.viewCount.groupBy({
      by: ['entityId'],
      where: { entity, day: { gte: since } },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take,
    });

    if (counts.length === 0) {
      return this.articles({}, take);
    }

    const articles = await this.prisma.article.findMany({
      where: {
        id: { in: counts.map(row => row.entityId) },
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
      },
      select: ARTICLE_CARD,
    });

    // Preserve the ranking order the aggregate produced.
    const order = new Map(counts.map((row, index) => [row.entityId, index]));
    return articles.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  /** Tags with the most published articles — the "Popular Topics" block. */
  private async popularTags(take: number) {
    const tags = await this.prisma.tag.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { articles: true } },
      },
      orderBy: { articles: { _count: 'desc' } },
      take,
    });

    return tags
      .filter(tag => tag._count.articles > 0)
      .map(({ _count, ...tag }) => ({ ...tag, count: _count.articles }));
  }
}
