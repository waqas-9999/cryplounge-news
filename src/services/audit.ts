import { apiClient } from '@/lib/api-client';

/**
 * Read access to the audit trail, backed by the real NestJS `audit` module.
 * Read-only by design — there is no endpoint to edit or delete an entry.
 */

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
  user: { id: string; name: string; email?: string } | null;
}

export interface AuditQuery {
  search?: string;
  action?: string;
  entity?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedAuditEntries {
  items: AuditEntry[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export async function listAuditLog(query: AuditQuery = {}): Promise<PaginatedAuditEntries> {
  const { items, pagination } = await apiClient.getPaginated<AuditEntry>('audit', {
    query: {
      search: query.search,
      action: query.action,
      entity: query.entity,
      page: query.page ?? 1,
      perPage: query.perPage ?? 20,
    },
  });

  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getRecentActivity(): Promise<AuditEntry[]> {
  return apiClient.get<AuditEntry[]>('audit/recent');
}

export interface FailedLoginEntry {
  email: string | null;
  ipAddress: string | null;
  attempts: number;
}

export async function getFailedLogins(): Promise<FailedLoginEntry[]> {
  return apiClient.get<FailedLoginEntry[]>('audit/failed-logins');
}
