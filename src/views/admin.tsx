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
import { AdminAcceptInvitePage } from '@/components/pages/admin/AdminAcceptInvitePage';
import { AdminDashboardPage } from '@/components/pages/admin/AdminDashboardPage';
import { AdminProfilePage } from '@/components/pages/admin/AdminProfilePage';
import { UsersListPage } from '@/components/pages/admin/UsersListPage';
import { RolesPermissionsPage } from '@/components/pages/admin/RolesPermissionsPage';
import { SystemSettingsPage } from '@/components/pages/admin/SystemSettingsPage';
import { LogsPage } from '@/components/pages/admin/LogsPage';
import { QualifiedNewsPage } from '@/components/pages/admin/QualifiedNewsPage';
import { AllDiscoveredNewsPage } from '@/components/pages/admin/AllDiscoveredNewsPage';
import { ContactMessagesPage } from '@/components/pages/admin/ContactMessagesPage';
import { NewsletterListPage } from '@/components/pages/admin/NewsletterListPage';
import { CampaignsListPage } from '@/components/pages/admin/CampaignsListPage';
import { CampaignEditorPage } from '@/components/pages/admin/CampaignEditorPage';
import { CampaignDetailPage } from '@/components/pages/admin/CampaignDetailPage';
import { AnalyticsPage } from '@/components/pages/admin/AnalyticsPage';
import { AiAutomationPage } from '@/components/pages/admin/AiAutomationPage';
import { NewsroomIntelligencePage } from '@/components/pages/admin/NewsroomIntelligencePage';
import { ArticleAnalyticsPage } from '@/components/pages/admin/ArticleAnalyticsPage';
import { EventsAnalyticsPage } from '@/components/pages/admin/EventsAnalyticsPage';
import { FoundersAnalyticsPage } from '@/components/pages/admin/FoundersAnalyticsPage';

import { NewsListPage } from '@/components/pages/admin/NewsListPage';
import { NewsCreatePage } from '@/components/pages/admin/NewsCreatePage';
import { NewsEditPage } from '@/components/pages/admin/NewsEditPage';
import { NewsAnalyticsPage } from '@/components/pages/admin/NewsAnalyticsPage';
import { NewsDetailAnalyticsPage } from '@/components/pages/admin/NewsDetailAnalyticsPage';
import { NewsCategoriesPage } from '@/components/pages/admin/NewsCategoriesPage';

import { EventsListPage } from '@/components/pages/admin/EventsListPage';
import { ProjectsListPage } from '@/components/pages/admin/ProjectsListPage';
import { ProjectFormPage } from '@/components/pages/admin/ProjectFormPage';
import { EventsCreatePage } from '@/components/pages/admin/EventsCreatePage';
import { EventsEditPage } from '@/components/pages/admin/EventsEditPage';
import { OrganizersListPage } from '@/components/pages/admin/OrganizersListPage';

import { FoundersListPage } from '@/components/pages/admin/FoundersListPage';
import { FoundersCreatePage } from '@/components/pages/admin/FoundersCreatePage';
import { FoundersEditPage } from '@/components/pages/admin/FoundersEditPage';

import { LegalPagesListPage } from '@/components/pages/admin/LegalPagesListPage';
import { LegalPageFormPage } from '@/components/pages/admin/LegalPageFormPage';

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

export function AdminAcceptInviteView() {
  const onNavigate = useAppNavigate();
  return <AdminAcceptInvitePage onNavigate={onNavigate} />;
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

export function AdminContactView() {
  return <ContactMessagesPage {...useAdminChrome()} />;
}

export function AdminNewsletterView() {
  return <NewsletterListPage {...useAdminChrome()} />;
}

export function AdminNewsletterCampaignsView() {
  return <CampaignsListPage {...useAdminChrome()} />;
}

export function AdminNewsletterCampaignNewView() {
  return <CampaignEditorPage {...useAdminChrome()} />;
}

export function AdminNewsletterCampaignEditView({ campaignId }: { campaignId: string }) {
  return <CampaignEditorPage {...useAdminChrome()} campaignId={campaignId} />;
}

export function AdminNewsletterCampaignDetailView({ campaignId }: { campaignId: string }) {
  return <CampaignDetailPage {...useAdminChrome()} campaignId={campaignId} />;
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

/**
 * Admin → Qualified News. Discovered stories scoring 50 or above.
 *
 * A separate route from All Discovered News on purpose: the two answer
 * different questions and are used at different moments, and the everyday
 * view should not be a special case of the diagnostic one.
 */
export function AdminQualifiedNewsView() {
  return <QualifiedNewsPage {...useAdminChrome()} />;
}

/** Admin → All Discovered News. Everything, whatever it scored. */
export function AdminAllDiscoveredNewsView() {
  return <AllDiscoveredNewsPage {...useAdminChrome()} />;
}

/** Admin → AI Automation. Super-admin controls for the AI newsroom. */
export function AdminAiAutomationView() {
  return <AiAutomationPage {...useAdminChrome()} />;
}

export function AdminNewsroomIntelligenceView() {
  return <NewsroomIntelligencePage {...useAdminChrome()} />;
}

/** The detailed analytics workspace. The dashboard keeps its own summary. */
export function AdminAnalyticsView() {
  return <AnalyticsPage {...useAdminChrome()} />;
}

export function AdminArticleAnalyticsView({ articleId }: { articleId: string }) {
  return <ArticleAnalyticsPage {...useAdminChrome()} articleId={articleId} />;
}

/** Events → Analytics & Reports. Independent of the global analytics page. */
export function AdminEventsAnalyticsView() {
  return <EventsAnalyticsPage {...useAdminChrome()} />;
}

/** Founders → Analytics & Reports. Independent of the events module. */
export function AdminFoundersAnalyticsView() {
  return <FoundersAnalyticsPage {...useAdminChrome()} />;
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

/* ------------------------------------------------------------ projects --- */

export function AdminProjectsListView() {
  return <ProjectsListPage {...useAdminChrome()} />;
}

export function AdminProjectsCreateView() {
  return <ProjectFormPage {...useAdminChrome()} />;
}

export function AdminProjectsEditView({ projectId }: { projectId: string }) {
  return <ProjectFormPage {...useAdminChrome()} projectId={projectId} />;
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

/* ------------------------------------------------------------ founders --- */

export function AdminFoundersListView() {
  return <FoundersListPage {...useAdminChrome()} />;
}

export function AdminFoundersCreateView() {
  return <FoundersCreatePage {...useAdminChrome()} />;
}

export function AdminFoundersEditView({ founderId }: { founderId: string }) {
  return <FoundersEditPage {...useAdminChrome()} founderId={founderId} />;
}

/* -------------------------------------------------------------- pages --- */

export function AdminLegalPagesListView() {
  return <LegalPagesListPage {...useAdminChrome()} />;
}

export function AdminLegalPagesCreateView() {
  return <LegalPageFormPage {...useAdminChrome()} />;
}

export function AdminLegalPagesEditView({ pageId }: { pageId: string }) {
  return <LegalPageFormPage {...useAdminChrome()} pageId={pageId} />;
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
