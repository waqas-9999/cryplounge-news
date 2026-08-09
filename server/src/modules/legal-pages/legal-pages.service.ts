import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, ContentStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';
import { SlugService } from '../content-core/slug.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { CreateLegalPageDto, UpdateLegalPageDto } from './dto/legal-page.dto';

/**
 * Legal / policy pages (Terms, Privacy, editorial policies, ...).
 *
 * Content is authored entirely from the admin panel — nothing here is
 * hardcoded in the frontend, so Legal or Editorial can amend wording without
 * a deploy.
 */
@Injectable()
export class LegalPagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugs: SlugService,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly audit: AuditService
  ) {}

  /** Published pages only, for the public nav/footer pickers. */
  list() {
    return this.prisma.legalPage.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { id: true, slug: true, title: true, updatedAt: true },
      orderBy: { title: 'asc' },
    });
  }

  listForAdmin() {
    return this.prisma.legalPage.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async bySlug(slug: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { slug } });
    if (!page || page.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException({ message: 'Page not found', code: 'NOT_FOUND' });
    }
    return page;
  }

  async byId(id: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException({ message: 'Page not found', code: 'NOT_FOUND' });
    }
    return page;
  }

  async create(dto: CreateLegalPageDto, user: AuthenticatedUser, context: AuditContext) {
    const slug = await this.slugs.unique('legalPage', dto.slug || dto.title);
    const status = dto.status ?? ContentStatus.DRAFT;

    const page = await this.prisma.legalPage.create({
      data: {
        slug,
        title: dto.title,
        content: this.sanitizer.sanitize(dto.content),
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        updatedById: user.id,
      },
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'LegalPage',
      entityId: page.id,
      summary: `Created page "${page.title}"`,
      context,
    });

    return page;
  }

  async update(id: string, dto: UpdateLegalPageDto, user: AuthenticatedUser, context: AuditContext) {
    const existing = await this.byId(id);

    const nextStatus = dto.status ?? existing.status;
    const becomingPublished =
      nextStatus === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED;

    const slug =
      dto.slug !== undefined ? await this.slugs.unique('legalPage', dto.slug, id) : undefined;

    const page = await this.prisma.legalPage.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(dto.content !== undefined ? { content: this.sanitizer.sanitize(dto.content) } : {}),
        ...(dto.status !== undefined ? { status: nextStatus } : {}),
        ...(becomingPublished ? { publishedAt: new Date() } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
        updatedById: user.id,
      },
    });

    await this.audit.record({
      action: dto.status !== undefined ? AuditAction.PUBLISH : AuditAction.UPDATE,
      entity: 'LegalPage',
      entityId: page.id,
      summary: `Updated page "${page.title}"`,
      context,
    });

    return page;
  }

  async delete(id: string, context: AuditContext) {
    const page = await this.byId(id);
    await this.prisma.legalPage.delete({ where: { id } });

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'LegalPage',
      entityId: id,
      summary: `Deleted page "${page.title}"`,
      context,
    });
  }
}
