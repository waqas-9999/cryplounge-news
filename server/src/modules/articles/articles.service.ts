import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditAction, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { Paginated } from '@/common/dto/api-response.dto';
import { BaseCrudService } from '../content-core/base-crud.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';
import { PublishingService } from '../content-core/publishing.service';
import { RelationsService } from '../content-core/relations.service';
import { SlugService } from '../content-core/slug.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { ArticleQueryDto, CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

/** Columns needed to render a card. Listings never load article bodies. */
const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  publishedAt: true,
  featured: true,
  pinned: true,
  priority: true,
  readMinutes: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, slug: true, name: true, avatarUrl: true } },
  featuredImage: { select: { id: true, path: true, altText: true } },
  tags: { select: { id: true, slug: true, name: true } },
  labels: { select: { id: true, slug: true, name: true, color: true } },
} satisfies Prisma.ArticleSelect;

// Article has no self-referencing `articles` relation, unlike the other
// content types RELATION_INCLUDE is shared with — everything else in it
// (projects, research, regulations, events, founders) is a real relation here.
const { articles: _articlesRelationInclude, ...ARTICLE_CROSS_RELATION_INCLUDE } =
  RelationsService.RELATION_INCLUDE;

const DETAIL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  author: true,
  featuredImage: true,
  tags: { select: { id: true, slug: true, name: true } },
  labels: { select: { id: true, slug: true, name: true, color: true } },
  ...ARTICLE_CROSS_RELATION_INCLUDE,
} satisfies Prisma.ArticleInclude;

/**
 * News articles.
 *
 * The reference implementation for every content module: it extends
 * BaseCrudService for listing and lookup, and delegates slugs, workflow,
 * relations and audit to the Content Core rather than reimplementing them.
 */
