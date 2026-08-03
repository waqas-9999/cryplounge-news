'use client';

/**
 * Client bridges for the admin pages.
 *
 * Admin pages expect `currentPage` (the legacy page key), `onNavigate` and
 * `onLogout`. All three are derived from the router here so the route files
 * under `app/admin/` stay thin server components.
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAppNavigate, useCurrentPageKey } from '@/lib/navigation';
import { AdminAuthService } from '@/utils/adminAuth';

import { AdminLoginPage } from '@/components/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/components/pages/admin/AdminDashboardPage';
import { AdminProfilePage } from '@/components/pages/admin/AdminProfilePage';
import { UsersListPage } from '@/components/pages/admin/UsersListPage';
import { RolesPermissionsPage } from '@/components/pages/admin/RolesPermissionsPage';
import { SystemSettingsPage } from '@/components/pages/admin/SystemSettingsPage';
import { LogsPage } from '@/components/pages/admin/LogsPage';

import { NewsListPage } from '@/components/pages/admin/NewsListPage';
import { NewsCreatePage } from '@/components/pages/admin/NewsCreatePage';
import { NewsEditPage } from '@/components/pages/admin/NewsEditPage';
import { NewsAnalyticsPage } from '@/components/pages/admin/NewsAnalyticsPage';
import { NewsDetailAnalyticsPage } from '@/components/pages/admin/NewsDetailAnalyticsPage';
import { NewsCategoriesPage } from '@/components/pages/admin/NewsCategoriesPage';

import { EventsListPage } from '@/components/pages/admin/EventsListPage';
import { EventsCreatePage } from '@/components/pages/admin/EventsCreatePage';
import { EventsEditPage } from '@/components/pages/admin/EventsEditPage';
import { OrganizersListPage } from '@/components/pages/admin/OrganizersListPage';

import { GeneralSettingsPage } from '@/components/pages/admin/settings/GeneralSettingsPage';
import { AppearanceSettingsPage } from '@/components/pages/admin/settings/AppearanceSettingsPage';
import { EmailSettingsPage } from '@/components/pages/admin/settings/EmailSettingsPage';
import { SecuritySettingsPage } from '@/components/pages/admin/settings/SecuritySettingsPage';
import { SEOSettingsPage } from '@/components/pages/admin/settings/SEOSettingsPage';
import { APISettingsPage } from '@/components/pages/admin/settings/APISettingsPage';
import { BackupSettingsPage } from '@/components/pages/admin/settings/BackupSettingsPage';

/** Shared wiring for every authenticated admin screen. */
function useAdminChrome() {
  const router = useRouter();
  const onNavigate = useAppNavigate();
  const currentPage = useCurrentPageKey();

  const onLogout = useCallback(() => {
    void AdminAuthService.logout().finally(() => router.replace('/admin/login'));
  }, [router]);

  return { currentPage, onNavigate, onLogout };
}

/* ---------------------------------------------------------------- auth --- */

export function AdminLoginView() {
  const router = useRouter();
  const onNavigate = useAppNavigate();
  return (
    <AdminLoginPage
      onNavigate={onNavigate}
      onAdminLogin={() => router.replace('/admin/dashboard')}
    />
  );
}

/* ----------------------------------------------------------- dashboard --- */

export function AdminDashboardView() {
  return <AdminDashboardPage {...useAdminChrome()} />;
}

export function AdminProfileView() {
  return <AdminProfilePage {...useAdminChrome()} />;
}

export function AdminUsersView() {
  return <UsersListPage {...useAdminChrome()} />;
}

export function AdminRolesPermissionsView() {
  return <RolesPermissionsPage {...useAdminChrome()} />;
}

export function AdminSystemSettingsView() {
  return <SystemSettingsPage {...useAdminChrome()} />;
}

export function AdminLogsView() {
  return <LogsPage {...useAdminChrome()} />;
}

/* ---------------------------------------------------------------- news --- */

export function AdminNewsListView() {
  return <NewsListPage {...useAdminChrome()} />;
}

export function AdminNewsCreateView() {
  return <NewsCreatePage {...useAdminChrome()} />;
}

export function AdminNewsEditView({ articleId }: { articleId: string }) {
  return <NewsEditPage {...useAdminChrome()} articleId={articleId} />;
}

export function AdminNewsAnalyticsView() {
  return <NewsAnalyticsPage {...useAdminChrome()} />;
}

export function AdminNewsDetailAnalyticsView({ articleId }: { articleId: string }) {
  return <NewsDetailAnalyticsPage {...useAdminChrome()} articleId={articleId} />;
}

export function AdminNewsCategoriesView() {
  return <NewsCategoriesPage {...useAdminChrome()} />;
}

/* -------------------------------------------------------------- events --- */

export function AdminEventsListView() {
  return <EventsListPage {...useAdminChrome()} />;
}

export function AdminEventsCreateView() {
  return <EventsCreatePage {...useAdminChrome()} />;
}

export function AdminEventsEditView({ eventId }: { eventId: string }) {
  return <EventsEditPage {...useAdminChrome()} eventId={eventId} />;
}

export function AdminOrganizersListView() {
  return <OrganizersListPage {...useAdminChrome()} />;
}

/* ------------------------------------------------------------ settings --- */

export function AdminSettingsGeneralView() {
  return <GeneralSettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsAppearanceView() {
  return <AppearanceSettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsEmailView() {
  return <EmailSettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsSecurityView() {
  return <SecuritySettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsSEOView() {
  return <SEOSettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsAPIView() {
  return <APISettingsPage {...useAdminChrome()} />;
}

export function AdminSettingsBackupView() {
  return <BackupSettingsPage {...useAdminChrome()} />;
}
