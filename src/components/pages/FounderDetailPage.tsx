'use client';

import { useEffect } from 'react';
import { ArrowLeft, Twitter, Linkedin, Github, Globe, Calendar } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import DOMPurify from 'dompurify';
import { siteConfig } from '@/config/site';
import { excerpt } from '@/lib/text';
import { recordContentView, trackReadingDepth, trackEngagement } from '@/utils/analytics';
import type { FounderDetail } from '@/services/founders';

interface FounderDetailPageProps {
  founder: FounderDetail;
  onNavigate?: (page: string) => void;
}

const FALLBACK_IMAGE = '/images/founder-placeholder.jpg';

export function FounderDetailPage({ founder, onNavigate }: FounderDetailPageProps) {
  useEffect(() => {
    recordContentView('Founder', founder.slug);
    const stopDepthTracking = trackReadingDepth('Founder', founder.slug);
    return () => stopDepthTracking();
  }, [founder.slug]);

  const handleBack = () => {
    onNavigate?.('founders');
  };

  const safeNavigate = (page: string) => {
    onNavigate?.(page);
  };

  const sanitizedBio = DOMPurify.sanitize(founder.bio || founder.excerpt);

  const pageUrl = `${siteConfig.url}/founders/${founder.slug}`;
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.role,
    description: founder.seoDescription || excerpt(sanitizedBio),
    image: founder.photo,
    url: pageUrl,
    worksFor: founder.company ? { '@type': 'Organization', name: founder.company } : undefined,
    sameAs: [founder.x, founder.linkedin, founder.github, founder.website].filter(Boolean),
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F10] transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A] rounded-lg px-2 py-1"
            aria-label="Go back to founders"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Founder Page</span>
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <article className="lg:col-span-2 space-y-6 md:space-y-8">
            <header className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                {founder.tags.map(tag => (
                  <span key={tag.id} className="px-3 py-1 bg-[#F9D96A] dark:bg-[#EFB81A]/20 text-black dark:text-[#EFB81A] rounded-lg text-xs">
                    {tag.name}
                  </span>
                ))}
                {founder.featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-lg text-xs">⭐ Featured</span>
                )}
              </div>

              <h1 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl leading-tight">
                {founder.name}
              </h1>
              <p className="text-[#EFB81A] text-base md:text-lg">
                {founder.role}{founder.company ? ` at ${founder.company}` : ''}
              </p>

              {founder.region && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-[#A0A0A5]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{founder.region}</span>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Social links">
                {founder.x && (
                  <a href={founder.x} onClick={() => trackEngagement('x', 'Founder', founder.slug)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center" aria-label="X profile">
                    <Twitter className="w-4 h-4 text-blue-500" />
                  </a>
                )}
                {founder.linkedin && (
                  <a href={founder.linkedin} onClick={() => trackEngagement('linkedin', 'Founder', founder.slug)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center" aria-label="LinkedIn profile">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                  </a>
                )}
                {founder.github && (
                  <a href={founder.github} onClick={() => trackEngagement('github', 'Founder', founder.slug)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center" aria-label="GitHub profile">
                    <Github className="w-4 h-4 text-gray-700 dark:text-[#A0A0A5]" />
                  </a>
                )}
                {founder.website && (
                  <a href={founder.website} onClick={() => trackEngagement('website', 'Founder', founder.slug)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center" aria-label="Website">
                    <Globe className="w-4 h-4 text-gray-700 dark:text-[#A0A0A5]" />
                  </a>
                )}
              </div>
            </header>

            <figure className="rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={founder.photo || FALLBACK_IMAGE}
                alt={founder.name}
                className="w-full aspect-video object-cover"
                loading="eager"
              />
              <figcaption className="sr-only">{founder.name}</figcaption>
            </figure>

            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedBio }} />
          </article>

          <aside className="space-y-6 md:space-y-8 pt-16 md:pt-20" aria-label="Sidebar">
            {founder.projects.length > 0 && (
              <section aria-labelledby="related-projects-heading">
                <h3 id="related-projects-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Projects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {founder.projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => {
                        trackEngagement('related_project', 'Founder', founder.slug);
                        safeNavigate(`ecosystem/${project.slug}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F4F4F4] dark:bg-[#1A1A1A] text-gray-700 dark:text-[#C0C0C5] text-xs hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:text-black dark:hover:text-[#EFB81A] transition-colors border border-gray-200 dark:border-gray-800"
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {founder.events.length > 0 && (
              <section aria-labelledby="related-events-heading">
                <h3 id="related-events-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Speaking At
                </h3>
                <div className="space-y-3" role="list">
                  {founder.events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => {
                        trackEngagement('related_event', 'Founder', founder.slug);
                        safeNavigate(`events/${event.slug}`);
                      }}
                      className="w-full text-left flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-[#F4F4F4] dark:hover:bg-[#1A1A1A] transition-colors"
                    >
                      <span className="text-gray-800 dark:text-[#F3F3F5] text-sm">{event.name}</span>
                      <span className="text-gray-400 dark:text-[#A0A0A5] text-xs">
                        {new Date(event.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {founder.articles.length > 0 && (
              <section aria-labelledby="related-articles-heading">
                <h3 id="related-articles-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                  Related Articles
                </h3>
                <div className="space-y-3" role="list">
                  {founder.articles.map(article => (
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
