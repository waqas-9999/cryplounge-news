import { NotFoundException } from '@nestjs/common';
import { Paginated } from '@/common/dto/api-response.dto';
import type { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * The subset of a Prisma model delegate this base needs. Typing against this
 * rather than a concrete delegate keeps the base reusable across every model
 * without a generic explosion.
 */
export interface PrismaDelegate {
  findMany(args?: any): Promise<any[]>;
  findFirst(args?: any): Promise<any | null>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  count(args?: any): Promise<number>;
}

export interface ListOptions {
  /** Extra filter merged into the where clause. */
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  /** Columns a free-text `search` looks at. */
  searchFields?: string[];
  /** Columns clients may sort by. Anything else is rejected. */
  sortableFields?: string[];
  /** Set false for models without a deletedAt column. */
  softDelete?: boolean;
}

/**
 * Shared CRUD for every content type.
 *
 * The brief's rule is "never duplicate business logic" — pagination, search,
 * sort whitelisting, soft-delete filtering and not-found handling are
 * identical for articles, projects, research, regulations, events and
 * founders, so they live here once.
 *
 * Modules extend this and add only what is genuinely their own.
 */
export abstract class BaseCrudService {
  protected constructor(
    protected readonly delegate: PrismaDelegate,
    /** Used in error messages: "Article not found". */
    protected readonly entityName: string
  ) {}

  /** Paginated, filtered, sorted list. */
  async listPaginated<T>(
    query: PaginationQueryDto,
    options: ListOptions = {}
  ): Promise<Paginated<T>> {
    const where = this.buildWhere(query, options);
    const orderBy = this.buildOrderBy(query, options);

    const [items, total] = await Promise.all([
      this.delegate.findMany({
        where,
        ...(options.include ? { include: options.include } : {}),
        ...(options.select ? { select: options.select } : {}),
        orderBy,
        skip: query.skip,
        take: query.take,
      }),
      this.delegate.count({ where }),
    ]);

    return Paginated.from<T>(items, total, query.page, query.perPage);
  }

  /** Throws 404 rather than returning null — callers should not repeat that check. */
  async findByIdOrFail<T>(
    id: string,
    options: { include?: Record<string, unknown>; softDelete?: boolean } = {}
  ): Promise<T> {
    const record = await this.delegate.findFirst({
      where: {
        id,
        ...(options.softDelete === false ? {} : { deletedAt: null }),
      },
      ...(options.include ? { include: options.include } : {}),
    });

    if (!record) {
      throw new NotFoundException({
        message: `${this.entityName} not found`,
        code: 'NOT_FOUND',
      });
    }
    return record as T;
  }

  async findBySlugOrFail<T>(
    slug: string,
    options: { include?: Record<string, unknown>; where?: Record<string, unknown> } = {}
  ): Promise<T> {
    const record = await this.delegate.findFirst({
      where: { slug, deletedAt: null, ...options.where },
      ...(options.include ? { include: options.include } : {}),
    });

    if (!record) {
      throw new NotFoundException({
        message: `${this.entityName} not found`,
        code: 'NOT_FOUND',
      });
    }
    return record as T;
  }

  /**
   * Soft delete. The row is retained so the action is reversible and any
   * inbound link can still be resolved to an explanation rather than a 404
   * with no history.
   */
  async softDelete(id: string, deletedById?: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.delegate.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    });
  }

  async restore(id: string): Promise<void> {
    const record = await this.delegate.findFirst({ where: { id } });
    if (!record) {
      throw new NotFoundException({
        message: `${this.entityName} not found`,
        code: 'NOT_FOUND',
      });
    }
    await this.delegate.update({
      where: { id },
      data: { deletedAt: null, deletedById: null },
    });
  }

  protected buildWhere(
    query: PaginationQueryDto,
    options: ListOptions
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {
      ...(options.softDelete === false ? {} : { deletedAt: null }),
      ...options.where,
    };

    const term = query.search?.trim();
    if (term && options.searchFields?.length) {
      where.OR = options.searchFields.map(field => ({
        [field]: { contains: term, mode: 'insensitive' },
      }));
    }

    return where;
  }

  /**
   * Sorting is whitelisted. Passing an arbitrary column through to Prisma
   * lets a client order by a field they cannot read and infer its values.
   */
  protected buildOrderBy(
    query: PaginationQueryDto,
    options: ListOptions
  ): Record<string, unknown> | Record<string, unknown>[] {
    if (query.sortBy && options.sortableFields?.includes(query.sortBy)) {
      return { [query.sortBy]: query.sortOrder };
    }
    return options.orderBy ?? { createdAt: 'desc' };
  }
}
