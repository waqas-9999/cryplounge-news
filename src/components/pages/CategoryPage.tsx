'use client';

import Link from 'next/link';
import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { EmptyState } from '@/components/EmptyState';
import { ArrowRight, ArrowLeft, Newspaper } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { labelForSlug } from '@/lib/taxonomy';
import { articleHref } from '@/services/news';
import { articleSlug as slugOf, type Article } from '@/types/article';

/**
 * Desk page for the categories without a bespoke layout (Industry, Security,
 * Policy, Adoption).
 *
 * Every headline here is a real row from the `articles` API. The page used to
 * render invented ones — "{Category} Platform Announces Revolutionary Update",
 * a hardcoded Finance/Technology/Business sidebar and eight "Important Update
 * #n" cards — all with slugs that resolve to nothing. They were part of the
 * page shell, so they showed even after every article was deleted from the
 * database, which made the site look populated when it was empty.
 */

interface CategoryPageProps {
  category: string;
  images: {
    vrImage: string;
    businessmanImage: string;
    solanaImage: string;
    phoneImage: string;
    speakerImage: string;
    documentImage: string;
    asianBusinessmanImage: string;
  };
  onNavigate?: (page: string) => void;
  /** This category's articles, fetched on the server. */
  initialArticles?: Article[];
  /** Recent articles from other desks, for the sidebar. */
  relatedArticles?: Article[];
}

const FALLBACK_IMAGE_KEYS = [
  'vrImage',
  'businessmanImage',
  'solanaImage',
  'phoneImage',
  'speakerImage',
  'documentImage',
  'asianBusinessmanImage',
] as const;

function timeAgo(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CategoryPage({
  category,
  images,
  onNavigate,
  initialArticles,
  relatedArticles,
}: CategoryPageProps) {
  // Labels come from the shared taxonomy so they cannot drift per page.
  const displayTitle = labelForSlug(category);

  const articles = initialArticles ?? [];
  const related = relatedArticles ?? [];

  const featured = articles[0] ?? null;
  const latestInCategory = articles.slice(1, 6);
  const moreArticles = articles.slice(6);

  // The sidebar's lead card, then two smaller ones. Real cross-desk coverage.
  const [sidebarLead, ...sidebarRest] = related;
  const sidebarSecondary = sidebarRest.slice(0, 2);
  const sidebarLatest = sidebarRest.slice(2);

  /** Cycles the design's stock images for articles that have none of their own. */
  const imageFor = (article: Article, index: number): string =>
    article.imageUrl || images[FALLBACK_IMAGE_KEYS[index % FALLBACK_IMAGE_KEYS.length]];

  const handleBack = () => onNavigate?.('news');

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to News</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          {/* Featured Article */}
          {featured ? (
            <Link
              href={articleHref(featured)}
              className="block bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
            >
              <div className="mb-3 md:mb-4">
                <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
                <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">
                  {shortDate(featured.publishedAt)}
                </span>
              </div>

              {/* The page's single h1: its lead story. */}
              <h1 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
                {featured.title}
              </h1>

              <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
                {featured.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <span className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] group-hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
                Read article
                <ArrowRight className="w-4 h-4" />
              </span>

              <div className="rounded-xl md:rounded-2xl overflow-hidden">
                {featured.imageUrl ? (
                  <div className="relative h-48 md:h-64">
                    <ImageWithFallback
                      src={featured.imageUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                    <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider">
                      {displayTitle.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl mb-6 md:mb-8 border border-gray-200 dark:border-gray-800">
              {/* Still the page's single h1, so the document keeps its outline. */}
              <h1 className="sr-only">{displayTitle} News</h1>
              <EmptyState
                icon={Newspaper}
                title={`No ${displayTitle.toLowerCase()} stories yet`}
                description={`Nothing has been published to the ${displayTitle} desk so far. New reporting appears here as soon as it goes live.`}
              />
            </div>
          )}

          {/* Latest Articles in Category */}
          {latestInCategory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">
                  Latest in {displayTitle}
                </h3>
              </div>

              <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
                {latestInCategory.map((article, idx) => (
                  <div key={article.id}>
                    {idx > 0 && <div className="h-px bg-gray-100 dark:bg-white/[0.08] mb-3 md:mb-4" />}
                    <LatestNewsCard
                      category={article.category}
                      categorySlug={article.categorySlug}
                      time={timeAgo(article.publishedAt)}
                      title={article.title}
                      image={imageFor(article, idx)}
                      articleSlug={slugOf(article)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — other desks' recent coverage */}
        <div className="space-y-6 md:space-y-8">
          {sidebarLead && (
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg">FEATURED NEWS</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
                {/* Main Featured Article with Image Overlay */}
                <Link
                  href={articleHref(sidebarLead)}
                  className="block relative rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group h-[240px] md:h-[280px]"
                >
                  <ImageWithFallback
                    src={imageFor(sidebarLead, 0)}
                    alt={sidebarLead.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                    <div className="mb-2">
                      <span className="text-white text-xs md:text-sm">{sidebarLead.category}</span>
                      <span className="text-white/80 text-xs md:text-sm ml-2">
                        {timeAgo(sidebarLead.publishedAt)}
                      </span>
                    </div>
                    <h4 className="text-white leading-snug text-base md:text-xl mb-0 group-hover:text-[#F9D96A] transition-colors">
                      {sidebarLead.title}
                    </h4>
                  </div>
                </Link>

                {/* Secondary Featured Articles - Horizontal Layout */}
                {sidebarSecondary.map((article, idx) => (
                  <Link
                    key={article.id}
                    href={articleHref(article)}
                    className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] transition-all cursor-pointer group flex items-center gap-3 md:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-[#EFB81A] text-xs md:text-sm">{article.category}</span>
                        <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">
                          {timeAgo(article.publishedAt)}
                        </span>
                      </div>
                      <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-[#EFB81A] transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                    </div>
                    <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={imageFor(article, idx + 1)}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest News Section */}
          {sidebarLatest.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg">LATEST NEWS</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
                {sidebarLatest.map(article => (
                  <Link
                    key={article.id}
                    href={articleHref(article)}
                    className="block bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
                  >
                    <div className="mb-2">
                      <span className="text-[#EFB81A] text-xs md:text-sm">{article.category}</span>
                      <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">
                        {shortDate(article.publishedAt)}
                      </span>
                    </div>
                    <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base mb-3 group-hover:text-[#EFB81A] transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex gap-2">
                      {article.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-gray-400 dark:text-[#A0A0A5] text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* More Articles Grid */}
      {moreArticles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">
              More {displayTitle} Articles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {moreArticles.map((article, idx) => (
              <TrendingCard
                key={article.id}
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                tags={article.tags.slice(0, 2)}
                image={imageFor(article, idx)}
                articleSlug={slugOf(article)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
