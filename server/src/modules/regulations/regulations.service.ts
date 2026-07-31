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
  CreateRegulationDto,
  RegulationQueryDto,
  UpdateRegulationDto,
} from './dto/regulation.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  countryCode: true,
  countryName: true,
  region: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.RegulationSelect;

const DETAIL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
  projects: RelationsService.RELATION_INCLUDE.projects,
  articles: RelationsService.RELATION_INCLUDE.articles,
} satisfies Prisma.RegulationInclude;

/** Policy and legal tracking, organised by jurisdiction. */
@Injectable()
export class RegulationsService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService
  ) {
    super(prisma.regulation, 'Regulation');
  }

  async list(query: RegulationQueryDto, includeUnpublished = false): Promise<Paginated<unknown>> {
    const where: Prisma.RegulationWhereInput = {
      ...(includeUnpublished
        ? query.status
          ? { status: query.status }
          : {}
        : { status: ContentStatus.PUBLISHED }),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.country ? { countryCode: query.country.toUpperCase() } : {}),
      ...(query.region ? { region: query.region } : {}),
      ...(query.tag ? { tags: { some: { slug: query.tag } } } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['title', 'summary'],
      sortableFields: ['publishedAt', 'createdAt', 'title'],
      orderBy: { publishedAt: 'desc' },
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

  /**
   * Jurisdictions that have published coverage, for the country and region
   * browse lists. Empty jurisdictions are excluded so the UI never offers a
   * filter that returns nothing.
   */
  async jurisdictions() {
    const rows = await this.prisma.regulation.groupBy({
      by: ['countryCode', 'countryName', 'region'],
      where: { deletedAt: null, status: ContentStatus.PUBLISHED },
      _count: { _all: true },
    });

    const countries = rows
      .filter(row => row.countryCode)
      .map(row => ({
        code: row.countryCode!,
        name: row.countryName ?? row.countryCode!,
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const regionCounts = new Map<string, number>();
    for (const row of rows) {
      if (row.region) {
        regionCounts.set(row.region, (regionCounts.get(row.region) ?? 0) + row._count._all);
      }
    }

    return {
      countries,
      regions: [...regionCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async create(dto: CreateRegulationDto, user: AuthenticatedUser, context: AuditContext) {
    const status = dto.status ?? ContentStatus.DRAFT;
    this.assertMayPublish(status, user);

    const slug = await this.slugs.unique('regulation', dto.slug ?? dto.title);
    const { publishedAt } = this.publishing.resolveDates({ status, currentPublishedAt: null });

    const regulation = await this.prisma.regulation.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        countryCode: dto.countryCode?.toUpperCase(),
        countryName: dto.countryName,
        region: dto.region,
        slug,
        status,
        publishedAt,
        categoryId: dto.categoryId,
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
      entity: 'Regulation',
      entityId: regulation.id,
      summary: `Created regulation "${regulation.title}"`,
      context,
    });

    return regulation;
  }

  async update(
    id: string,
    dto: UpdateRegulationDto,
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
        ? await this.slugs.unique('regulation', dto.slug, id)
        : undefined;

    const regulation = await this.prisma.regulation.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.countryCode !== undefined
          ? { countryCode: dto.countryCode?.toUpperCase() }
          : {}),
        ...(dto.countryName !== undefined ? { countryName: dto.countryName } : {}),
        ...(dto.region !== undefined ? { region: dto.region } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
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
      entity: 'Regulation',
      entityId: regulation.id,
      summary: published
        ? `Published regulation "${regulation.title}"`
        : `Updated regulation "${regulation.title}"`,
      context,
    });

    return regulation;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const regulation = await this.findByIdOrFail<{ id: string; title: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Regulation',
      entityId: id,
      summary: `Deleted regulation "${regulation.title}"`,
      context,
    });
  }

  private assertMayPublish(status: ContentStatus, user: AuthenticatedUser): void {
    if (!this.publishing.requiresPublishPermission(status)) return;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('regulations.publish')) return;

    throw new ForbiddenException({
      message: 'You do not have permission to publish regulations',
      code: 'FORBIDDEN',
    });
  }
}
