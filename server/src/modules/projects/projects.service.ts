import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { Paginated } from '@/common/dto/api-response.dto';
import { BaseCrudService } from '../content-core/base-crud.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { RelationsService } from '../content-core/relations.service';
import { SlugService } from '../content-core/slug.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  logo: true,
  accent: true,
  blockchain: true,
  supportedNetworks: true,
  status: true,
  verified: true,
  featured: true,
  editorsPick: true,
  website: true,
  x: true,
  github: true,
  discord: true,
  createdAt: true,
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ProjectSelect;

const DETAIL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
  logoImage: true,
  coverImage: true,
  ...RelationsService.RELATION_INCLUDE,
} satisfies Prisma.ProjectInclude;

/**
 * The ecosystem project directory.
 *
 * Unlike articles this has no publish workflow — a project is either listed or
 * it is not — so PublishingService is deliberately absent rather than
 * force-fitted.
 */
@Injectable()
export class ProjectsService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService
  ) {
    super(prisma.project, 'Project');
  }

  async list(query: ProjectQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.ProjectWhereInput = {
      ...(query.category ? { category: { slug: query.category } } : {}),
      // `has` matches the array column, so a project surfaces under every
      // chain it supports, not only its primary one.
      ...(query.network ? { supportedNetworks: { has: query.network } } : {}),
      ...(query.tag ? { tags: { some: { slug: query.tag } } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
      ...(query.verified !== undefined ? { verified: query.verified } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['name', 'tagline', 'about'],
      sortableFields: ['createdAt', 'name', 'launchYear'],
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    return this.findBySlugOrFail(slug, { include: DETAIL_INCLUDE as Record<string, unknown> });
  }

  async findById(id: string) {
    return this.findByIdOrFail(id, { include: DETAIL_INCLUDE as Record<string, unknown> });
  }

  /**
   * Projects related to this one: same category first, then shared tags.
   *
   * Scored in SQL-adjacent terms rather than loading the table and sorting in
   * memory — this runs on every project page.
   */
  async similar(slug: string, limit = 4) {
    const project = await this.prisma.project.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, categoryId: true, tags: { select: { id: true } } },
    });
    if (!project) return [];

    const tagIds = project.tags.map(tag => tag.id);

    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        id: { not: project.id },
        OR: [
          ...(project.categoryId ? [{ categoryId: project.categoryId }] : []),
          ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
        ],
      },
      select: LIST_SELECT,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async create(dto: CreateProjectDto, user: AuthenticatedUser, context: AuditContext) {
    const slug = await this.slugs.unique('project', dto.slug ?? dto.name);

    const project = await this.prisma.project.create({
      data: {
        ...this.scalars(dto),
        name: dto.name,
        tagline: dto.tagline,
        about: dto.about,
        blockchain: dto.blockchain,
        logo: dto.logo,
        slug,
        updatedById: user.id,
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map(id => ({ id })) } } : {}),
        ...this.relations.buildConnect({
          articles: dto.articleIds,
          research: dto.researchIds,
          regulations: dto.regulationIds,
          events: dto.eventIds,
          founders: dto.founderIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Project',
      entityId: project.id,
      summary: `Added project "${project.name}" to the directory`,
      context,
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: AuthenticatedUser, context: AuditContext) {
    const existing = await this.findByIdOrFail<{ id: string; slug: string; name: string }>(id);

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.slugs.unique('project', dto.slug, id)
        : undefined;

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...this.scalars(dto),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.tagline !== undefined ? { tagline: dto.tagline } : {}),
        ...(dto.about !== undefined ? { about: dto.about } : {}),
        ...(dto.blockchain !== undefined ? { blockchain: dto.blockchain } : {}),
        ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
        ...(slug ? { slug } : {}),
        updatedById: user.id,
        ...(dto.tagIds ? { tags: { set: dto.tagIds.map(tagId => ({ id: tagId })) } } : {}),
        ...this.relations.buildSet({
          articles: dto.articleIds,
          research: dto.researchIds,
          regulations: dto.regulationIds,
          events: dto.eventIds,
          founders: dto.founderIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'Project',
      entityId: project.id,
      summary: `Updated project "${project.name}"`,
      context,
    });

    return project;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const project = await this.findByIdOrFail<{ id: string; name: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Project',
      entityId: id,
      summary: `Removed project "${project.name}" from the directory`,
      context,
    });
  }

  /** Category and network counts for the directory's browse facets. */
  async facets() {
    const [categories, projects] = await Promise.all([
      this.prisma.category.findMany({
        where: { kind: 'PROJECT' },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          _count: { select: { projects: true } },
        },
      }),
      this.prisma.project.findMany({
        where: { deletedAt: null },
        select: { supportedNetworks: true },
      }),
    ]);

    const networkCounts = new Map<string, number>();
    for (const project of projects) {
      for (const network of project.supportedNetworks) {
        networkCounts.set(network, (networkCounts.get(network) ?? 0) + 1);
      }
    }

    return {
      categories: categories
        .filter(category => category._count.projects > 0)
        .map(({ _count, ...category }) => ({ ...category, count: _count.projects })),
      networks: [...networkCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    };
  }

  /** Scalar columns shared by create and update. */
  private scalars(dto: CreateProjectDto | UpdateProjectDto) {
    const keys = [
      'keyFeatures',
      'categoryId',
      'supportedNetworks',
      'nativeToken',
      'launchYear',
      'status',
      'verified',
      'openSource',
      'featured',
      'editorsPick',
      'accent',
      'logoImageId',
      'coverImageId',
      'website',
      'x',
      'github',
      'discord',
      'telegram',
      'linkedin',
      'youtube',
      'medium',
      'blog',
      'docs',
      'whitepaper',
      'explorer',
      'api',
      'seoTitle',
      'seoDescription',
      'noindex',
    ] as const;

    return Object.fromEntries(
      keys
        .filter(key => dto[key] !== undefined)
        .map(key => [key, dto[key]])
    );
  }
}
