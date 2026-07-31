import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditAction, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { Paginated } from '@/common/dto/api-response.dto';
import { BaseCrudService } from '../content-core/base-crud.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { PublishingService } from '../content-core/publishing.service';
import { RelationsService } from '../content-core/relations.service';
import { SlugService } from '../content-core/slug.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type {
  CreateResearchDto,
  ResearchQueryDto,
  UpdateResearchDto,
} from './dto/research.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  publishedAt: true,
  featured: true,
  createdAt: true,
  category: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, slug: true, name: true } },
  coverImage: { select: { id: true, path: true, altText: true } },
  tags: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ResearchSelect;

const DETAIL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  author: true,
  coverImage: true,
  tags: { select: { id: true, slug: true, name: true } },
  projects: RelationsService.RELATION_INCLUDE.projects,
  articles: RelationsService.RELATION_INCLUDE.articles,
} satisfies Prisma.ResearchInclude;

/** Long-form analysis. Same workflow as articles, without pinning or priority. */
@Injectable()
export class ResearchService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService
  ) {
    super(prisma.research, 'Research');
  }

  async list(query: ResearchQueryDto, includeUnpublished = false): Promise<Paginated<unknown>> {
    const where: Prisma.ResearchWhereInput = {
      ...(includeUnpublished
        ? query.status
          ? { status: query.status }
          : {}
        : { status: ContentStatus.PUBLISHED }),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.tag ? { tags: { some: { slug: query.tag } } } : {}),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['title', 'summary'],
      sortableFields: ['publishedAt', 'createdAt', 'title'],
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
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

  async create(dto: CreateResearchDto, user: AuthenticatedUser, context: AuditContext) {
    const status = dto.status ?? ContentStatus.DRAFT;
    this.assertMayPublish(status, user);

    const slug = await this.slugs.unique('research', dto.slug ?? dto.title);
    const { publishedAt } = this.publishing.resolveDates({
      status,
      currentPublishedAt: null,
    });

    const research = await this.prisma.research.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        references: dto.references ?? [],
        slug,
        status,
        publishedAt,
        featured: dto.featured ?? false,
        categoryId: dto.categoryId,
        authorId: dto.authorId,
        coverImageId: dto.coverImageId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        noindex: dto.noindex ?? false,
        updatedById: user.id,
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map(id => ({ id })) } } : {}),
        ...this.relations.buildConnect({
          projects: dto.projectIds,
          articles: dto.articleIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Research',
      entityId: research.id,
      summary: `Created research report "${research.title}"`,
      context,
    });

    return research;
  }

  async update(
    id: string,
    dto: UpdateResearchDto,
    user: AuthenticatedUser,
    context: AuditContext
  ) {
    const existing = await this.findByIdOrFail<{
      id: string;
      slug: string;
      title: string;
      status: ContentStatus;
      publishedAt: Date | null;
    }>(id);

    if (dto.status && dto.status !== existing.status) {
      this.publishing.assertTransition(existing.status, dto.status);
      this.assertMayPublish(dto.status, user);
    }

    const status = dto.status ?? existing.status;
    const { publishedAt } = this.publishing.resolveDates({
      status,
      currentPublishedAt: existing.publishedAt,
    });

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.slugs.unique('research', dto.slug, id)
        : undefined;

    const research = await this.prisma.research.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.references !== undefined ? { references: dto.references } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.authorId !== undefined ? { authorId: dto.authorId } : {}),
        ...(dto.coverImageId !== undefined ? { coverImageId: dto.coverImageId } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
        ...(dto.noindex !== undefined ? { noindex: dto.noindex } : {}),
        ...(slug ? { slug } : {}),
        status,
        publishedAt,
        updatedById: user.id,
        ...(dto.tagIds ? { tags: { set: dto.tagIds.map(tagId => ({ id: tagId })) } } : {}),
        ...this.relations.buildSet({
          projects: dto.projectIds,
          articles: dto.articleIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    const published =
      dto.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED;

    await this.audit.record({
      action: published ? AuditAction.PUBLISH : AuditAction.UPDATE,
      entity: 'Research',
      entityId: research.id,
      summary: published
        ? `Published research "${research.title}"`
        : `Updated research "${research.title}"`,
      context,
    });

    return research;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const research = await this.findByIdOrFail<{ id: string; title: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Research',
      entityId: id,
      summary: `Deleted research "${research.title}"`,
      context,
    });
  }

  private assertMayPublish(status: ContentStatus, user: AuthenticatedUser): void {
    if (!this.publishing.requiresPublishPermission(status)) return;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('research.publish')) return;

    throw new ForbiddenException({
      message: 'You do not have permission to publish research',
      code: 'FORBIDDEN',
    });
  }
}
