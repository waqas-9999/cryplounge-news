import { apiClient } from '@/lib/api-client';

/** Admin read access to Contact Us submissions, backed by the NestJS `contact` module. */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ContactQuery {
  search?: string;
  read?: boolean;
  page?: number;
  perPage?: number;
}

export interface PaginatedContactMessages {
  items: ContactMessage[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export async function listContactMessages(query: ContactQuery = {}): Promise<PaginatedContactMessages> {
  const { items, pagination } = await apiClient.getPaginated<ContactMessage>('admin/contact', {
    query: {
      search: query.search,
      read: query.read,
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

export async function getUnreadContactCount(): Promise<number> {
  const { count } = await apiClient.get<{ count: number }>('admin/contact/unread-count');
  return count;
}

export async function markContactRead(id: string, read: boolean): Promise<ContactMessage> {
  return apiClient.patch<ContactMessage>(`admin/contact/${id}/read`, { read });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await apiClient.delete(`admin/contact/${id}`);
}
