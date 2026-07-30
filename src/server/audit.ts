import 'server-only';

import type { AuditAction, Prisma } from '@prisma/client';
import { db } from './db';
import type { SessionUser } from './auth';

/**
 * Append-only audit trail.
 *
 * `userEmail` is denormalised so a log entry stays meaningful after the account
 * is deleted — the whole point of an audit log is that it outlives what it
 * describes.
 *
 * Logging must never break the operation it records, so failures are swallowed
 * after being reported to the server console.
 */
export async function recordAudit(params: {
  action: AuditAction;
  summary: string;
  user?: SessionUser | null;
  userEmail?: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: params.action,
        summary: params.summary,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.user?.id,
        userEmail: params.user?.email ?? params.userEmail,
        ipAddress: params.ipAddress,
        metadata: params.metadata,
      },
    });
  } catch (error) {
    console.error('[audit] failed to record entry:', error);
  }
}