@Injectable()
export class ArticlesService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService,
    private readonly sanitizer: HtmlSanitizerService
  ) {
    super(prisma.article, 'Article');
  }

  /**
   * @param includeUnpublished only true for callers holding `news.read`.
   *   Public callers never see drafts, whatever they pass as `status`.
   */
  async list(query: ArticleQueryDto, includeUnpublished = false): Promise<Paginated<unknown>> {
    const where: Prisma.ArticleWhereInput = {
      ...(includeUnpublished
        ? query.status
          ? { status: query.status }
          : {}
        : { status: ContentStatus.PUBLISHED }),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.tag ? { tags: { some: { slug: query.tag } } } : {}),
      ...(query.author ? { author: { slug: query.author } } : {}),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['title', 'summary'],
      sortableFields: ['publishedAt', 'createdAt', 'updatedAt', 'title', 'priority'],
      orderBy: [{ pinned: 'desc' }, { priority: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async findBySlug(slug: string, includeUnpublished = false) {
    return this.findBySlugOrFail(slug, {
      include: DETAIL_INCLUDE as Record<string, unknown>,
      where: includeUnpublished ? {} : { status: ContentStatus.PUBLISHED },
    });
  }

  async findById(id: string) {
    return this.findByIdOrFail(id, { include: DETAIL_INCLUDE as Record<string, unknown> });
  }

  async create(dto: CreateArticleDto, user: AuthenticatedUser, context: AuditContext) {
    const status = dto.status ?? ContentStatus.DRAFT;
    this.assertMayPublish(status, user);

    dto.content = this.sanitizer.sanitize(dto.content);
    const slug = await this.slugs.unique('article', dto.slug ?? dto.title);
    const { publishedAt, scheduledFor } = this.publishing.resolveDates({
      status,
      currentPublishedAt: null,
      scheduledFor: dto.scheduledFor,
    });

    const article = await this.prisma.article.create({
      data: {
        ...this.scalars(dto),
        // Explicit because Prisma requires these on create, while `scalars`
        // is shared with update where every field is optional.
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        slug,
        status,
        publishedAt,
        scheduledFor,
        createdById: user.id,
        updatedById: user.id,
        ...this.connectTaxonomy(dto),
        ...this.relations.buildConnect({
          projects: dto.projectIds,
          research: dto.researchIds,
          regulations: dto.regulationIds,
          events: dto.eventIds,
          founders: dto.founderIds,
        }),
        // First version, so history starts at creation rather than first edit.
        versions: {
          create: {
            title: dto.title,
            summary: dto.summary,
            content: dto.content,
            editedById: user.id,
          },
        },
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Article',
      entityId: article.id,
      summary: `Created article "${article.title}"`,
      context,
    });

    return article;
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    user: AuthenticatedUser,
    context: AuditContext
  ) {
    const current = await this.prisma.article.findFirst({ where: { id, deletedAt: null } });
    if (!current) await this.findByIdOrFail(id);

    const existing = current!;
    if (dto.content !== undefined) dto.content = this.sanitizer.sanitize(dto.content);
    const status = dto.status ?? existing.status;

    if (dto.status && dto.status !== existing.status) {
      this.publishing.assertTransition(existing.status, dto.status);
      this.assertMayPublish(dto.status, user);
    }

    const { publishedAt, scheduledFor } = this.publishing.resolveDates({
      status,
      currentPublishedAt: existing.publishedAt,
      scheduledFor: dto.scheduledFor ?? existing.scheduledFor,
    });

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.slugs.unique('article', dto.slug, id)
        : undefined;

    // Snapshot the previous body before overwriting it, so version history
    // records what the article actually was.
    const bodyChanged =
      (dto.title !== undefined && dto.title !== existing.title) ||
      (dto.summary !== undefined && dto.summary !== existing.summary) ||
      (dto.content !== undefined && dto.content !== existing.content);

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...this.scalars(dto),
        ...(slug ? { slug } : {}),
        status,
        publishedAt,
        scheduledFor,
        updatedById: user.id,
        ...this.connectTaxonomy(dto, true),
        ...this.relations.buildSet({
          projects: dto.projectIds,
          research: dto.researchIds,
          regulations: dto.regulationIds,
          events: dto.eventIds,
          founders: dto.founderIds,
        }),
        ...(bodyChanged
          ? {
              versions: {
                create: {
                  title: existing.title,
                  summary: existing.summary,
                  content: existing.content,
                  editedById: user.id,
                },
              },
            }
          : {}),
      },
      include: DETAIL_INCLUDE,
    });

    const published =
      dto.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED;

    await this.audit.record({
      action: published ? AuditAction.PUBLISH : AuditAction.UPDATE,
      entity: 'Article',
      entityId: article.id,
      summary: published
        ? `Published article "${article.title}"`
        : `Updated article "${article.title}"`,
      context,
      metadata: this.audit.diff(
        existing as unknown as Record<string, unknown>,
        article as unknown as Record<string, unknown>
      ) as Prisma.InputJsonObject,
    });

    return article;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const article = await this.findByIdOrFail<{ id: string; title: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Article',
      entityId: id,
      summary: `Deleted article "${article.title}"`,
      context,
    });
  }

  async versions(id: string) {
    await this.findByIdOrFail(id);
    return this.prisma.articleVersion.findMany({
      where: { articleId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Publishes anything whose scheduled time has passed. Driven by the
   * scheduler; safe to run repeatedly.
   */
  async publishDueScheduled(): Promise<number> {
    const due = await this.prisma.article.findMany({
      where: {
        status: ContentStatus.SCHEDULED,
        scheduledFor: { lte: new Date() },
        deletedAt: null,
      },
      select: { id: true, publishedAt: true },
    });

    for (const article of due) {
      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: article.publishedAt ?? new Date(),
          scheduledFor: null,
        },
      });
    }

    return due.length;
  }

  /* ------------------------------------------------------------ helpers --- */

  private assertMayPublish(status: ContentStatus, user: AuthenticatedUser): void {
    if (!this.publishing.requiresPublishPermission(status)) return;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('news.publish')) return;

    throw new ForbiddenException({
      message: 'You do not have permission to publish or schedule articles',
      code: 'FORBIDDEN',
    });
  }

  /** Scalar columns only — relations are handled separately. */
  private scalars(dto: CreateArticleDto | UpdateArticleDto) {
    return {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
      ...(dto.content !== undefined ? { content: dto.content } : {}),
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.readMinutes !== undefined ? { readMinutes: dto.readMinutes } : {}),
      ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
      ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
      ...(dto.canonicalUrl !== undefined ? { canonicalUrl: dto.canonicalUrl } : {}),
      ...(dto.noindex !== undefined ? { noindex: dto.noindex } : {}),
    };
  }

  private connectTaxonomy(dto: CreateArticleDto | UpdateArticleDto, isUpdate = false) {
    const relate = (ids: string[] | undefined) =>
      isUpdate ? { set: ids!.map(id => ({ id })) } : { connect: ids!.map(id => ({ id })) };

    return {
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.authorId !== undefined ? { authorId: dto.authorId } : {}),
      ...(dto.featuredImageId !== undefined ? { featuredImageId: dto.featuredImageId } : {}),
      ...(dto.tagIds !== undefined ? { tags: relate(dto.tagIds) } : {}),
      ...(dto.labelIds !== undefined ? { labels: relate(dto.labelIds) } : {}),
    };
  }
}
