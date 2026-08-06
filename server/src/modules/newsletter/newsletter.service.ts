import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NewsletterStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import { MailService } from '../mail/mail.service';
import { newsletterConfirmation } from '../mail/templates';
import type {
  NewsletterQueryDto,
  SubscribeNewsletterDto,
  UpdateNewsletterDto,
} from './dto/newsletter.dto';

/**
 * Newsletter subscriptions.
 *
 * The public subscribe flow stores the row (that is the operation); the
 * confirmation email is a side effect and, exactly like the contact module,
 * is awaited so a serverless function isn't frozen mid-send but its failure
 * is swallowed — a stored subscription is a degraded success, not an error.
 *
 * Emails are lowercased before storage and the column is unique, so a
 * duplicate is impossible at the database level and the P2002 race is handled
 * rather than feared.
 */
@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async subscribe(dto: SubscribeNewsletterDto): Promise<{
    subscriber: {
      id: string;
      email: string;
      name: string | null;
      status: NewsletterStatus;
      subscribedAt: Date;
      createdAt: Date;
      updatedAt: Date;
    };
    alreadySubscribed: boolean;
  }> {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name?.trim() || undefined;

    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      // An active address is a graceful "already subscribed", not an error.
      if (existing.status === NewsletterStatus.ACTIVE) {
        return { subscriber: existing, alreadySubscribed: true };
      }
      // Re-subscribe: an unsubscribed address goes back to active, and the
      // subscription date resets to now.
      const reactivated = await this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: NewsletterStatus.ACTIVE,
          subscribedAt: new Date(),
          ...(name && name !== existing.name ? { name } : {}),
        },
      });
      await this.confirm(reactivated.email).catch(error => this.logMailError(reactivated.id, error));
      return { subscriber: reactivated, alreadySubscribed: false };
    }

    let subscriber: Awaited<ReturnType<NewsletterService['create']>>;
    try {
      subscriber = await this.create({ email, name });
    } catch (error) {
      // Two requests for the same new address can race past the findUnique
      // above; the unique index settles it. Whoever lost the race is simply
      // reported as already subscribed.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const raced = await this.prisma.newsletterSubscriber.findUniqueOrThrow({
          where: { email },
        });
        return { subscriber: raced, alreadySubscribed: true };
      }
      throw error;
    }

    await this.confirm(subscriber.email).catch(error => this.logMailError(subscriber.id, error));
    return { subscriber, alreadySubscribed: false };
  }

  private create(data: { email: string; name?: string }) {
    return this.prisma.newsletterSubscriber.create({
      data: {
        ...data,
        status: NewsletterStatus.ACTIVE,
        subscribedAt: new Date(),
      },
    });
  }

  async list(query: NewsletterQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { email: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  /** Total / active / unsubscribed counts plus campaign totals for the admin stats cards. */
  async stats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    totalCampaigns: number;
    sentCampaigns: number;
  }> {
    const [total, active, unsubscribed, totalCampaigns, sentCampaigns] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { status: NewsletterStatus.ACTIVE } }),
      this.prisma.newsletterSubscriber.count({ where: { status: NewsletterStatus.UNSUBSCRIBED } }),
      this.prisma.newsletterCampaign.count(),
      this.prisma.newsletterCampaign.count({
        where: { status: { in: ['SENT', 'FAILED'] } },
      }),
    ]);
    return { total, active, unsubscribed, totalCampaigns, sentCampaigns };
  }

  async findOne(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    return subscriber;
  }

  async update(id: string, dto: UpdateNewsletterDto) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    const data: Prisma.NewsletterSubscriberUpdateInput = {};
    if (dto.status && dto.status !== subscriber.status) {
      data.status = dto.status;
      // Re-activating resets the subscription date to now.
      if (dto.status === NewsletterStatus.ACTIVE) data.subscribedAt = new Date();
    }

    return this.prisma.newsletterSubscriber.update({ where: { id }, data });
  }

  async remove(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  private async confirm(email: string): Promise<void> {
    if (!this.mail.enabled) return;
    await this.mail.send({ to: email, ...newsletterConfirmation() });
  }

  private logMailError(id: string, error: unknown): void {
    this.logger.error(
      `Newsletter confirmation mail failed for ${id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
