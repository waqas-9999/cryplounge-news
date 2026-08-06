import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'node:crypto';
import { NewsletterCampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { appConfig, authConfig } from '@/config/configuration';
import { Paginated } from '@/common/dto/api-response.dto';
import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';
import { MailService } from '../mail/mail.service';
import { newsletterCampaignTemplate } from '../mail/templates';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type {
  CampaignQueryDto,
  CreateNewsletterCampaignDto,
  TestCampaignDto,
  UnsubscribeNewsletterDto,
  UpdateNewsletterCampaignDto,
} from './dto/newsletter-campaign.dto';

/**
 * Newsletter campaigns: compose, preview, test, and send to real subscribers
 * through the existing `MailService` (which reads the SMTP settings already in
 * the environment — nothing is configured or hardcoded here).
 *
 * Send semantics:
 *
 *  * A campaign is **claimed** with an atomic compare-and-set (`updateMany`
 *    where status is DRAFT/FAILED) before sending begins, so a second request
 *    can never start a duplicate send — the database, not the button, is the
 *    guard.
 *  * Sending runs in the background in batches (`BATCH_SIZE` recipients per
 *    batch, `BATCH_CONCURRENCY` sends at a time), persisting sent/failed
 *    counts after every batch so progress survives a poll and a crash leaves
 *    only the final few addresses unsent.
 *  * On boot, any campaign stranded in SENDING by a crashed process is marked
 *    FAILED rather than locked forever.
 */
@Injectable()
export class NewsletterCampaignService implements OnModuleInit {
  private readonly logger = new Logger(NewsletterCampaignService.name);

  private static readonly BATCH_SIZE = 50;
  private static readonly BATCH_CONCURRENCY = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly sanitizer: HtmlSanitizerService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
    @Inject(authConfig.KEY) private readonly auth: ConfigType<typeof authConfig>
  ) {}

  onModuleInit(): void {
    // A crash mid-send leaves a campaign stuck in SENDING. Recover it so the
    // admin sees a failed campaign (and can re-send) rather than a spinner
    // that never ends.
    void this.prisma.newsletterCampaign
      .updateMany({
        where: { status: NewsletterCampaignStatus.SENDING },
        data: { status: NewsletterCampaignStatus.FAILED },
      })
      .then(result => {
        if (result.count > 0) {
          this.logger.warn(`Recovered ${result.count} campaign(s) stranded in SENDING`);
        }
      })
      .catch(error => this.logger.error(`Failed to recover stranded campaigns: ${String(error)}`));
  }

  /* ------------------------------------------------------------- queries --- */

  async list(query: CampaignQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.NewsletterCampaignWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { subject: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.newsletterCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.newsletterCampaign.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  async findOne(id: string) {
    const campaign = await this.prisma.newsletterCampaign.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  /** All active subscribers for the recipient picker. One call, no pagination. */
  async recipients() {
    const rows = await this.prisma.newsletterSubscriber.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, email: true, name: true },
      orderBy: { subscribedAt: 'asc' },
    });
    return { recipients: rows, total: rows.length };
  }

  /* ------------------------------------------------------------- writes --- */

  async create(dto: CreateNewsletterCampaignDto, user: AuthenticatedUser) {
    this.assertRecipientSelection(dto.recipientType, dto.recipientEmails);
    return this.prisma.newsletterCampaign.create({
      data: {
        subject: dto.subject.trim(),
        title: dto.title.trim(),
        content: this.sanitizer.sanitize(dto.content),
        recipientType: dto.recipientType ?? 'ALL_ACTIVE',
        ...(dto.recipientEmails
          ? { recipientEmails: this.normalizeEmails(dto.recipientEmails) }
          : {}),
        ...(dto.ctaLabel ? { ctaLabel: dto.ctaLabel.trim() } : {}),
        ...(dto.ctaUrl ? { ctaUrl: dto.ctaUrl.trim() } : {}),
        createdById: user.id,
      },
    });
  }

  async update(id: string, dto: UpdateNewsletterCampaignDto, user: AuthenticatedUser) {
    const campaign = await this.findOne(id);
    if (campaign.status !== NewsletterCampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be edited');
    }

    const data: Prisma.NewsletterCampaignUpdateInput = {};
    if (dto.subject !== undefined) data.subject = dto.subject.trim();
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.content !== undefined) data.content = this.sanitizer.sanitize(dto.content);
    if (dto.recipientType !== undefined) {
      data.recipientType = dto.recipientType;
      if (dto.recipientType === 'ALL_ACTIVE') data.recipientEmails = [];
    }
    if (dto.recipientEmails !== undefined) {
      data.recipientEmails = this.normalizeEmails(dto.recipientEmails);
    }
    data.ctaLabel = dto.ctaLabel === undefined ? undefined : dto.ctaLabel?.trim() || null;
    data.ctaUrl = dto.ctaUrl === undefined ? undefined : dto.ctaUrl?.trim() || null;

    const merged = {
      subject: data.subject ?? campaign.subject,
      title: data.title ?? campaign.title,
      recipientType: data.recipientType ?? campaign.recipientType,
      recipientEmails: (data.recipientEmails as string[] | undefined) ?? campaign.recipientEmails,
    } as { subject: string; title: string; recipientType: 'ALL_ACTIVE' | 'SELECTED'; recipientEmails: string[] };
    this.assertRecipientSelection(merged.recipientType, merged.recipientEmails);

    return this.prisma.newsletterCampaign.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);
    if (campaign.status === NewsletterCampaignStatus.SENDING) {
      throw new ConflictException('This campaign is currently sending and cannot be deleted');
    }
    await this.prisma.newsletterCampaign.delete({ where: { id } });
  }

  /* ---------------------------------------------------- preview & test --- */

  /** Renders the actual email template so the admin preview matches the inbox. */
  async preview(id: string) {
    const campaign = await this.findOne(id);
    const rendered = this.render(campaign.subject, campaign.title, campaign.content, {
      ctaLabel: campaign.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
      unsubscribeUrl: this.unsubscribeUrl('preview@example.com'),
    });
    return { subject: campaign.subject, html: rendered.html, text: rendered.text };
  }

  /** Sends a single copy to an admin-supplied address. Never mutates campaign state. */
  async test(id: string, dto: TestCampaignDto) {
    const campaign = await this.findOne(id);
    this.requireMailEnabled();
    const rendered = this.render(campaign.subject, campaign.title, campaign.content, {
      ctaLabel: campaign.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
      unsubscribeUrl: this.unsubscribeUrl(dto.email),
    });
    const sent = await this.mail.send({
      to: dto.email,
      ...rendered,
      headers: this.unsubscribeHeaders(this.unsubscribeUrl(dto.email)),
    });
    if (!sent) {
      throw new BadRequestException('The test email could not be sent. Check the SMTP configuration.');
    }
    return { ok: true, sentTo: dto.email };
  }

  /* ----------------------------------------------------------------- send --- */

  /**
   * Claims the campaign and starts a background batched send. The claim is the
   * anti-duplicate guard: only one request can flip DRAFT/FAILED → SENDING, so
   * the frontend button state is irrelevant to correctness.
   */
  async send(id: string) {
    const campaign = await this.findOne(id);
    if (campaign.status === NewsletterCampaignStatus.SENDING) {
      throw new ConflictException('This campaign is already being sent');
    }
    if (campaign.status === NewsletterCampaignStatus.SENT) {
      throw new ConflictException('This campaign has already been sent');
    }
    this.requireMailEnabled();

    const emails = await this.resolveRecipients(campaign);
    if (emails.length === 0) {
      throw new BadRequestException('There are no active subscribers to send to');
    }

    const claimed = await this.prisma.newsletterCampaign.updateMany({
      where: { id, status: { in: [NewsletterCampaignStatus.DRAFT, NewsletterCampaignStatus.FAILED] } },
      data: {
        status: NewsletterCampaignStatus.SENDING,
        recipientCount: emails.length,
        sentCount: 0,
        failedCount: 0,
        sentAt: null,
        cancelledAt: null,
      },
    });
    if (claimed.count === 0) {
      throw new ConflictException('This campaign cannot be sent right now (already sending or sent)');
    }

    // Fire-and-forget. The request returns immediately; progress is persisted
    // per batch and read back through findOne.
    void this.runSend(id, emails);

    return {
      started: true,
      recipientCount: emails.length,
      sentCount: 0,
      failedCount: 0,
      message: `Sending to ${emails.length} subscribers`,
    };
  }

  /* --------------------------------------------------------- unsubscribe --- */

  /** Public. Verifies the signed token, never an id, and flips the status. */
  async unsubscribe(dto: UnsubscribeNewsletterDto) {
    const email = this.verifyUnsubscribeToken(dto.token);
    if (!email) throw new BadRequestException('This unsubscribe link is invalid or expired');

    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    if (subscriber.status === 'UNSUBSCRIBED') {
      return { ok: true, alreadyUnsubscribed: true, message: 'You are already unsubscribed' };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { status: 'UNSUBSCRIBED' },
    });
    this.logger.log(`Subscriber unsubscribed via link: ${email}`);
    return { ok: true, alreadyUnsubscribed: false, message: 'You have been unsubscribed' };
  }

  /* ------------------------------------------------------------- helpers --- */

  private async resolveRecipients(campaign: {
    recipientType: 'ALL_ACTIVE' | 'SELECTED';
    recipientEmails: string[];
  }): Promise<string[]> {
    let emails: string[];
    if (campaign.recipientType === 'SELECTED') {
      if (campaign.recipientEmails.length === 0) {
        throw new BadRequestException('No recipients selected for this campaign');
      }
      // Only emails that are still active receive the campaign.
      const rows = await this.prisma.newsletterSubscriber.findMany({
        where: { email: { in: campaign.recipientEmails }, status: 'ACTIVE' },
        select: { email: true },
      });
      emails = rows.map(row => row.email);
    } else {
      const rows = await this.prisma.newsletterSubscriber.findMany({
        where: { status: 'ACTIVE' },
        select: { email: true },
      });
      emails = rows.map(row => row.email);
    }
    // De-duplicate and make ordering deterministic across the batches.
    return [...new Set(emails)].sort();
  }

  private async runSend(campaignId: string, emails: string[]): Promise<void> {
    try {
      const campaign = await this.prisma.newsletterCampaign.findUniqueOrThrow({ where: { id: campaignId } });
      const cta = {
        ctaLabel: campaign.ctaLabel ?? undefined,
        ctaUrl: campaign.ctaUrl ?? undefined,
      };

      let sent = 0;
      let failed = 0;

      for (let start = 0; start < emails.length; start += NewsletterCampaignService.BATCH_SIZE) {
        const batch = emails.slice(start, start + NewsletterCampaignService.BATCH_SIZE);
        const results = await this.mapLimit(batch, NewsletterCampaignService.BATCH_CONCURRENCY, async email => {
          const unsubscribeUrl = this.unsubscribeUrl(email);
          const rendered = this.render(campaign.subject, campaign.title, campaign.content, {
            ...cta,
            unsubscribeUrl,
          });
          return this.mail.send({
            to: email,
            ...rendered,
            headers: this.unsubscribeHeaders(unsubscribeUrl),
          });
        });

        sent += results.filter(Boolean).length;
        failed += results.length - results.filter(Boolean).length;

        // Persist after every batch so a poll sees live progress and a crash
        // costs only the in-flight batch.
        await this.prisma.newsletterCampaign.update({
          where: { id: campaignId },
          data: { sentCount: sent, failedCount: failed },
        });
      }

      const status = failed === emails.length ? NewsletterCampaignStatus.FAILED : NewsletterCampaignStatus.SENT;
      await this.prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { status, sentAt: new Date(), sentCount: sent, failedCount: failed },
      });
      this.logger.log(`Campaign ${campaignId} finished: ${sent} sent, ${failed} failed (${status})`);
    } catch (error) {
      this.logger.error(`Campaign ${campaignId} send failed: ${error instanceof Error ? error.message : String(error)}`);
      await this.prisma.newsletterCampaign
        .update({ where: { id: campaignId }, data: { status: NewsletterCampaignStatus.FAILED } })
        .catch(() => undefined);
    }
  }

  private render(
    subject: string,
    title: string,
    content: string,
    opts: { ctaLabel?: string; ctaUrl?: string; unsubscribeUrl: string }
  ) {
    // Content is sanitized on save; re-sanitize here as defense in depth since
    // it travels into an email opened by real readers.
    return newsletterCampaignTemplate({
      subject,
      title,
      contentHtml: this.sanitizer.sanitize(content),
      ctaLabel: opts.ctaLabel,
      ctaUrl: opts.ctaUrl,
      unsubscribeUrl: opts.unsubscribeUrl,
      frontendUrl: this.frontendUrl(),
    });
  }

  private requireMailEnabled(): void {
    if (!this.mail.enabled) {
      throw new BadRequestException('Mail is not configured. Set SMTP_HOST in the server environment to send.');
    }
  }

  private frontendUrl(): string {
    return (this.app.frontendUrl ?? 'https://cryplounge-news-two.vercel.app').replace(/\/+$/, '');
  }

  private unsubscribeUrl(email: string): string {
    const token = this.signUnsubscribeToken(email);
    return `${this.frontendUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
  }

  /**
   * Standard bulk-mail headers. Gmail and other providers look for
   * `List-Unsubscribe` (ideally with the one-click variant) when deciding
   * whether a mailing is legitimate or spam; its absence is a strong spam
   * signal. `Precedence: bulk` marks the message as list mail rather than a
   * personal conversation.
   */
  private unsubscribeHeaders(unsubscribeUrl: string): Record<string, string> {
    return {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      Precedence: 'bulk',
    };
  }

  /** HMAC-signed token: base64url(email).hmac. Never the database id. */
  private signUnsubscribeToken(email: string): string {
    const payload = Buffer.from(email, 'utf8').toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.auth.accessSecret)
      .update(email)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  private verifyUnsubscribeToken(token: string): string | null {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const email = Buffer.from(payload, 'base64url').toString('utf8');
    if (!email.includes('@') || email.length > 200) return null;

    const expected = crypto
      .createHmac('sha256', this.auth.accessSecret)
      .update(email)
      .digest('base64url');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return email;
  }

  private normalizeEmails(emails: string[]): string[] {
    return [...new Set(emails.map(email => email.trim().toLowerCase()).filter(Boolean))];
  }

  private assertRecipientSelection(
    recipientType: 'ALL_ACTIVE' | 'SELECTED' | undefined,
    emails: string[] | undefined
  ): void {
    if (recipientType === 'SELECTED' && (!emails || emails.length === 0)) {
      throw new BadRequestException('Select at least one recipient when using "Selected subscribers"');
    }
  }

  /** Runs `fn` over `items` with at most `limit` concurrent calls. */
  private async mapLimit(
    items: string[],
    limit: number,
    fn: (item: string) => Promise<boolean>
  ): Promise<boolean[]> {
    const results = new Array<boolean>(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index]);
      }
    });
    await Promise.all(workers);
    return results;
  }
}
