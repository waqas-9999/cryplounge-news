import { createHmac, randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvent } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

/** Delivery attempts, spaced out rather than hammered. */
const RETRY_DELAYS_MS = [0, 2_000, 8_000];

/**
 * Outbound notifications to agent-owned endpoints.
 *
 * Dispatch is fire-and-forget from the caller's perspective — publishing an
 * article must not wait on a third party's server. Delivery itself retries
 * with backoff and is signed with HMAC-SHA256 so the receiver can verify the
 * payload actually came from here, using a secret shown once at creation.
 */
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(agentId?: string) {
    const webhooks = await this.prisma.webhook.findMany({
      where: agentId ? { agentId } : {},
      orderBy: { createdAt: 'desc' },
    });
    return webhooks.map(({ secret: _secret, ...safe }) => safe);
  }

  /** Returns the plaintext secret once. It cannot be recovered afterwards. */
  async create(dto: CreateWebhookDto) {
    const secret = randomBytes(32).toString('base64url');
    const webhook = await this.prisma.webhook.create({
      data: { agentId: dto.agentId, url: dto.url, events: dto.events, secret },
    });
    return { ...webhook, secret };
  }

  async update(id: string, dto: UpdateWebhookDto) {
    const webhook = await this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.agentId !== undefined ? { agentId: dto.agentId } : {}),
        ...(dto.url !== undefined ? { url: dto.url } : {}),
        ...(dto.events !== undefined ? { events: dto.events } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    const { secret: _secret, ...safe } = webhook;
    return safe;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.webhook.delete({ where: { id } });
  }

  async deliveries(webhookId: string) {
    return this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Notifies every active webhook subscribed to `event`.
   *
   * Not awaited by callers — errors are caught and logged inside `deliver`
   * itself, so a slow or broken receiver can never propagate back into the
   * request that triggered the event.
   */
  dispatch(event: WebhookEvent, payload: Record<string, unknown>, agentId?: string): void {
    this.prisma.webhook
      .findMany({
        where: {
          isActive: true,
          events: { has: event },
          ...(agentId ? { OR: [{ agentId }, { agentId: null }] } : {}),
        },
      })
      .then(webhooks => {
        for (const webhook of webhooks) {
          void this.deliver(webhook.id, webhook.url, webhook.secret, event, payload);
        }
      })
      .catch(error => this.logger.error('Failed to resolve webhooks for dispatch', error));
  }

  private async deliver(
    webhookId: string,
    url: string,
    secret: string,
    event: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<void> {
    const body = JSON.stringify({ event, payload, sentAt: new Date().toISOString() });
    const signature = createHmac('sha256', secret).update(body).digest('hex');

    let lastStatus: number | undefined;
    let lastError: string | undefined;
    let attempts = 0;

    for (const delay of RETRY_DELAYS_MS) {
      attempts += 1;
      if (delay > 0) await sleep(delay);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Webhook-Signature': signature,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });

        lastStatus = response.status;
        if (response.ok) {
          lastError = undefined;
          break;
        }
        lastError = `HTTP ${response.status}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    await this.prisma.webhookDelivery
      .create({
        data: { webhookId, event, statusCode: lastStatus, error: lastError, attempts },
      })
      .catch(error => this.logger.error('Failed to record webhook delivery', error));
  }

  /** Verification helper for a receiver testing its own signature check. */
  static sign(body: string, secret: string): string {
    return createHmac('sha256', secret).update(body).digest('hex');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
