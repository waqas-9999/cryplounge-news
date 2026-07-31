import { BadRequestException, Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

/**
 * The editorial workflow, in one place.
 *
 * Six content types share these rules. Encoding them here means a fix applies
 * everywhere at once, and an illegal transition is impossible to express by
 * accident in a module.
 */
@Injectable()
export class PublishingService {
  /**
   * Legal transitions. Anything absent is rejected.
   *
   * ARCHIVED can only return to DRAFT: reviving straight to PUBLISHED would
   * skip review and silently re-expose content that was pulled for a reason.
   */
  private static readonly TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
    [ContentStatus.DRAFT]: [ContentStatus.REVIEW, ContentStatus.SCHEDULED, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED],
    [ContentStatus.REVIEW]: [ContentStatus.DRAFT, ContentStatus.SCHEDULED, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED],
    [ContentStatus.SCHEDULED]: [ContentStatus.DRAFT, ContentStatus.REVIEW, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED],
    [ContentStatus.PUBLISHED]: [ContentStatus.DRAFT, ContentStatus.ARCHIVED],
    [ContentStatus.ARCHIVED]: [ContentStatus.DRAFT],
  };

  /** Transitions that require the `content.publish` permission. */
  private static readonly NEEDS_PUBLISH_RIGHTS: ContentStatus[] = [
    ContentStatus.PUBLISHED,
    ContentStatus.SCHEDULED,
  ];

  assertTransition(from: ContentStatus, to: ContentStatus): void {
    if (from === to) return;

    const allowed = PublishingService.TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException({
        message: `Cannot move content from ${from} to ${to}`,
        code: 'INVALID_STATUS_TRANSITION',
      });
    }
  }

  requiresPublishPermission(to: ContentStatus): boolean {
    return PublishingService.NEEDS_PUBLISH_RIGHTS.includes(to);
  }

  /**
   * Derives the timestamps a status change implies.
   *
   * `publishedAt` is set once and preserved afterwards — it is the date of
   * record for the article, and an unpublish/republish cycle must not silently
   * rewrite publication history.
   */
  resolveDates(params: {
    status: ContentStatus;
    currentPublishedAt: Date | null;
    scheduledFor?: Date | null;
  }): { publishedAt: Date | null; scheduledFor: Date | null } {
    const { status, currentPublishedAt, scheduledFor } = params;

    if (status === ContentStatus.SCHEDULED) {
      if (!scheduledFor) {
        throw new BadRequestException({
          message: 'scheduledFor is required when status is SCHEDULED',
          code: 'SCHEDULE_DATE_REQUIRED',
        });
      }
      if (scheduledFor.getTime() <= Date.now()) {
        throw new BadRequestException({
          message: 'scheduledFor must be in the future',
          code: 'SCHEDULE_DATE_IN_PAST',
        });
      }
      return { publishedAt: currentPublishedAt, scheduledFor };
    }

    if (status === ContentStatus.PUBLISHED) {
      return { publishedAt: currentPublishedAt ?? new Date(), scheduledFor: null };
    }

    return { publishedAt: currentPublishedAt, scheduledFor: null };
  }

  /** Only PUBLISHED content is visible to anonymous callers. */
  isPubliclyVisible(status: ContentStatus): boolean {
    return status === ContentStatus.PUBLISHED;
  }
}
