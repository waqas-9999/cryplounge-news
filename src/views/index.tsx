'use client';

/**
 * Client bridges for the page components.
 *
 * Page components still expect an `onNavigate(pageKey)` callback (and often the
 * shared `images` object). These wrappers supply both from the App Router, so
 * route files under `app/` stay server components and can export metadata.
 *
 * Every prop these accept is a plain string, which keeps them serializable
 * across the server/client boundary.
 */

import { useAppNavigate } from '@/lib/navigation';
import { images } from '@/lib/images';
import type { Project } from '@/types/project';
import type { Article } from '@/types/article';
import type { EventSummary } from '@/services/events';

import { HomePage } from '@/components/pages/HomePage';
import { LatestPage } from '@/components/pages/LatestPage';
import { MarketsPage } from '@/components/pages/MarketsPage';
import { RegulationPage } from '@/components/pages/RegulationPage';
import { ResearchPage } from '@/components/pages/ResearchPage';
import { BusinessPage } from '@/components/pages/BusinessPage';
import { TechnologyPage } from '@/components/pages/TechnologyPage';
import { CategoryPage } from '@/components/pages/CategoryPage';
import { ArticleDetailPage } from '@/components/pages/ArticleDetailPage';

import { EventsPage } from '@/components/pages/EventsPage';
import { FoundersPage } from '@/components/pages/FoundersPage';

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
import { SubmitStoryPage } from '@/components/pages/SubmitStoryPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

/* ---------------------------------------------------------------- news --- */

export function HomeView({ spotlightProjects }: { spotlightProjects: Project[] }) {
  return (
    <HomePage
      images={images}
      onNavigate={useAppNavigate()}
      spotlightProjects={spotlightProjects}
    />
  );
}

/** "All News" — the landing page of the News section. */
export function AllNewsView() {
  return <LatestPage images={images} onNavigate={useAppNavigate()} />;
}

/** Market *news* — deliberately editorial, no prices or rankings. */
export function MarketNewsView() {
  return <MarketsPage images={images} onNavigate={useAppNavigate()} />;
}

export function BusinessView() {
  return <BusinessPage images={images} onNavigate={useAppNavigate()} />;
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

/* ---------------------------------------------- top-level sections ------ */

export function ResearchView() {
  return <ResearchPage images={images} onNavigate={useAppNavigate()} />;
}

export function RegulationView() {
  return <RegulationPage images={images} onNavigate={useAppNavigate()} />;
}

export function EventsView() {
  return <EventsPage onNavigate={useAppNavigate()} />;
}

export function FoundersView({
  relatedProjects,
  relatedArticles,
  relatedEvents,
}: {
  relatedProjects: Project[];
  relatedArticles: Article[];
  relatedEvents: EventSummary[];
}) {
  return (
    <FoundersPage
      images={images}
      onNavigate={useAppNavigate()}
      relatedProjects={relatedProjects}
      relatedArticles={relatedArticles}
      relatedEvents={relatedEvents}
    />
  );
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
