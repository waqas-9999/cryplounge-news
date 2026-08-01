import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import type { AuditQueryDto } from './dto/audit.dto';

/**
 * Reading the audit trail.
 *
 * Read-only by design: there is no endpoint to edit or delete an entry, and
 * there should not be. A log an administrator can rewrite proves nothing.
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AuditQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { summary: { contains: query.search, mode: 'insensitive' } },
              { userEmail: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  /**
   * The activity timeline for one record: who changed what, and when.
   *
   * `metadata` holds the field-level diff written by AuditService, which is
   * what gives the timeline its previous/new values.
   */
  async timeline(entity: string, entityId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  /** Recent activity for the dashboard. */
  async recent(limit = 20) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: { user: { select: { id: true, name: true } } },
    });
  }

  /**
   * Failed sign-in attempts, grouped by address.
   *
   * The security signal an administrator actually needs: repeated failures
   * against one account, or one address attempting many.
   */
  async failedLogins(sinceHours = 24) {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

    const rows = await this.prisma.auditLog.groupBy({
      by: ['userEmail', 'ipAddress'],
      where: { action: 'LOGIN_FAILED', createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { userEmail: 'desc' } },
      take: 50,
    });

    return rows.map(row => ({
      email: row.userEmail,
      ipAddress: row.ipAddress,
      attempts: row._count._all,
    }));
  }
}
