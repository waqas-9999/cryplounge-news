import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import type { Project } from '@/types/project';
import type { Article } from '@/data/mockArticles';
import type { EventSummary } from '@/services/events';
import { SectionHeader } from '@/components/section/SectionHeader';
import { ProjectGrid } from '@/components/ecosystem/ProjectGrid';
import { articleSlug } from '@/data/mockArticles';

/**
 * Onward content for the Founders page.
 *
 * Replaces a decorative "Are you building something?" panel with three routes
 * deeper into the site. Each block is omitted entirely when it has no content —
 * an empty heading is worse than no heading.
 */
export function FounderRelatedContent({
  projects,
  articles,
  events,
}: {
  projects: Project[];
  articles: Article[];
  events: EventSummary[];
}) {
  const hasAnything = projects.length > 0 || articles.length > 0 || events.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="space-y-10 md:space-y-12">
      {projects.length > 0 && (
        <section aria-labelledby="founder-projects">
          <h2 id="founder-projects" className="sr-only">
            Related projects
          </h2>
          <SectionHeader
            as="h3"
            title="Related Projects"
            description="What the people above are building."
            href="/ecosystem"
            linkLabel="Browse directory"
          />
          <ProjectGrid projects={projects} columns={4} compact />
        </section>
      )}

      {articles.length > 0 && (
        <section aria-labelledby="founder-news">
          <h2 id="founder-news" className="sr-only">
            Related news
          </h2>
          <SectionHeader as="h3" title="Latest News" href="/news" linkLabel="All news" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map(article => (
              <li key={article.id}>
                <Link
                  href={`/news/${article.categorySlug}/${articleSlug(article)}`}
                  className="group block h-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-[#EFB81A] transition-colors"
                >
                  <span className="block text-xs text-[#EFB81A] mb-2">{article.category}</span>
                  <span className="block text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-[#EFB81A] transition-colors">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section aria-labelledby="founder-events">
          <h2 id="founder-events" className="sr-only">
            Upcoming events
          </h2>
          <SectionHeader as="h3" title="Upcoming Events" href="/events" linkLabel="All events" />
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {events.map(event => (
              <li key={event.id}>
                <a
                  href={event.registerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-[#EFB81A] transition-colors"
                >
                  <span className="block text-xs text-[#EFB81A] mb-2">{event.category}</span>
                  <span className="block text-sm text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#EFB81A] transition-colors">
                    {event.name}
                  </span>
                  <span className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {new Date(event.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {event.location}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
