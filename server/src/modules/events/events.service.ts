import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AuditAction, ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { Paginated } from '@/common/dto/api-response.dto';
import { BaseCrudService } from '../content-core/base-crud.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { PublishingService } from '../content-core/publishing.service';
import { RelationsService } from '../content-core/relations.service';
import { SlugService } from '../content-core/slug.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto/event.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  startsAt: true,
  endsAt: true,
  timezone: true,
  mode: true,
  venue: true,
  city: true,
  country: true,
  registerUrl: true,
  status: true,
  featured: true,
  category: { select: { id: true, slug: true, name: true } },
  bannerImage: { select: { id: true, path: true, altText: true } },
  tags: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.EventSelect;

const DETAIL_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  bannerImage: true,
  tags: { select: { id: true, slug: true, name: true } },
  speakers: {
    include: { founder: { select: { id: true, slug: true, name: true } } },
  },
  articles: RelationsService.RELATION_INCLUDE.articles,
  projects: RelationsService.RELATION_INCLUDE.projects,
  founders: RelationsService.RELATION_INCLUDE.founders,
} satisfies Prisma.EventInclude;

/**
 * Conferences, hackathons and meetups.
 *
 * Times are stored as UTC instants; `timezone` records the event's local zone
 * so the frontend can display "09:00 GMT+8" correctly without guessing.
 */
@Injectable()
export class EventsService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly publishing: PublishingService,
    private readonly relations: RelationsService,
    private readonly audit: AuditService
  ) {
    super(prisma.event, 'Event');
  }

  async list(query: EventQueryDto, includeUnpublished = false): Promise<Paginated<unknown>> {
    const now = new Date();
    const when = query.when ?? 'upcoming';

    const where: Prisma.EventWhereInput = {
      ...(includeUnpublished
        ? query.status
          ? { status: query.status }
          : {}
        : { status: ContentStatus.PUBLISHED }),
      ...(when === 'upcoming' ? { startsAt: { gte: now } } : {}),
      ...(when === 'past' ? { startsAt: { lt: now } } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.mode ? { mode: query.mode } : {}),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: LIST_SELECT as Record<string, unknown>,
      searchFields: ['name', 'summary', 'city', 'country'],
      sortableFields: ['startsAt', 'createdAt', 'name'],
      // Upcoming reads soonest-first; past reads most-recent-first.
      orderBy: when === 'past' ? { startsAt: 'desc' } : { startsAt: 'asc' },
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

  async create(dto: CreateEventDto, user: AuthenticatedUser, context: AuditContext) {
    const status = dto.status ?? ContentStatus.DRAFT;
    this.assertMayPublish(status, user);
    this.assertDatesCoherent(dto.startsAt, dto.endsAt);

    const slug = await this.slugs.unique('event', dto.slug ?? dto.name);

    const event = await this.prisma.event.create({
      data: {
        name: dto.name,
        summary: dto.summary,
        content: dto.content,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        timezone: dto.timezone ?? 'UTC',
        mode: dto.mode,
        venue: dto.venue,
        city: dto.city,
        country: dto.country,
        onlineUrl: dto.onlineUrl,
        registerUrl: dto.registerUrl,
        slug,
        status,
        featured: dto.featured ?? false,
        categoryId: dto.categoryId,
        bannerImageId: dto.bannerImageId,
        sponsors: dto.sponsors ?? [],
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        noindex: dto.noindex ?? false,
        updatedById: user.id,
        ...(dto.speakers?.length ? { speakers: { create: dto.speakers } } : {}),
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map(id => ({ id })) } } : {}),
        ...this.relations.buildConnect({
          articles: dto.articleIds,
          projects: dto.projectIds,
          founders: dto.founderIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Event',
      entityId: event.id,
      summary: `Created event "${event.name}"`,
      context,
    });

    return event;
  }

  async update(id: string, dto: UpdateEventDto, user: AuthenticatedUser, context: AuditContext) {
    const existing = await this.findByIdOrFail<{
      id: string;
      slug: string;
      name: string;
      status: ContentStatus;
      startsAt: Date;
      endsAt: Date | null;
    }>(id);

    if (dto.status && dto.status !== existing.status) {
      this.publishing.assertTransition(existing.status, dto.status);
      this.assertMayPublish(dto.status, user);
    }

    this.assertDatesCoherent(
      dto.startsAt ?? existing.startsAt,
      dto.endsAt !== undefined ? dto.endsAt : existing.endsAt
    );

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.slugs.unique('event', dto.slug, id)
        : undefined;

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt } : {}),
        ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.mode !== undefined ? { mode: dto.mode } : {}),
        ...(dto.venue !== undefined ? { venue: dto.venue } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.onlineUrl !== undefined ? { onlineUrl: dto.onlineUrl } : {}),
        ...(dto.registerUrl !== undefined ? { registerUrl: dto.registerUrl } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.bannerImageId !== undefined ? { bannerImageId: dto.bannerImageId } : {}),
        ...(dto.sponsors !== undefined ? { sponsors: dto.sponsors } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
        ...(dto.noindex !== undefined ? { noindex: dto.noindex } : {}),
        ...(slug ? { slug } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        updatedById: user.id,
        // The speaker list is submitted whole, so replace rather than merge.
        ...(dto.speakers !== undefined
          ? { speakers: { deleteMany: {}, create: dto.speakers } }
          : {}),
        ...(dto.tagIds ? { tags: { set: dto.tagIds.map(tagId => ({ id: tagId })) } } : {}),
        ...this.relations.buildSet({
          articles: dto.articleIds,
          projects: dto.projectIds,
          founders: dto.founderIds,
        }),
      },
      include: DETAIL_INCLUDE,
    });

    await this.audit.record({
      action:
        dto.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED
          ? AuditAction.PUBLISH
          : AuditAction.UPDATE,
      entity: 'Event',
      entityId: event.id,
      summary: `Updated event "${event.name}"`,
      context,
    });

    return event;
  }

  async remove(id: string, user: AuthenticatedUser, context: AuditContext) {
    const event = await this.findByIdOrFail<{ id: string; name: string }>(id);
    await this.softDelete(id, user.id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Event',
      entityId: id,
      summary: `Deleted event "${event.name}"`,
      context,
    });
  }

  private assertDatesCoherent(startsAt: Date, endsAt?: Date | null): void {
    if (endsAt && endsAt.getTime() < startsAt.getTime()) {
      throw new BadRequestException({
        message: 'endsAt cannot be before startsAt',
        code: 'INVALID_DATE_RANGE',
      });
    }
  }

  private assertMayPublish(status: ContentStatus, user: AuthenticatedUser): void {
    if (!this.publishing.requiresPublishPermission(status)) return;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('events.publish')) return;

    throw new ForbiddenException({
      message: 'You do not have permission to publish events',
      code: 'FORBIDDEN',
    });
  }
}
