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
import type { CreateFounderDto, FounderQueryDto, UpdateFounderDto } from './dto/founder.dto';
import type { SubmitFounderDto } from './dto/submit-founder.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  role: true,
  company: true,
  excerpt: true,
  region: true,
  industry: true,
  status: true,
  featured: true,
  verified: true,
  publishedAt: true,
  website: true,
  x: true,
  linkedin: true,
  photo: { select: { id: true, path: true, altText: true } },
  tags: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.FounderSelect;

const DETAIL_INCLUDE = {
  photo: true,
  tags: { select: { id: true, slug: true, name: true } },
  projects: RelationsService.RELATION_INCLUDE.projects,
  articles: RelationsService.RELATION_INCLUDE.articles,
  events: RelationsService.RELATION_INCLUDE.events,
} satisfies Prisma.FounderInclude;

/** Profiles of the people building the industry. */
@Injectable()
export class FoundersService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService
  ) {
    super(prisma.founder, 'Founder');
  }

  async list(query: FounderQueryDto, includeUnpublished = false): Promise<Paginated<unknown>> {
    const where: Prisma.FounderWhereInput = {
      ...(includeUnpublished
        ? query.status
          ? { status: query.status }
          : {}
        : { status: ContentStatus.PUBLISHED }),
      ...(query.region ? { region: query.region } : {}),
      ...(query.tag ? { tags: { some: { slug: query.tag } } } : {}),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['name', 'role', 'company', 'excerpt'],
      sortableFields: ['publishedAt', 'createdAt', 'name'],
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

  async create(dto: CreateFounderDto, user: AuthenticatedUser, context: AuditContext) {
    const status = dto.status ?? ContentStatus.DRAFT;
    this.assertMayPublish(status, user);

    const slug = await this.slugs.unique('founder', dto.slug ?? dto.name);
    const { publishedAt } = this.publishing.resolveDates({ status, currentPublishedAt: null });

    const founder = await this.prisma.founder.create({
      data: {
        name: dto.name,
        role: dto.role,
        company: dto.company,
        bio: dto.bio,
        excerpt: dto.excerpt,
        photoId: dto.photoId,
        website: dto.website,
        x: dto.x,
        linkedin: dto.linkedin,
        github: dto.github,
        region: dto.region,
        industry: dto.industry,
        slug,
        status,
        publishedAt,
        featured: dto.featured ?? false,
        verified: dto.verified ?? false,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        noindex: dto.noindex ?? false,
        updatedById: user.id,
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map(id => ({ id })) } } : {}),
        ...this.relations.buildConnect({
          projects: dto.projectIds,
          articles: dto.articleIds,
          events: dto.eventIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Founder',
      entityId: founder.id,
      summary: `Created founder profile "${founder.name}"`,
      context,
    });

    return founder;
  }

  async update(id: string, dto: UpdateFounderDto, user: AuthenticatedUser, context: AuditContext) {
    const existing = await this.findByIdOrFail<{
      id: string;
      slug: string;
      name: string;
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
        ? await this.slugs.unique('founder', dto.slug, id)
        : undefined;

    const founder = await this.prisma.founder.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
        ...(dto.photoId !== undefined ? { photoId: dto.photoId } : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.x !== undefined ? { x: dto.x } : {}),
        ...(dto.linkedin !== undefined ? { linkedin: dto.linkedin } : {}),
        ...(dto.github !== undefined ? { github: dto.github } : {}),
        ...(dto.region !== undefined ? { region: dto.region } : {}),
        ...(dto.industry !== undefined ? { industry: dto.industry } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
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
          events: dto.eventIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action:
        dto.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED
          ? AuditAction.PUBLISH
          : AuditAction.UPDATE,
      entity: 'Founder',
      entityId: founder.id,
      summary: `Updated founder profile "${founder.name}"`,
      context,
    });

    return founder;
  }

  /**
   * Public, unauthenticated submission. Always lands in REVIEW so an editor
   * has to approve before it's visible to anyone else.
   */
  async submit(dto: SubmitFounderDto) {
    const slug = await this.slugs.unique('founder', dto.name);

    const founder = await this.prisma.founder.create({
      data: {
        name: dto.name,
        role: dto.role,
        company: dto.company,
        bio: dto.bio,
        excerpt: dto.excerpt,
        photoId: dto.photoId,
        website: dto.website,
        x: dto.x,
        linkedin: dto.linkedin,
        github: dto.github,
        region: dto.region,
        // `industry` and `verified` are deliberately not set here: both are
        // editorial classifications, assigned during review rather than
        // claimed by the submitter.
        submittedByName: dto.submittedByName,
        submittedByEmail: dto.submittedByEmail,
        slug,
        status: ContentStatus.REVIEW,
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Founder',
      entityId: founder.id,
      summary: `"${founder.name}" story submitted for review by ${dto.submittedByEmail}`,
    });

    return founder;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const founder = await this.findByIdOrFail<{ id: string; name: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Founder',
      entityId: id,
      summary: `Deleted founder profile "${founder.name}"`,
      context,
    });
  }

  private assertMayPublish(status: ContentStatus, user: AuthenticatedUser): void {
    if (!this.publishing.requiresPublishPermission(status)) return;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('founders.publish')) return;

    throw new ForbiddenException({
      message: 'You do not have permission to publish founder profiles',
      code: 'FORBIDDEN',
    });
  }
}
