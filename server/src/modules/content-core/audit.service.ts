import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

export interface AuditContext {
  user?: Pick<AuthenticatedUser, 'id' | 'email'> | null;
  /** Falls back to this when there is no user — agent name, or an email on a failed login. */
  actorLabel?: string;
  ipAddress?: string;
}

/**
 * Append-only activity trail.
 *
 * Two design points:
 *  - `userEmail` is denormalised, so an entry stays meaningful after the
 *    account is deleted. An audit log that loses its subject is worthless.
 *  - Logging never breaks the operation it records. A failure here is reported
 *    to the server log and swallowed.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    action: AuditAction;
    summary: string;
    entity?: string;
    entityId?: string;
    context?: AuditContext;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: params.action,
          summary: params.summary,
          entity: params.entity,
          entityId: params.entityId,
          userId: params.context?.user?.id,
          userEmail: params.context?.user?.email ?? params.context?.actorLabel,
          ipAddress: params.context?.ipAddress,
          metadata: params.metadata,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit entry (${params.action} ${params.entity ?? ''})`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Field-level diff for the activity timeline, which shows previous and new
   * values.
   *
   * Only changed keys are kept, and anything sensitive is redacted so the log
   * never becomes a place where a password hash is readable.
   */
  diff(
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Record<string, { from: unknown; to: unknown }> {
    const REDACTED = new Set(['passwordHash', 'apiSecretHash', 'secret', 'tokenHash']);
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    for (const key of Object.keys(after)) {
      if (REDACTED.has(key)) continue;

      const from = before[key];
      const to = after[key];

      // Dates and arrays need value comparison, not reference comparison.
      if (JSON.stringify(from) !== JSON.stringify(to)) {
        changes[key] = { from, to };
      }
    }

    return changes;
  }
}
