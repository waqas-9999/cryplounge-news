import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { readImageDimensions } from './image-dimensions';
import { AuditAction, Prisma } from '@prisma/client';
import { storageConfig } from '@/config/configuration';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { STORAGE_PROVIDER, type StorageProvider } from './storage/storage.provider';
import type { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';

/**
 * Magic-byte signatures.
 *
 * The declared MIME type comes from the client and is trivially forged, so
 * every upload is additionally sniffed. This is what stops an executable or
 * HTML file arriving labelled `image/png`.
 */
const SIGNATURES: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', test: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    test: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  { mime: 'image/gif', test: b => b.subarray(0, 3).toString('ascii') === 'GIF' },
  {
    mime: 'image/webp',
    test: b =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    mime: 'image/avif',
    test: b => b.subarray(4, 8).toString('ascii') === 'ftyp' && b.subarray(8, 12).toString('ascii').startsWith('avif'),
  },
];

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(storageConfig.KEY) private readonly config: ConfigType<typeof storageConfig>
  ) {}

  async list(query: MediaQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.MediaWhereInput = {
      deletedAt: null,
      ...(query.folder ? { folder: query.folder } : {}),
      ...(query.mimeType ? { mimeType: { startsWith: query.mimeType } } : {}),
      ...(query.search
        ? {
            OR: [
              { filename: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
              { altText: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include: { uploadedBy: { select: { id: true, name: true } } },
      }),
      this.prisma.media.count({ where }),
    ]);

    return Paginated.from(
      items.map(item => ({ ...item, url: this.storage.url(item.path) })),
      total,
      query.page,
      query.perPage
    );
  }

  async findById(id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    if (!media) throw new NotFoundException({ message: 'File not found', code: 'NOT_FOUND' });

    return { ...media, url: this.storage.url(media.path), usage: await this.usage(id) };
  }

  /**
   * Where a file is referenced.
   *
   * Powers the "used in" panel and the deletion guard — an editor should never
   * be able to break a published page by tidying the library.
   */
  async usage(id: string) {
    const [articles, projectLogos, projectCovers, research, events, founders] = await Promise.all([
      this.prisma.article.findMany({
        where: { featuredImageId: id, deletedAt: null },
        select: { id: true, slug: true, title: true },
      }),
      this.prisma.project.findMany({
        where: { logoImageId: id, deletedAt: null },
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.project.findMany({
        where: { coverImageId: id, deletedAt: null },
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.research.findMany({
        where: { coverImageId: id, deletedAt: null },
        select: { id: true, slug: true, title: true },
      }),
      this.prisma.event.findMany({
        where: { bannerImageId: id, deletedAt: null },
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.founder.findMany({
        where: { photoId: id, deletedAt: null },
        select: { id: true, slug: true, name: true },
      }),
    ]);

    const total =
      articles.length +
      projectLogos.length +
      projectCovers.length +
      research.length +
      events.length +
      founders.length;

    return { total, articles, projectLogos, projectCovers, research, events, founders };
  }

  async upload(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { folder?: string; altText?: string; title?: string },
    user: AuthenticatedUser,
    context: AuditContext
  ) {
    this.assertAcceptable(file);

    const stored = await this.storage.save({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: options.folder ?? 'general',
    });

    // Read from the stored bytes, never from the request: a caller that is
    // wrong or lying would have the page reserve the wrong space, and the
    // value is persisted as though it were a property of the image.
    const dimensions = readImageDimensions(file.buffer, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        path: stored.path,
        ...(dimensions ?? {}),
        filename: file.originalname.slice(0, 255),
        mimeType: file.mimetype,
        size: stored.size,
        altText: options.altText,
        title: options.title,
        folder: options.folder ?? '/',
        uploadedById: user.id,
      },
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Media',
      entityId: media.id,
      summary: `Uploaded "${media.filename}"`,
      context,
    });

    return { ...media, url: this.storage.url(media.path) };
  }

  /**
   * For anonymous public submissions (event banners, etc). No `uploadedById`
   * and no `AuditContext` — there's no authenticated actor to attribute it to.
   */
  async uploadAnonymous(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { folder: string }
  ) {
    this.assertAcceptable(file);

    const stored = await this.storage.save({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: options.folder,
    });

    // Read from the stored bytes, never from the request: a caller that is
    // wrong or lying would have the page reserve the wrong space, and the
    // value is persisted as though it were a property of the image.
    const dimensions = readImageDimensions(file.buffer, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        path: stored.path,
        ...(dimensions ?? {}),
        filename: file.originalname.slice(0, 255),
        mimeType: file.mimetype,
        size: stored.size,
        folder: options.folder,
      },
    });

    return { ...media, url: this.storage.url(media.path) };
  }

  /**
   * An upload from an AI agent.
   *
   * Distinct from `uploadAnonymous` only in that it carries alt text, which
   * matters: an editorial banner without a description is inaccessible, and
   * the agent is the only thing that knows what it drew.
   *
   * Runs `assertAcceptable` and the same storage path as every other upload,
   * so the mime allowlist and the extension restriction both still apply.
   */
  async uploadForAgent(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { folder: string; altText?: string; title?: string }
  ) {
    this.assertAcceptable(file);

    const stored = await this.storage.save({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: options.folder,
    });

    // Read from the stored bytes, never from the request: a caller that is
    // wrong or lying would have the page reserve the wrong space, and the
    // value is persisted as though it were a property of the image.
    const dimensions = readImageDimensions(file.buffer, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        path: stored.path,
        ...(dimensions ?? {}),
        filename: file.originalname.slice(0, 255),
        mimeType: file.mimetype,
        size: stored.size,
        altText: options.altText,
        title: options.title,
        folder: options.folder,
      },
    });

    return { ...media, url: this.storage.url(media.path) };
  }

  /**
   * Stores an AI-generated candidate.
   *
   * Deliberately a sibling of `uploadForAgent` rather than a flag on it: the
   * provenance columns only make sense for generated images, and a shared
   * method would need every caller to pass nulls for fields that do not apply
   * to a file a human uploaded.
   *
   * `generatedForArticleId` is what makes the attach endpoint safe. A
   * candidate records the article it was made for, so attaching it elsewhere
   * can be refused server-side instead of trusting the browser's `mediaId`.
   */
  async saveGeneratedCandidate(params: {
    buffer: Buffer;
    mimeType: string;
    articleId: string;
    altText?: string;
    provider: string;
    model: string;
    reviewScore?: number;
  }) {
    const file = {
      buffer: params.buffer,
      originalname: `ai-${params.articleId}-${Date.now()}.webp`,
      mimetype: params.mimeType,
      size: params.buffer.length,
    };
    this.assertAcceptable(file);

    const stored = await this.storage.save({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: '/articles',
    });

    // From the bytes, never from the generator's claim about them.
    const dimensions = readImageDimensions(file.buffer, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        path: stored.path,
        ...(dimensions ?? {}),
        filename: file.originalname,
        mimeType: file.mimetype,
        size: stored.size,
        altText: params.altText,
        folder: '/articles',
        isAiGenerated: true,
        generationProvider: params.provider,
        generationModel: params.model,
        // Only an approved candidate is ever persisted: the AI service returns
        // 422 with no image when nothing survived review, so a rejected frame
        // never reaches this method and cannot acquire a row to attach.
        reviewStatus: 'APPROVED',
        reviewScore: params.reviewScore,
        reviewReasons: [],
        generatedForArticleId: params.articleId,
      },
    });

    return { ...media, url: this.storage.url(media.path) };
  }

  /** Candidates generated for one article, newest first. */
  async candidatesForArticle(articleId: string, limit = 12) {
    const items = await this.prisma.media.findMany({
      where: { generatedForArticleId: articleId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map(item => ({ ...item, url: this.storage.url(item.path) }));
  }

  async update(id: string, dto: UpdateMediaDto, context: AuditContext) {
    await this.findById(id);

    const media = await this.prisma.media.update({ where: { id }, data: dto });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'Media',
      entityId: id,
      summary: `Updated metadata for "${media.filename}"`,
      context,
    });

    return { ...media, url: this.storage.url(media.path) };
  }

  /**
   * Delete a file.
   *
   * Refused while the file is still referenced, unless `force` is passed —
   * deleting an in-use image silently breaks published pages, so it must be a
   * deliberate act rather than a default.
   *
   * The row is soft-deleted and the bytes are removed only when nothing
   * references it.
   */
  async remove(
    id: string,
    options: { force?: boolean },
    user: AuthenticatedUser,
    context: AuditContext
  ) {
    const media = await this.prisma.media.findFirst({ where: { id, deletedAt: null } });
    if (!media) throw new NotFoundException({ message: 'File not found', code: 'NOT_FOUND' });

    const usage = await this.usage(id);
    if (usage.total > 0 && !options.force) {
      throw new BadRequestException({
        message: `"${media.filename}" is used by ${usage.total} item(s). Replace those references, or pass force to delete anyway.`,
        code: 'MEDIA_IN_USE',
        errors: { usage: [`${usage.total} reference(s)`] },
      });
    }

    await this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: user.id },
    });

    if (usage.total === 0) {
      await this.storage.delete(media.path);
    }

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Media',
      entityId: id,
      summary: `Deleted "${media.filename}"${usage.total > 0 ? ' (was in use)' : ''}`,
      context,
    });
  }

  /** Folder list with counts, for the library sidebar. */
  async folders() {
    const rows = await this.prisma.media.groupBy({
      by: ['folder'],
      where: { deletedAt: null },
      _count: { _all: true },
      _sum: { size: true },
    });

    return rows
      .map(row => ({
        folder: row.folder,
        count: row._count._all,
        bytes: row._sum.size ?? 0,
      }))
      .sort((a, b) => a.folder.localeCompare(b.folder));
  }

  /** Totals for the dashboard's storage widget. */
  async storageStats() {
    const [aggregate, unused] = await Promise.all([
      this.prisma.media.aggregate({
        where: { deletedAt: null },
        _count: { _all: true },
        _sum: { size: true },
      }),
      this.countUnused(),
    ]);

    return {
      files: aggregate._count._all,
      bytes: aggregate._sum.size ?? 0,
      unused,
    };
  }

  /** Files nothing references — the "unused images" report. */
  private async countUnused(): Promise<number> {
    return this.prisma.media.count({
      where: {
        deletedAt: null,
        articleFeatures: { none: {} },
        projectLogos: { none: {} },
        projectCovers: { none: {} },
        researchCovers: { none: {} },
        eventBanners: { none: {} },
        founderPhotos: { none: {} },
      },
    });
  }

  /**
   * Size, declared type and actual content must all be acceptable.
   *
   * The magic-byte check is the one that matters: without it, `mimetype` is
   * simply whatever the client claimed.
   */
  private assertAcceptable(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): void {
    if (!file.buffer?.length) {
      throw new BadRequestException({ message: 'File is empty', code: 'EMPTY_FILE' });
    }

    if (file.size > this.config.maxBytes) {
      const limitMb = Math.round(this.config.maxBytes / (1024 * 1024));
      throw new BadRequestException({
        message: `File exceeds the ${limitMb} MB limit`,
        code: 'FILE_TOO_LARGE',
      });
    }

    const allowed = this.config.allowedMimeTypes as readonly string[];
    if (!allowed.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        message: `Unsupported type ${file.mimetype}`,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      });
    }

    const detected = SIGNATURES.find(signature => signature.test(file.buffer));
    if (!detected || detected.mime !== file.mimetype) {
      throw new UnsupportedMediaTypeException({
        message: 'File content does not match its declared type',
        code: 'CONTENT_TYPE_MISMATCH',
      });
    }
  }
}
