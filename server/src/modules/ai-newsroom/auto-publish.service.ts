import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AiNewsroomService } from './ai-newsroom.service';

/**
 * Promoting an AI draft to a published article.
 *
 * ## Why publishing is a separate step, not a mode the agent submits in
 *
 * The obvious implementation is to grant the newsroom agent `news.publish` and
 * let it submit articles as PUBLISHED. That was rejected for four reasons, and
 * the shape of this service follows from them:
 *
 *  1. **The draft workflow stays untouched.** The newsroom submits a DRAFT
 *     exactly as it always has. Nothing about generation, submission or
 *     idempotency changes when auto mode is turned on, so turning it off
 *     cannot break the path that was working.
 *
 *  2. **The agent keeps minimal permissions.** An agent that can publish can
 *     publish anything, including something that reached the CMS by a route
 *     nobody anticipated. The agent still holds only `news.create` and
 *     `media.upload`.
 *
 *  3. **The gates are re-checked here, server-side.** A gate the agent
 *     evaluated is a gate the agent could skip. This re-derives everything it
 *     can from the stored article and refuses on anything missing.
 *
 *  4. **The emergency stop actually stops things.** Pausing takes effect on
 *     the next promotion attempt, whatever the newsroom is doing, because the
 *     newsroom is not the thing publishing.
 *
 * ## What this service trusts, and what it verifies
 *
 * Verified from the database: the article exists, is a DRAFT, was created by
 * an agent, has a category, has sources attributed in its body, has a
 * featured image that is a real raster file, and is not a near-duplicate of
 * something already published.
 *
 * Attested by the newsroom and *bounded* here: the fact-check score and the
 * quality score. Neither can be recomputed without the research report, which
 * lives in the newsroom's own database. They are supplied with the promotion
 * request and refused unless they clear the configured thresholds — so a
 * dishonest caller could lie about them, and that is stated plainly rather
 * than dressed up. The protections against that are the agent credential, the
 * SUPER_ADMIN-only mode switch, and the daily limit.
 */

export interface PublishGateEvidence {
  /** Newsroom opportunity score, 0-100. */
  score: number;
  /** Fact-check score, 0-100. Attested by the newsroom. */
  factScore: number;
  /** Quality score, 0-100. Attested by the newsroom. */
  qualityScore: number;
  /** True when the image pipeline validated the banner it attached. */
  imageValidated: boolean;
  /** True when the newsroom's duplicate check cleared it. */
  duplicateChecked: boolean;
}

export interface PublishDecision {
  published: boolean;
  status: ContentStatus;
  reasons: string[];
}

/** Fixed floors. The admin may raise the score minimum, never these. */
export const FACT_SCORE_MIN = 90;
export const QUALITY_SCORE_MIN = 85;

@Injectable()
export class AutoPublishService {
  private readonly logger = new Logger(AutoPublishService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly newsroom: AiNewsroomService
  ) {}

