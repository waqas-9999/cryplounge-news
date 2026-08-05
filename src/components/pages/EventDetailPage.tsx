'use client';

import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink, Users, Globe } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import DOMPurify from 'dompurify';
import { siteConfig } from '@/config/site';
import { excerpt } from '@/lib/text';
import { trackEngagement } from '@/utils/analytics';
import type { EventDetail } from '@/services/events';

interface EventDetailPageProps {
  event: EventDetail;
  onNavigate?: (page: string) => void;
}

const FALLBACK_BANNER = '/images/event-placeholder.jpg';

function formatDateTime(iso: string, timezone: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined,
  });
}

export function EventDetailPage({ event, onNavigate }: EventDetailPageProps) {
  const handleBack = () => {
    onNavigate?.('events');
  };

  const safeNavigate = (page: string) => {
    onNavigate?.(page);
  };

  const sanitizedContent = DOMPurify.sanitize(event.content || event.summary);

  const location =
    event.mode === 'ONLINE'
      ? 'Online'
      : event.venue || [event.city, event.country].filter(Boolean).join(', ') || 'TBA';

  const pageUrl = `${siteConfig.url}/events/${event.slug}`;
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.seoDescription || excerpt(sanitizedContent),
    startDate: event.startsAt,
    endDate: event.endsAt || undefined,
    eventAttendanceMode:
      event.mode === 'ONLINE'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.mode === 'HYBRID'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: event.cancelledAt
      ? 'https://schema.org/EventCancelled'
      : event.postponedAt
        ? 'https://schema.org/EventPostponed'
        : 'https://schema.org/EventScheduled',
    location:
      event.mode === 'ONLINE'
        ? { '@type': 'VirtualLocation', url: event.onlineUrl || pageUrl }
        : { '@type': 'Place', name: event.venue || location, address: location },
    image: event.bannerImage ? [event.bannerImage] : undefined,
    organizer: event.organizer ? { '@type': 'Organization', name: event.organizer.name } : undefined,
    url: pageUrl,
  };

  const relatedArticles = event.articles;
  const relatedProjects = event.projects;
  const relatedFounders = event.founders;

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F10] transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A] rounded-lg px-2 py-1"
            aria-label="Go back to events"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <article className="lg:col-span-2 space-y-6 md:space-y-8">
            <header className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                {event.category && (
                  <span className="text-[#EFB81A] text-xs md:text-sm">{event.category.name}</span>
                )}
                {event.cancelledAt && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs">
                    Cancelled
                  </span>
                )}
                {event.postponedAt && !event.cancelledAt && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-xs">
                    Postponed
                  </span>
                )}
              </div>

              <h1 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl leading-tight">
                {event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 dark:text-[#A0A0A5]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{formatDateTime(event.startsAt, event.timezone)}</span>
                </div>
                {event.endsAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Ends {formatDateTime(event.endsAt, event.timezone)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {event.mode === 'ONLINE' ? <Globe className="w-4 h-4 md:w-5 md:h-5" /> : <MapPin className="w-4 h-4 md:w-5 md:h-5" />}
                  <span className="text-sm md:text-base">{location}</span>
                </div>
              </div>

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Event tags">
                  {event.tags.map(tag => (
                    <span key={tag.id} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm" role="listitem">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {event.registerUrl && (
                <a
                  href={event.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEngagement('register', 'Event', event.slug)}
                  className="inline-flex items-center gap-2 bg-[#EFB81A] hover:bg-[#F9D96A] text-black px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-sm md:text-base transition-colors font-medium"
                >
                  {event.isFree ? 'Register Free' : `Register (${event.ticketPrice ?? 'Paid'})`}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </header>

            <figure className="rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={event.bannerImage || FALLBACK_BANNER}
                alt={event.name}
                className="w-full aspect-video object-cover"
                loading="eager"
              />
              <figcaption className="sr-only">{event.name}</figcaption>
            </figure>

            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

            {event.speakers.length > 0 && (
              <section aria-labelledby="speakers-heading">
                <h2 id="speakers-heading" className="text-gray-800 dark:text-[#F3F3F5] text-xl md:text-2xl mb-4">
                  Speakers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map(speaker => (
                    <div
                      key={speaker.id}
                      className="bg-[#F4F4F4] dark:bg-[#1A1A1A] rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-start gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#EFB81A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {speaker.photoUrl ? (
                          <img src={speaker.photoUrl} alt={speaker.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-black text-sm">{speaker.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-gray-800 dark:text-[#F3F3F5] text-sm">
                          {speaker.founder ? (
                            <button
                              onClick={() => safeNavigate(`founders/${speaker.founder!.slug}`)}
                              className="hover:text-[#EFB81A] transition-colors"
                            >
                              {speaker.name}
                            </button>
                          ) : (
                            speaker.name
                          )}
                        </h3>
                        {speaker.title && <p className="text-gray-500 dark:text-[#A0A0A5] text-xs">{speaker.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <aside className="bg-[#F4F4F4] dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800" aria-label="Organizer information">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#EFB81A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {event.organizer?.logo ? (
                    <img src={event.organizer.logo} alt={event.organizer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-black" />
                  )}
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-1">{event.organizer?.name ?? 'Self'}</h3>
                  <p className="text-gray-600 dark:text-[#A0A0A5] text-sm">Event Organizer</p>
                </div>
              </div>
            </aside>
          </article>

          <aside className="space-y-6 md:space-y-8 pt-16 md:pt-20" aria-label="Sidebar">
            {relatedFounders.length > 0 && (
              <section aria-labelledby="related-founders-heading">
                <h3 id="related-founders-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Related Founders
                </h3>
                <div className="space-y-3" role="list">
                  {relatedFounders.map(founder => (
                    <button
                      key={founder.id}
                      onClick={() => safeNavigate(`founders/${founder.slug}`)}
                      className="w-full text-left flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] transition-colors"
                    >
                      <span className="text-gray-800 dark:text-[#F3F3F5] text-sm">{founder.name}</span>
                      <span className="text-gray-400 dark:text-[#A0A0A5] text-xs">{founder.role}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {relatedProjects.length > 0 && (
              <section aria-labelledby="related-projects-heading">
                <h3 id="related-projects-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Related Projects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => safeNavigate(`ecosystem/${project.slug}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#F4F4F4] dark:bg-[#1A1A1A] text-gray-700 dark:text-[#C0C0C5] text-xs hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:text-black dark:hover:text-[#EFB81A] transition-colors border border-gray-200 dark:border-gray-800"
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {relatedArticles.length > 0 && (
              <section aria-labelledby="related-articles-heading">
                <h3 id="related-articles-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Related Articles
                </h3>
                <div className="space-y-3" role="list">
                  {relatedArticles.map(article => (
                    <div key={article.id} className="p-2 -m-2">
                      <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm">{article.title}</h4>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
