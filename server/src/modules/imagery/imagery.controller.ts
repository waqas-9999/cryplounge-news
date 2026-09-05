import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { ImageryClient } from './imagery.client';
import { MediaService } from '../media/media.service';
import { GenerateVisualDto } from './dto/generate-visual.dto';
import { AttachVisualDto } from './dto/attach-visual.dto';

/**
 * Requesting an editorial image for an article.
 *
 * ## The article is the source of truth, not the request body
 *
 * The headline, summary and category are read from the database using the
 * `articleId` in the path — never taken from the caller. A browser that could
 * supply its own headline could steer the image away from the story it will
 * be published against, and the visual brief would be describing an article
 * that does not exist.
 *
 * The one thing a caller may contribute is `visualSubject`: a hint about what
 * to show. It is passed as editorial context and still travels through the
 * whole prompt and safety chain in `cryplounge-ai`; it is not a prompt and
 * cannot bypass anything.
 *
 * ## Nothing is attached here
 *
 * This returns a candidate. Attaching it to the article, replacing an
 * existing featured image and any versioning belong to the Image Studio
 * phase, where a human makes that choice explicitly.
 */

/**
 * Normalises an editor's direction before it reaches the imagery pipeline.
 *
 * The field is *guidance*, not a prompt: it is appended to the article-derived
 * brief in `cryplounge-ai` and the assembled result still runs through
 * `validateImagePrompt`, so a request for a logo or a chart is refused there
 * and, failing that, caught by the vision reviewer on the generated pixels.
 *
 * What this function adds is the cheap first pass — collapsing newlines and
 * control characters that exist only to break the prompt's structure, and
 * capping the length so a direction cannot crowd out the safety block during
 * prompt compression.
 */
export function sanitiseDirection(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const cleaned = raw
    // Control characters and newlines: a direction is one sentence, and
    // multi-line input is how a caller tries to fake a new prompt section.
    // Mapped to a space rather than dropped: deleting a newline welds the
    // words either side of it together, turning "wider" and "shot" into
    // "widershot" and quietly changing what the editor asked for.
    .split("")
    .map(char => {
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : char;
    })
    .join("")
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return undefined;
  return cleaned.slice(0, 300);
}

@ApiTags('News')
@Controller('articles')
export class ImageryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagery: ImageryClient,
    private readonly media: MediaService
  ) {}

  @Post(':articleId/visual/generate')
  @ApiBearerAuth()
  @RequirePermissions('news.update')
  @ResponseMessage('Image candidate')
  @ApiOperation({ summary: 'Generate an editorial image candidate for an article' })
  async generate(@Param('articleId') articleId: string, @Body() body: GenerateVisualDto) {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true, title: true, summary: true, category: { select: { slug: true } } },
    });

    if (!article) throw new NotFoundException('Article not found');

    const result = await this.imagery.generate({
      articleId: article.id,
      headline: article.title,
      summary: article.summary ?? undefined,
      category: article.category?.slug ?? 'technology',
      visualSubject: sanitiseDirection(body.visualSubject),
    });

    if (!result.approved) {
      // An editorial rejection is a 422 the editor can act on; everything else
      // is an outage they cannot.
      if (result.failure === 'rejected') {
        throw new UnprocessableEntityException({
          message: 'No image passed editorial review',
          reasons: result.reasons,
        });
      }
      throw new ServiceUnavailableException({
        message: 'Image generation is unavailable',
        failure: result.failure,
      });
    }

    /*
     * Persisted immediately, and only on the approved path. A rejected result
     * never reaches here — the AI service answers 422 with no image — so a
     * refused frame can never acquire a Media row, which is what makes
     * "rejected images cannot be attached" true in the database rather than
     * only in the UI.
     */
    const media = await this.media.saveGeneratedCandidate({
      buffer: Buffer.from(result.candidate.data, 'base64'),
      mimeType: result.candidate.mimeType,
      articleId: article.id,
      altText: result.candidate.altText,
      provider: result.provider,
      model: result.model,
      reviewScore: result.qualityScore,
    });

    return {
      candidate: {
        id: media.id,
        url: media.url,
        width: media.width,
        height: media.height,
        altText: media.altText,
      },
      provider: result.provider,
      model: result.model,
      qualityScore: result.qualityScore,
      durationMs: result.durationMs,
      reviewStatus: media.reviewStatus,
      isAiGenerated: true,
      /** Explicit: attaching is a separate, deliberate act by the editor. */
      attached: false,
    };
  }

  @Get(':articleId/visual/candidates')
  @ApiBearerAuth()
  @RequirePermissions('news.read')
  @ResponseMessage('Image candidates')
  @ApiOperation({ summary: 'List generated image candidates for an article' })
  async candidates(@Param('articleId') articleId: string) {
    return this.media.candidatesForArticle(articleId);
  }

  /**
   * Attaches a candidate as the article's featured image.
   *
   * Every check here is server-side on purpose. The browser sends a `mediaId`
   * and nothing else is trusted: a hand-edited request naming a rejected
   * candidate, or one belonging to a different article, is refused here rather
   * than relying on a disabled button.
   *
   * The previous featured image is left in place as a row. Nothing is deleted,
   * so switching back is possible and the article's image history survives.
   */
  @Post(':articleId/visual/attach')
  @ApiBearerAuth()
  @RequirePermissions('news.update')
  @ResponseMessage('Image attached')
  @ApiOperation({ summary: 'Attach a generated candidate as the featured image' })
  async attach(@Param('articleId') articleId: string, @Body() body: AttachVisualDto) {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true, featuredImageId: true },
    });
    if (!article) throw new NotFoundException('Article not found');

    const media = await this.prisma.media.findFirst({
      where: { id: body.mediaId, deletedAt: null },
    });
    if (!media) throw new NotFoundException('Image not found');

    if (!media.mimeType.startsWith('image/')) {
      throw new BadRequestException('That file is not an image');
    }

    /*
     * A generated candidate may only be attached to the article it was
     * generated for, and only if it was approved. An image uploaded by a human
     * carries neither field and is attached on the existing rules, so this
     * does not change ordinary editorial behaviour.
     */
    if (media.isAiGenerated) {
      if (media.reviewStatus !== 'APPROVED') {
        throw new ForbiddenException('That image did not pass editorial visual review');
      }
      if (media.generatedForArticleId && media.generatedForArticleId !== article.id) {
        throw new ForbiddenException('That image was generated for a different article');
      }
    }

    const updated = await this.prisma.article.update({
      where: { id: article.id },
      data: { featuredImageId: media.id },
      select: { id: true, featuredImageId: true, status: true },
    });

    return {
      articleId: updated.id,
      featuredImageId: updated.featuredImageId,
      previousFeaturedImageId: article.featuredImageId,
      /** Unchanged by design: attaching an image never publishes anything. */
      status: updated.status,
    };
  }
}
