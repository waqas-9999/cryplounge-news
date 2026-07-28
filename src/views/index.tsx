'use client';

/**
 * Client bridges for the legacy page components.
 *
 * Each legacy page still expects an `onNavigate(pageKey)` callback (and often
 * the shared `images` object). These wrappers supply both from the App Router,
 * so route files under `app/` stay server components and can export metadata.
 *
 * Every prop these accept is a plain string, which keeps them serializable
 * across the server/client boundary.
 */

import { useAppNavigate } from '@/lib/navigation';
import { images } from '@/lib/images';
import { courses } from '@/data/learnData';

import { HomePage } from '@/components/pages/HomePage';
import { LatestPage } from '@/components/pages/LatestPage';
import { MarketsPage } from '@/components/pages/MarketsPage';
import { EcosystemPage } from '@/components/pages/EcosystemPage';
import { RegulationPage } from '@/components/pages/RegulationPage';
import { ResearchPage } from '@/components/pages/ResearchPage';
import { BusinessPage } from '@/components/pages/BusinessPage';
import { FinancePage } from '@/components/pages/FinancePage';
import { GeopoliticsPage } from '@/components/pages/GeopoliticsPage';
import { TechnologyPage } from '@/components/pages/TechnologyPage';
import { CategoryPage } from '@/components/pages/CategoryPage';
import { ArticleDetailPage } from '@/components/pages/ArticleDetailPage';

import { LearnPage } from '@/components/pages/LearnPage';
import { CrypLearnPage } from '@/components/pages/CrypLearnPage';
import { EcosystemLearnHubPage } from '@/components/pages/EcosystemLearnHubPage';
import { EcosystemLearnPage } from '@/components/pages/EcosystemLearnPage';
import { EcosystemOverviewPage } from '@/components/pages/EcosystemOverviewPage';
import { EcosystemTutorialsPage } from '@/components/pages/EcosystemTutorialsPage';
import { EcosystemCategoryPage } from '@/components/pages/EcosystemCategoryPage';
import { EcosystemProjectPage } from '@/components/pages/EcosystemProjectPage';
import { CourseDetailPage } from '@/components/pages/CourseDetailPage';

import { EventsPage } from '@/components/pages/EventsPage';
import { EventDetailPage } from '@/components/pages/EventDetailPage';
import { SubmitEventPage } from '@/components/pages/SubmitEventPage';

import { FoundersPage } from '@/components/pages/FoundersPage';
import { FounderDetailPage } from '@/components/pages/FounderDetailPage';
import { FounderProjectPage } from '@/components/pages/FounderProjectPage';

import { LoginPage } from '@/components/pages/LoginPage';
import { SignupPage } from '@/components/pages/SignupPage';
import { ForgotPasswordPage } from '@/components/pages/ForgotPasswordPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SubmitStoryPage } from '@/components/pages/SubmitStoryPage';

import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import AdvertisePage from '@/components/pages/AdvertisePage';
import CareersPage from '@/components/pages/CareersPage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import TermsPage from '@/components/pages/TermsPage';
import EditorialPolicyPage from '@/components/pages/EditorialPolicyPage';
import FactCheckPolicyPage from '@/components/pages/FactCheckPolicyPage';
import CorrectionsPolicyPage from '@/components/pages/CorrectionsPolicyPage';
import NewsletterPage from '@/components/pages/NewsletterPage';
import AuthorPage from '@/components/pages/AuthorPage';
import SearchPage from '@/components/pages/SearchPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

/* ---------------------------------------------------------------- news --- */

export function HomeView() {
  return <HomePage images={images} onNavigate={useAppNavigate()} />;
}

export function LatestView() {
  return <LatestPage images={images} onNavigate={useAppNavigate()} />;
}

export function MarketsView() {
  return <MarketsPage images={images} onNavigate={useAppNavigate()} />;
}

export function EcosystemNewsView() {
  return <EcosystemPage images={images} onNavigate={useAppNavigate()} />;
}

export function RegulationView() {
  return <RegulationPage images={images} onNavigate={useAppNavigate()} />;
}

export function ResearchView() {
  return <ResearchPage images={images} onNavigate={useAppNavigate()} />;
}

export function BusinessView() {
  return <BusinessPage images={images} onNavigate={useAppNavigate()} />;
}

export function FinanceView() {
  return <FinancePage images={images} onNavigate={useAppNavigate()} />;
}

export function GeopoliticsView() {
  return <GeopoliticsPage images={images} onNavigate={useAppNavigate()} />;
}

export function TechnologyView() {
  return <TechnologyPage images={images} onNavigate={useAppNavigate()} />;
}

export function CategoryView({ category }: { category: string }) {
  return <CategoryPage category={category} images={images} onNavigate={useAppNavigate()} />;
}

export function ArticleView({ category, slug }: { category: string; slug: string }) {
  return (
    <ArticleDetailPage
      category={category}
      categorySlug={category}
      articleSlug={slug}
      images={images}
      onNavigate={useAppNavigate()}
    />
  );
}

/* --------------------------------------------------------------- learn --- */

export function LearnView() {
  return <LearnPage images={images} onNavigate={useAppNavigate()} />;
}

