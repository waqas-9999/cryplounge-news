import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import { mailConfig } from '@/config/configuration';
import { MailService } from '../mail/mail.service';
import { contactAcknowledgement, contactNotification } from '../mail/templates';
import type { ContactQueryDto, SubmitContactDto } from './dto/contact.dto';

/**
 * Contact Us submissions.
 *
 * Every message is stored as a row and read in the admin panel; when mail is
 * configured, staff are also notified and the sender gets an acknowledgement.
 * `read` is the only mutable field; nothing else about a submission should
 * ever be edited.
 */

/**
 * How long before the same address can trigger another acknowledgement.
 * The staff notification is not rate-limited — an editor should see every
 * submission, including a burst.
 */
const ACK_COOLDOWN_MS = 10 * 60 * 1000;

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    @Inject(mailConfig.KEY) private readonly config: ConfigType<typeof mailConfig>
  ) {}

  async submit(dto: SubmitContactDto) {
    const message = await this.prisma.contactMessage.create({ data: dto });

    // Storing the message is the operation; mailing is a side effect. It is
    // awaited so serverless doesn't freeze the function mid-send, but a
    // failure is swallowed — the visitor's submission already succeeded.
    await this.notify(message).catch(error => {
      this.logger.error(
        `Contact mail failed for ${message.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    });
  }

  private async notify(message: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: Date;
  }): Promise<void> {
    if (!this.mail.enabled) return;

    const recipients = this.config.contactRecipients;
    if (recipients.length === 0) {
      this.logger.warn('Mail is configured but CONTACT_NOTIFY_EMAILS is empty; no one was notified.');
    } else {
      const notification = contactNotification(message);
      await this.mail.send({
        to: recipients,
        ...notification,
        // Lets an editor hit Reply and reach the sender directly, without the
        // site ever sending mail *as* them.
        replyTo: message.email,
      });
    }

    if (await this.shouldAcknowledge(message.email, message.createdAt)) {
      await this.mail.send({ to: message.email, ...contactAcknowledgement() });
    }
  }

  /**
   * Throttles the acknowledgement per email address.
   *
   * This mail goes to an address nobody has verified, so without a cooldown
   * the form could be driven in a loop to flood a third party from our domain.
   * The check uses the stored history rather than in-memory state, so it holds
   * across serverless instances.
   */
  private async shouldAcknowledge(email: string, sentAt: Date): Promise<boolean> {
    const recent = await this.prisma.contactMessage.count({
      where: {
        email,
        createdAt: { gte: new Date(sentAt.getTime() - ACK_COOLDOWN_MS), lt: sentAt },
      },
    });
    return recent === 0;
  }

  async list(query: ContactQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.ContactMessageWhereInput = {
      ...(query.read !== undefined ? { read: query.read } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
              { message: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  /** Unread count, for a sidebar badge. */
  async unreadCount(): Promise<number> {
    return this.prisma.contactMessage.count({ where: { read: false } });
  }

  async markRead(id: string, read: boolean) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({ where: { id }, data: { read } });
  }

  async remove(id: string) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    await this.prisma.contactMessage.delete({ where: { id } });
  }
}
