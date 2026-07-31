import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryKind } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  CreateCategoryDto,
  CreateLabelDto,
  CreateTagDto,
  UpdateCategoryDto,
  UpdateLabelDto,
  UpdateTagDto,
} from './dto/taxonomy.dto';

/**
 * Categories, tags and labels.
 *
 * One category table discriminated by `kind` rather than six near-identical
 * tables, which is what makes "manage once, use everywhere" true rather than
 * aspirational. Tags and labels are global by design.
 */
@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------------------- categories --- */

  async listCategories(kind?: CategoryKind) {
    return this.prisma.category.findMany({
      where: kind ? { kind } : undefined,
      orderBy: [{ kind: 'asc' }, { position: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { articles: true, research: true, regulations: true, projects: true, events: true },
        },
      },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: { ...dto, position: dto.position ?? 0 } });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  /**
   * Deleting a category detaches it from content rather than cascading — the
   * schema uses SetNull. Content survives; it simply becomes uncategorised,
   * which the site-health report then surfaces.
   */
  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
  }

  /* ---------------------------------------------------------------- tags --- */

  async listTags(search?: string) {
    return this.prisma.tag.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: true,
            projects: true,
            research: true,
            regulations: true,
            events: true,
            founders: true,
          },
        },
      },
    });
  }

  async createTag(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: dto });
  }

  async updateTag(id: string, dto: UpdateTagDto) {
    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });
  }

  /**
   * Merge duplicates: everything tagged `source` is re-tagged `target`, then
   * `source` is deleted.
   *
   * Runs in a transaction — a half-merged tag would silently lose content from
   * listings.
   */
  async mergeTags(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      throw new BadRequestException({
        message: 'Cannot merge a tag into itself',
        code: 'INVALID_MERGE',
      });
    }

    return this.prisma.$transaction(async tx => {
      const source = await tx.tag.findUniqueOrThrow({
        where: { id: sourceId },
        include: {
          articles: { select: { id: true } },
          projects: { select: { id: true } },
          research: { select: { id: true } },
          regulations: { select: { id: true } },
          events: { select: { id: true } },
          founders: { select: { id: true } },
        },
      });
      await tx.tag.findUniqueOrThrow({ where: { id: targetId } });

      await tx.tag.update({
        where: { id: targetId },
        data: {
          articles: { connect: source.articles.map(r => ({ id: r.id })) },
          projects: { connect: source.projects.map(r => ({ id: r.id })) },
          research: { connect: source.research.map(r => ({ id: r.id })) },
          regulations: { connect: source.regulations.map(r => ({ id: r.id })) },
          events: { connect: source.events.map(r => ({ id: r.id })) },
          founders: { connect: source.founders.map(r => ({ id: r.id })) },
        },
      });

      await tx.tag.delete({ where: { id: sourceId } });

      return tx.tag.findUniqueOrThrow({ where: { id: targetId } });
    });
  }

  /* -------------------------------------------------------------- labels --- */

  async listLabels() {
    return this.prisma.label.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  }

  async createLabel(dto: CreateLabelDto) {
    return this.prisma.label.create({ data: dto });
  }

  async updateLabel(id: string, dto: UpdateLabelDto) {
    return this.prisma.label.update({ where: { id }, data: dto });
  }

  async deleteLabel(id: string) {
    await this.prisma.label.delete({ where: { id } });
  }
}
