import { apiClient } from '@/lib/api-client';

/**
 * Site configuration: the flat key/value `Setting` store plus homepage
 * sections and navigation, backed by the real NestJS `site` module.
 */

export async function getSettings(): Promise<Record<string, unknown>> {
  return apiClient.get<Record<string, unknown>>('settings', { auth: false });
}

export async function saveSettings(entries: { key: string; value: unknown }[]): Promise<Record<string, unknown>> {
  return apiClient.put<Record<string, unknown>>('settings', { settings: entries });
}

export interface HomepageSection {
  id: string;
  key: string;
  title: string;
  enabled: boolean;
  position: number;
  config: Record<string, unknown> | null;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return apiClient.get<HomepageSection[]>('homepage-sections', { auth: false });
}

export async function updateHomepageSection(
  key: string,
  dto: { title?: string; enabled?: boolean; config?: Record<string, unknown> }
): Promise<HomepageSection> {
  return apiClient.patch<HomepageSection>(`homepage-sections/${key}`, dto);
}

export interface NavigationItem {
  id: string;
  location: string;
  label: string;
  href: string;
  position: number;
  parentId: string | null;
  children?: NavigationItem[];
}

export async function getNavigation(location?: string): Promise<NavigationItem[]> {
  return apiClient.get<NavigationItem[]>('navigation', { query: { location }, auth: false });
}
