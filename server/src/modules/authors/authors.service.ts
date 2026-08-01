import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, ContentStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import type { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { SlugService } from '../content-core/slug.service';
import type { CreateAuthorDto, UpdateAuthorDto } from './dto/author.dto';

/**
 * Bylines.
 *
 * Separate from User on purpose: not every contributor has a login, and a
 * byline must outlive the staff account behind it. Deleting a User leaves the
 * Author — and therefore the article's attribution — intact.
 */
@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly audit: AuditService
  ) {}

  async list(query: PaginationQueryDto): Promise<Paginated<unknown>> {
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.take,
        include: { _count: { select: { articles: true, research: true } } },
      }),
      this.prisma.author.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  /** Author profile plus their published work, for the public author page. */
  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { deletedAt: null, status: ContentStatus.PUBLISHED },
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            publishedAt: true,
            readMinutes: true,
            category: { select: { slug: true, name: true } },
          },
          orderBy: { publishedAt: 'desc' },
          take: 24,
        },
        research: {
          where: { deletedAt: null, status: ContentStatus.PUBLISHED },
          select: { id: true, slug: true, title: true, publishedAt: true },
          orderBy: { publishedAt: 'desc' },
          take: 12,
        },
      },
    });

    if (!author) {
      throw new NotFoundException({ message: 'Author not found', code: 'NOT_FOUND' });
    }
    return author;
  }

  async create(dto: CreateAuthorDto, context: AuditContext) {
    const slug = await this.slugs.unique('author', dto.slug ?? dto.name);
    const author = await this.prisma.author.create({ data: { ...dto, slug } });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Author',
      entityId: author.id,
      summary: `Created author "${author.name}"`,
      context,
    });

    return author;
  }

  async update(id: string, dto: UpdateAuthorDto, context: AuditContext) {
    const existing = await this.prisma.author.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Author not found', code: 'NOT_FOUND' });
    }

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await this.slugs.unique('author', dto.slug, id)
        : undefined;

    const author = await this.prisma.author.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'Author',
      entityId: id,
      summary: `Updated author "${author.name}"`,
      context,
    });

    return author;
  }

  /**
   * Refuses to delete an author who still has content.
   *
   * The schema would set those articles' authorId to null, silently stripping
   * bylines from published work. Reassign first.
   */
  async remove(id: string, context: AuditContext) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { _count: { select: { articles: true, research: true } } },
    });
    if (!author) {
      throw new NotFoundException({ message: 'Author not found', code: 'NOT_FOUND' });
    }

    const attached = author._count.articles + author._count.research;
    if (attached > 0) {
      throw new BadRequestException({
        message: `"${author.name}" is credited on ${attached} item(s). Reassign them before deleting.`,
        code: 'AUTHOR_IN_USE',
      });
    }

    await this.prisma.author.delete({ where: { id } });

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Author',
      entityId: id,
      summary: `Deleted author "${author.name}"`,
      context,
    });
  }
}
