import { apiClient } from '@/lib/api-client';

/**
 * Newsletter subscriptions, backed by the NestJS `newsletter` module.
 *
 * `subscribeToNewsletter` is the public, unauthenticated subscribe flow
 * (`POST /newsletter/subscribe`); everything else hits the admin routes under
 * `admin/newsletter` and therefore carries the admin access token.
 */

export type NewsletterStatus = 'ACTIVE' | 'UNSUBSCRIBED';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: NewsletterStatus;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeResult {
  subscriber: NewsletterSubscriber;
  /** True when the address was already on the list (and still active). */
  alreadySubscribed: boolean;
}

export interface NewsletterQuery {
  search?: string;
  status?: NewsletterStatus;
  page?: number;
  perPage?: number;
}

export interface PaginatedNewsletterSubscribers {
  items: NewsletterSubscriber[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}

/** Public. No admin session required (and none is sent). */
export async function subscribeToNewsletter(
  email: string,
  name?: string
): Promise<SubscribeResult> {
  return apiClient.post<SubscribeResult>(
    'newsletter/subscribe',
    { email, name: name || undefined },
    { auth: false }
  );
}

export async function listNewsletterSubscribers(
  query: NewsletterQuery = {}
): Promise<PaginatedNewsletterSubscribers> {
  const { items, pagination } = await apiClient.getPaginated<NewsletterSubscriber>(
    'admin/newsletter',
    {
      query: {
        search: query.search,
        status: query.status,
        page: query.page ?? 1,
        perPage: query.perPage ?? 20,
      },
    }
  );

  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getNewsletterStats(): Promise<NewsletterStats> {
  return apiClient.get<NewsletterStats>('admin/newsletter/stats');
}

export async function getNewsletterSubscriber(id: string): Promise<NewsletterSubscriber> {
  return apiClient.get<NewsletterSubscriber>(`admin/newsletter/${id}`);
}

export async function updateNewsletterSubscriber(
  id: string,
  data: { status: NewsletterStatus }
): Promise<NewsletterSubscriber> {
  return apiClient.patch<NewsletterSubscriber>(`admin/newsletter/${id}`, data);
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  await apiClient.delete(`admin/newsletter/${id}`);
}

/* ------------------------------------------------------------------ campaigns --- */

export type NewsletterCampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
export type NewsletterRecipientType = 'ALL_ACTIVE' | 'SELECTED';

export interface NewsletterCampaign {
  id: string;
  subject: string;
  title: string;
  /** Sanitized HTML body. */
  content: string;
  status: NewsletterCampaignStatus;
  recipientType: NewsletterRecipientType;
  recipientEmails: string[];
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  ctaLabel: string | null;
  ctaUrl: string | null;
  createdBy: { id: string; name: string; email: string } | null;
  sentAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  name: string | null;
}

export interface CampaignPreview {
  subject: string;
  html: string;
  text: string;
}

export interface NewsletterCampaignPayload {
  subject: string;
  title: string;
  content: string;
  recipientType: NewsletterRecipientType;
  recipientEmails?: string[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

export interface NewsletterCampaignQuery {
  search?: string;
  status?: NewsletterCampaignStatus;
  page?: number;
  perPage?: number;
}

export interface PaginatedNewsletterCampaigns {
  items: NewsletterCampaign[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  totalCampaigns: number;
  sentCampaigns: number;
}

export async function listNewsletterCampaigns(
  query: NewsletterCampaignQuery = {}
): Promise<PaginatedNewsletterCampaigns> {
  const { items, pagination } = await apiClient.getPaginated<NewsletterCampaign>(
    'admin/newsletter/campaigns',
    {
      query: {
        search: query.search,
        status: query.status,
        page: query.page ?? 1,
        perPage: query.perPage ?? 20,
      },
    }
  );
  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export async function getNewsletterCampaign(id: string): Promise<NewsletterCampaign> {
  return apiClient.get<NewsletterCampaign>(`admin/newsletter/campaigns/${id}`);
}

export async function createNewsletterCampaign(
  payload: NewsletterCampaignPayload
): Promise<NewsletterCampaign> {
  return apiClient.post<NewsletterCampaign>('admin/newsletter/campaigns', payload);
}

export async function updateNewsletterCampaign(
  id: string,
  payload: Partial<NewsletterCampaignPayload>
): Promise<NewsletterCampaign> {
  return apiClient.patch<NewsletterCampaign>(`admin/newsletter/campaigns/${id}`, payload);
}

export async function deleteNewsletterCampaign(id: string): Promise<void> {
  await apiClient.delete(`admin/newsletter/campaigns/${id}`);
}

export async function getCampaignRecipients(): Promise<{ recipients: CampaignRecipient[]; total: number }> {
  return apiClient.get('admin/newsletter/campaigns/recipients');
}

export async function previewNewsletterCampaign(id: string): Promise<CampaignPreview> {
  return apiClient.post<CampaignPreview>(`admin/newsletter/campaigns/${id}/preview`);
}

export async function testNewsletterCampaign(id: string, email: string): Promise<{ ok: boolean; sentTo: string }> {
  return apiClient.post(`admin/newsletter/campaigns/${id}/test`, { email });
}

export async function sendNewsletterCampaign(
  id: string
): Promise<{ started: boolean; recipientCount: number; sentCount: number; failedCount: number; message: string }> {
  return apiClient.post(`admin/newsletter/campaigns/${id}/send`);
}

export interface UnsubscribeResult {
  ok: boolean;
  alreadyUnsubscribed?: boolean;
  message: string;
}

/** Public. Unsubscribes using the signed token from the email link. */
export async function unsubscribeFromNewsletter(token: string): Promise<UnsubscribeResult> {
  return apiClient.post<UnsubscribeResult>(
    'newsletter/unsubscribe',
    { token },
    { auth: false }
  );
}