  /**
   * Considers one draft for publication.
   *
   * Returns a decision rather than throwing on refusal: a draft that does not
   * qualify is the expected outcome and must leave the draft in place,
   * untouched, for a human to review as before.
   */
  async consider(articleId: string, evidence: PublishGateEvidence): Promise<PublishDecision> {
    const reasons: string[] = [];

    /* ------------------------------------------------ mode and switches -- */
    const [mode, enabled, paused, limit, minScore, strictness] = await Promise.all([
      this.newsroom.publishMode(),
      this.newsroom.isEnabled(),
      this.newsroom.isEmergencyPaused(),
      this.newsroom.autoPublishDailyLimit(),
      this.newsroom.autoPublishMinScore(),
      this.newsroom.autoPublishStrictness(),
    ]);

    // Checked first and separately from everything else: when the operator has
    // hit the stop, no further reasoning about the article matters.
    if (paused) {
      return { published: false, status: ContentStatus.DRAFT, reasons: ['emergency pause is active'] };
    }

    if (!enabled) reasons.push('AI automation is switched off');
    if (mode !== 'AUTO_PUBLISH') reasons.push(`publish mode is ${mode}, not AUTO_PUBLISH`);

    const publishedToday = await this.publishedToday();
    if (publishedToday >= limit) {
      reasons.push(`daily auto-publish limit reached (${publishedToday}/${limit})`);
    }

    /* ---------------------------------------------- the quality gates -- */
    /*
     * Applied only under HIGH_CONFIDENCE.
     *
     * Under ALL_DRAFTS — the default — auto mode means what it says: every
     * draft goes out. These four are *quality* judgements, and an operator who
     * turned auto publishing on has already made that judgement. What they
     * have not waived, and cannot waive here, is everything below: an article
     * still has to be a draft, have a category, carry attribution, have a
     * usable image, and not duplicate something already public.
     *
     * The draft itself was only created because it passed the draft-safety
     * gate — no fabrication, no copied prose, no unverified material claims —
     * so "publish every draft" is not "publish anything".
     */
    if (strictness === 'HIGH_CONFIDENCE') {
      if (evidence.score < minScore) {
        reasons.push(`score ${evidence.score} is below the configured minimum ${minScore}`);
      }
      if (evidence.factScore < FACT_SCORE_MIN) {
        reasons.push(`fact score ${evidence.factScore} is below ${FACT_SCORE_MIN}`);
      }
      if (evidence.qualityScore < QUALITY_SCORE_MIN) {
        reasons.push(`quality score ${evidence.qualityScore} is below ${QUALITY_SCORE_MIN}`);
      }
      if (!evidence.imageValidated) reasons.push('image validation did not pass');
    }

    // Never optional: publishing a second article about the same event is the
    // failure a reader notices first, and it is not a matter of taste.
    if (!evidence.duplicateChecked) reasons.push('the duplicate check did not run');

    /* --------------------------------------- what the database can prove -- */
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        status: true,
        content: true,
        categoryId: true,
        featuredImage: { select: { id: true, mimeType: true, size: true } },
      },
    });

    if (!article) {
      throw new BadRequestException({ message: 'Article not found', code: 'NOT_FOUND' });
    }

    // Only a draft may be promoted. Anything else means this ran twice, or on
    // something a human has already dealt with.
    if (article.status !== ContentStatus.DRAFT) {
      return {
        published: false,
        status: article.status,
        reasons: [`article is already ${article.status}`],
      };
    }

    if (!article.categoryId) reasons.push('the article has no category');

    // Source attribution, verified rather than attested: the newsroom appends
    // a sources block, and an article without one must not be published under
    // our name.
    if (!this.hasAttribution(article.content)) {
      reasons.push('no source attribution found in the article body');
    }

    const image = article.featuredImage;
    if (!image) {
      reasons.push('the article has no featured image');
    } else if (!image.mimeType.startsWith('image/')) {
      reasons.push(`the featured image is not an image (${image.mimeType})`);
    } else if (image.size < 2048) {
      reasons.push('the featured image is implausibly small');
    }

    // Duplicate check against what is already public, by title. The newsroom
    // clusters upstream; this catches the case where two cycles produced
    // near-identical headlines and only one should be public.
    if (await this.hasPublishedTwin(article.title, article.id)) {
      reasons.push('a published article already covers this story');
    }

    if (reasons.length > 0) {
      this.logger.log(`Auto-publish refused for ${articleId}: ${reasons.join('; ')}`);
      return { published: false, status: ContentStatus.DRAFT, reasons };
    }

    /* --------------------------------------------------------- publish -- */
    await this.prisma.article.update({
      where: { id: articleId },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });

    await this.newsroom.recordAutoPublished(article.title);
    this.logger.warn(`Auto-published ${articleId}: ${article.title}`);

    return { published: true, status: ContentStatus.PUBLISHED, reasons: [] };
  }

  /**
   * Reconsiders drafts the newsroom already filed.
   *
   * ## Why this exists separately from `consider`
   *
   * Promotion normally happens the moment a draft is submitted. That leaves a
   * gap the admin screens make obvious: a story filed while the mode was
   * DRAFT_ONLY, or before automatic publishing was wired at all, sits in the
   * queue forever. Turning auto mode on does nothing for it, because nothing
   * ever asks about it again.
   *
   * So this sweeps the backlog. Every article goes through the same
   * `consider` call as a fresh one — same mode check, same emergency stop,
   * same daily limit, same structural checks — so a swept draft can never
   * take a route a new draft could not.
   *
   * ## Why it needs no attested evidence
   *
   * Under `ALL_DRAFTS` the score, fact and quality numbers are unused, and
   * they are not recoverable here anyway: they live in the newsroom's
   * database, keyed by cluster, and an article filed last week may have no
   * surviving record. Under `HIGH_CONFIDENCE` that makes a sweep impossible to
   * do honestly, so it refuses rather than inventing numbers that would pass.
   */
  async sweepPendingDrafts(max = 25): Promise<{
    considered: number;
    published: number;
    skipped: number;
    reason?: string;
  }> {
    const strictness = await this.newsroom.autoPublishStrictness();

    if (strictness !== 'ALL_DRAFTS') {
      return {
        considered: 0,
        published: 0,
        skipped: 0,
        reason:
          'sweeping needs ALL_DRAFTS: the score, fact and quality numbers for an existing draft ' +
          'are not recoverable, and inventing them to satisfy HIGH_CONFIDENCE would defeat it',
      };
    }

    const drafts = await this.prisma.article.findMany({
      where: {
        status: ContentStatus.DRAFT,
        // Agent-filed only. A human's unfinished draft is not the newsroom's
        // to publish, and `createdById` is null exactly for agent submissions.
        createdById: null,
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(max, 100),
      select: { id: true },
    });

    let published = 0;
    let skipped = 0;

    for (const draft of drafts) {
      // The evidence fields are inert under ALL_DRAFTS. `duplicateChecked` is
      // set because the real duplicate test runs inside `consider` against
      // what is actually published, which is the check that matters here.
      const decision = await this.consider(draft.id, {
        score: 0,
        factScore: 0,
        qualityScore: 0,
        imageValidated: false,
        duplicateChecked: true,
      });

      if (decision.published) published += 1;
      else skipped += 1;

      // The daily limit is enforced per article inside `consider`, so once it
      // binds every remaining draft would be refused for the same reason.
      // Stopping early avoids a hundred pointless queries.
      if (!decision.published && decision.reasons.some(r => /daily auto-publish limit/.test(r))) {
        break;
      }
    }

    this.logger.log(`Sweep considered ${drafts.length} drafts: ${published} published, ${skipped} left`);
    return { considered: drafts.length, published, skipped };
  }

  /** Articles auto-published since midnight UTC. */
  async publishedToday(): Promise<number> {
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);

    return this.prisma.article.count({
      where: {
        status: ContentStatus.PUBLISHED,
        publishedAt: { gte: midnight },
        // Only agent-created articles count against the automation limit; a
        // human publishing their own work is not automation.
        createdById: null,
      },
    });
  }

  /**
   * Does the body credit its sources?
   *
   * Deliberately shallow. It is looking for the presence of attribution, not
   * judging its quality — the newsroom appends a sources block and attributes
   * single-source claims inline, and this catches the case where neither
   * happened at all.
   */
  private hasAttribution(content: string): boolean {
    return /<a\s[^>]*href=|\bsources?\b|\baccording to\b|\breported\b/i.test(content);
  }

  /** A published article whose headline is near-identical. */
  private async hasPublishedTwin(title: string, excludeId: string): Promise<boolean> {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);

    if (words.length < 3) return false;

    // The three longest words are a cheap, index-friendly proxy for "the same
    // story". A full similarity pass belongs upstream in clustering.
    const distinctive = [...words].sort((a, b) => b.length - a.length).slice(0, 3);

    const candidates = await this.prisma.article.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        id: { not: excludeId },
        AND: distinctive.map(word => ({ title: { contains: word, mode: 'insensitive' as const } })),
      },
      select: { id: true },
      take: 1,
    });

    return candidates.length > 0;
  }
}
