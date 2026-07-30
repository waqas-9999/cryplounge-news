import type { Metadata } from 'next';
import { FoundersView } from '@/views';
import { getFeaturedProjects } from '@/services/projects';
import { getLatestArticles } from '@/services/news';
import { getUpcomingEventSummaries } from '@/services/events';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'The people building crypto — founder profiles, interviews and the stories behind the projects.',
  alternates: { canonical: '/founders' },
};

export default async function Page() {
  // Fetched here so the page component never touches the data layer.
  const [relatedProjects, relatedArticles, relatedEvents] = await Promise.all([
    getFeaturedProjects(4),
    getLatestArticles(4),
    getUpcomingEventSummaries(3),
  ]);

  return (
    <FoundersView
      relatedProjects={relatedProjects}
      relatedArticles={relatedArticles}
      relatedEvents={relatedEvents}
    />
  );
}