export function CrypLearnView() {
  return <CrypLearnPage onNavigate={useAppNavigate()} />;
}

export function EcosystemLearnHubView() {
  return <EcosystemLearnHubPage onNavigate={useAppNavigate()} />;
}

export function EcosystemLearnView({ ecosystem }: { ecosystem: string }) {
  return <EcosystemLearnPage ecosystem={ecosystem} images={images} onNavigate={useAppNavigate()} />;
}

export function EcosystemOverviewView({ ecosystem }: { ecosystem: string }) {
  return <EcosystemOverviewPage ecosystem={ecosystem} images={images} onNavigate={useAppNavigate()} />;
}

export function EcosystemTutorialsView({ ecosystem }: { ecosystem: string }) {
  return <EcosystemTutorialsPage ecosystem={ecosystem} images={images} onNavigate={useAppNavigate()} />;
}

export function EcosystemCategoryView({
  ecosystem,
  category,
}: {
  ecosystem: string;
  category: string;
}) {
  return (
    <EcosystemCategoryPage ecosystem={ecosystem} category={category} onNavigate={useAppNavigate()} />
  );
}

export function EcosystemProjectView({
  ecosystem,
  projectName,
}: {
  ecosystem: string;
  projectName: string;
}) {
  return (
    <EcosystemProjectPage
      ecosystem={ecosystem}
      projectName={projectName}
      images={images}
      onNavigate={useAppNavigate()}
    />
  );
}

export function CourseDetailView({ courseId }: { courseId: string }) {
  const navigate = useAppNavigate();
  const course = courses.find(c => c.id === courseId);
  if (!course) return <NotFoundPage onNavigate={navigate} />;
  return <CourseDetailPage courseId={courseId} course={course} onNavigate={navigate} />;
}

/* -------------------------------------------------------------- events --- */

export function EventsView({ initialType }: { initialType?: string }) {
  return <EventsPage onNavigate={useAppNavigate()} initialType={initialType} />;
}

export function EventDetailView({ eventSlug }: { eventSlug: string }) {
  return <EventDetailPage eventSlug={eventSlug} onNavigate={useAppNavigate()} />;
}

export function SubmitEventView() {
  return <SubmitEventPage onNavigate={useAppNavigate()} />;
}

/* ------------------------------------------------------------ founders --- */

export function FoundersView({ initialCategory }: { initialCategory?: string }) {
  return <FoundersPage images={images} onNavigate={useAppNavigate()} initialCategory={initialCategory} />;
}

export function FounderDetailView({ founderId }: { founderId: string }) {
  return <FounderDetailPage founderId={founderId} images={images} onNavigate={useAppNavigate()} />;
}

export function FounderProjectView({
  founderId,
  projectSlug,
}: {
  founderId: string;
  projectSlug: string;
}) {
  return (
    <FounderProjectPage
      founderId={founderId}
      projectSlug={projectSlug}
      images={images}
      onNavigate={useAppNavigate()}
    />
  );
}

/* ---------------------------------------------------------------- auth --- */

export function LoginView() {
  return <LoginPage onNavigate={useAppNavigate()} />;
}

export function SignupView() {
  return <SignupPage onNavigate={useAppNavigate()} />;
}

export function ForgotPasswordView() {
  return <ForgotPasswordPage onNavigate={useAppNavigate()} />;
}

export function ProfileView() {
  return <ProfilePage images={images} onNavigate={useAppNavigate()} />;
}

/* ------------------------------------------------- company & utilities --- */

export function AboutView() {
  return <AboutPage onNavigate={useAppNavigate()} />;
}

export function ContactView() {
  return <ContactPage onNavigate={useAppNavigate()} />;
}

export function AdvertiseView() {
  return <AdvertisePage onNavigate={useAppNavigate()} />;
}

export function CareersView() {
  return <CareersPage onNavigate={useAppNavigate()} />;
}

export function PrivacyView() {
  return <PrivacyPage onNavigate={useAppNavigate()} />;
}

export function TermsView() {
  return <TermsPage onNavigate={useAppNavigate()} />;
}

export function EditorialPolicyView() {
  return <EditorialPolicyPage onNavigate={useAppNavigate()} />;
}

export function FactCheckPolicyView() {
  return <FactCheckPolicyPage onNavigate={useAppNavigate()} />;
}

export function CorrectionsPolicyView() {
  return <CorrectionsPolicyPage onNavigate={useAppNavigate()} />;
}

export function NewsletterView() {
  return <NewsletterPage onNavigate={useAppNavigate()} />;
}

export function AuthorView({ authorSlug }: { authorSlug?: string }) {
  return <AuthorPage onNavigate={useAppNavigate()} authorSlug={authorSlug} />;
}

export function SearchView({ initialQuery }: { initialQuery?: string }) {
  return <SearchPage onNavigate={useAppNavigate()} initialQuery={initialQuery ?? ''} />;
}

export function SubmitStoryView() {
  return <SubmitStoryPage onNavigate={useAppNavigate()} />;
}

export function NotFoundView() {
  return <NotFoundPage onNavigate={useAppNavigate()} />;
}
