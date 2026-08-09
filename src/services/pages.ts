
import { apiClient } from '@/lib/api-client';

/**
 * Legal / policy pages (Terms, Privacy, Editorial Policy, ...).
 *
 * Content is entirely admin-authored — nothing here is hardcoded. Backed by
 * the NestJS `legal-pages` module.
 */

export type PageStatus = 'DRAFT' | 'PUBLISHED';

export interface LegalPageSummary {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
}

export interface AdminLegalPageSummary {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: PageStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

export interface LegalPageInput {
  title: string;
  slug?: string;
  content: string;
  status?: PageStatus;
  seoTitle?: string;
  seoDescription?: string;
}

/** Published pages, for nav/footer pickers. */
export async function listPages(): Promise<LegalPageSummary[]> {
  return apiClient.get<LegalPageSummary[]>('pages', { auth: false });
}

/** A published page by slug, for the public route. */
export async function getPage(slug: string): Promise<LegalPage> {
  return apiClient.get<LegalPage>(`pages/${slug}`, { auth: false });
}

/** Every page, any status — admin only. */
export async function listAdminPages(): Promise<AdminLegalPageSummary[]> {
  return apiClient.get<AdminLegalPageSummary[]>('pages/admin');
}

export async function getAdminPage(id: string): Promise<LegalPage> {
  return apiClient.get<LegalPage>(`pages/admin/${id}`);
}

export async function createPage(input: LegalPageInput): Promise<LegalPage> {
  return apiClient.post<LegalPage>('pages', input);
}

export async function updatePage(id: string, input: Partial<LegalPageInput>): Promise<LegalPage> {
  return apiClient.patch<LegalPage>(`pages/${id}`, input);
}

export async function deletePage(id: string): Promise<void> {
  return apiClient.delete(`pages/${id}`);
}
