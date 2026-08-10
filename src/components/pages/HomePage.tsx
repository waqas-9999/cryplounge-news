'use client';

import type { Project } from '@/types/project';
import type { Article } from '@/types/article';
import { EcosystemSpotlight } from '@/components/ecosystem/EcosystemSpotlight';
import { useEffect, useRef, useState } from 'react';
import { HeroArticle } from '@/components/HeroArticle';
import { ArticleCardSmall } from '@/components/ArticleCardSmall';
import { RecommendedCard } from '@/components/RecommendedCard';
import { TrendingCard } from '@/components/TrendingCard';
import { FeaturedNewsSection } from '@/components/FeaturedNewsSection';
import { BestOfMonthSection } from '@/components/BestOfMonthSection';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLatestArticles, articleHref } from '@/services/news';
import { HomePageSkeleton } from '@/components/skeletons';

interface HomePageProps {
  /** Fetched on the server in app/page.tsx and passed down. */
  spotlightProjects: Project[];
  /**
   * Latest articles, fetched on the server so the homepage's headlines,
   * links and hero image are present in the initial HTML.
   */
  initialArticles?: Article[];
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
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function HomePage({ images, onNavigate, spotlightProjects, initialArticles }: HomePageProps) {
  const imageMap = images as unknown as Record<(typeof FALLBACK_IMAGE_KEYS)[number], string>;
  const fallbackImage = (index: number) => imageMap[FALLBACK_IMAGE_KEYS[index % FALLBACK_IMAGE_KEYS.length]];

  /**
   * Articles are fetched on the server and handed down as `initialArticles`.
   *
   * They used to be loaded here in an effect, which meant the homepage's HTML
   * contained no headlines, no article links and no H1 — everything appeared
   * only after JavaScript ran. For a news site that is the worst place to be:
   * crawlers had nothing to index without rendering, and LCP waited on an API
   * round trip. The effect below is kept purely as a fallback for the case
   * where the server fetch failed.
   */
  const hasServerData = (initialArticles?.length ?? 0) > 0;
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(
    hasServerData ? 'ready' : 'loading'
  );
  const [articles, setArticles] = useState<Article[]>(initialArticles ?? []);

  useEffect(() => {
    if (hasServerData) return;

    let cancelled = false;
    getLatestArticles(30)
      .then(items => {
        if (!cancelled) {
          setArticles(items);
          setState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refs for scrollable containers
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const mostReadScrollRef = useRef<HTMLDivElement>(null);
  const marketScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === 'left' ? ref.current.scrollLeft - scrollAmount : ref.current.scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (state === 'loading') {
    return <HomePageSkeleton />;
  }

  if (state === 'error' || articles.length === 0) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-gray-600 dark:text-[#A0A0A5]">
          {state === 'error' ? "Couldn't load the latest news right now. Please try again shortly." : 'No articles yet.'}
        </p>
      </main>
    );
  }

  // A single fetch of recent articles, sliced across every homepage section
  // so nothing here is hardcoded — sections simply take different windows.
  const hero = articles[0];
  const smallCards = articles.slice(1, 4);
  const recommendedLarge = articles[4];
  const recommendedSmall = articles.slice(5, 9);
  const latestFeatured = articles[9] ?? hero;
  const latestGrid = articles.slice(10, 13);
  const latestScroll = articles.slice(13, 19);
  const featuredMain = articles[19] ?? hero;
  const featuredSidebar = articles.slice(20, 23);
  const mostReadFeatured = articles[23] ?? hero;
  const mostReadGrid = articles.slice(24, 27);
  const mostReadScroll = articles.slice(27, 30).length > 0 ? articles.slice(27, 30) : articles.slice(0, 3);
  const marketArticles = articles.filter(a => a.categorySlug === 'market').slice(0, 5);
  const marketScrollItems = marketArticles.length > 0 ? marketArticles : articles.slice(0, 5);
  const policyArticles = articles.filter(a => a.categorySlug === 'policy');
  const policyFeatured = policyArticles[0] ?? articles[articles.length - 1];
  const policySide = (policyArticles.length > 1 ? policyArticles.slice(1, 4) : articles.slice(-4, -1));

  return (
    <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          <HeroArticle
            category={hero.category}
            categorySlug={hero.categorySlug}
            time={timeAgo(hero.publishedAt)}
            title={hero.title}
            tags={hero.tags.slice(0, 2)}
            articleSlug={hero.slug ?? hero.id}
            onNavigate={onNavigate}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {smallCards.map(article => (
              <ArticleCardSmall
                key={article.id}
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                articleSlug={article.slug ?? article.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-base sm:text-lg md:text-xl">Recommended</h2>
            <button
              onClick={() => onNavigate && onNavigate('news/market')}
              className="text-xs sm:text-sm text-gray-600 dark:text-[#A0A0A5] hover:text-gray-800 dark:hover:text-yellow-400 transition-colors flex items-center gap-1 min-h-[44px] items-center"
            >
              View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {recommendedLarge && (
            <RecommendedCard
              category={recommendedLarge.category}
              categorySlug={recommendedLarge.categorySlug}
              time={timeAgo(recommendedLarge.publishedAt)}
              title={recommendedLarge.title}
              image={recommendedLarge.imageUrl ?? fallbackImage(0)}
              articleSlug={recommendedLarge.slug ?? recommendedLarge.id}
              variant="large"
              onNavigate={onNavigate}
            />
          )}

          <div className="space-y-3 md:space-y-4">
            {recommendedSmall.map((article, index) => (
              <RecommendedCard
                key={article.id}
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                image={article.imageUrl ?? fallbackImage(index + 1)}
                articleSlug={article.slug ?? article.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg">
              <span className="text-black dark:text-[#EFB81A] text-xs md:text-sm">LATEST NEWS</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('news/market')}
              className="px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors flex items-center gap-2 text-sm"
            >
              View more <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => onNavigate && onNavigate(articleHref(latestFeatured))}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{latestFeatured.category}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm ml-2">
                {timeAgo(latestFeatured.publishedAt)}
              </span>
            </div>

            {/* h2: `HeroArticle` above already renders the page's single h1. */}
            <h2 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              {latestFeatured.title}
            </h2>

            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              {latestFeatured.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              {latestFeatured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={latestFeatured.imageUrl} alt={latestFeatured.title} className="w-full h-48 md:h-64 object-cover" />
              ) : (
                <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                  <div className="text-black dark:text-[#EFB81A] text-4xl md:text-6xl tracking-wider uppercase">
                    {latestFeatured.category}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {latestGrid.map((article, index) => (
              <TrendingCard
                key={article.id}
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                tags={article.tags.slice(0, 2)}
                image={article.imageUrl ?? fallbackImage(index)}
                articleSlug={article.slug ?? article.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div
          ref={latestScrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 h-fit overflow-x-auto lg:overflow-x-scroll scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {latestScroll.map((article, index) => (
            <TrendingCard
              key={article.id}
              category={article.category}
              categorySlug={article.categorySlug}
              time={timeAgo(article.publishedAt)}
              title={article.title}
              tags={article.tags.slice(0, 2)}
              image={article.imageUrl ?? fallbackImage(index)}
              articleSlug={article.slug ?? article.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleScroll(latestScrollRef, 'left')}
          className="w-10 h-10 rounded-full bg-[#F4F4F4] dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={() => handleScroll(latestScrollRef, 'right')}
          className="w-10 h-10 rounded-full bg-[#EFB81A] flex items-center justify-center hover:bg-[#F9D96A] transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Featured News Section */}
      {featuredMain && (
        <FeaturedNewsSection
          mainImage={featuredMain.imageUrl ?? fallbackImage(0)}
          mainCategory={featuredMain.category}
          mainCategorySlug={featuredMain.categorySlug}
          mainArticleSlug={featuredMain.slug ?? featuredMain.id}
          mainTitle={featuredMain.title}
          mainTags={featuredMain.tags.slice(0, 2)}
          mainTime={timeAgo(featuredMain.publishedAt)}
          sidebarArticles={featuredSidebar.map(article => ({
            category: article.category,
            categorySlug: article.categorySlug,
            time: timeAgo(article.publishedAt),
            title: article.title,
            articleSlug: article.slug ?? article.id,
          }))}
          onNavigate={onNavigate}
        />
      )}

      {/* Most Read Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-blue-900 dark:text-blue-200 text-xs md:text-sm">MOST READ</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('news/technology')}
              className="px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors flex items-center gap-2 text-sm"
            >
              View more <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => onNavigate && onNavigate(articleHref(mostReadFeatured))}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{mostReadFeatured.category}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm ml-2">
                {timeAgo(mostReadFeatured.publishedAt)}
              </span>
            </div>

            {/* h2, not h1: the lead story above is the page's single H1. Two
                h1s on one page split the topical signal for both. */}
            <h2 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              {mostReadFeatured.title}
            </h2>

            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              {mostReadFeatured.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              {mostReadFeatured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mostReadFeatured.imageUrl} alt={mostReadFeatured.title} className="w-full h-48 md:h-64 object-cover" />
              ) : (
                <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                  <div className="text-black dark:text-[#EFB81A] text-4xl md:text-6xl tracking-wider uppercase">
                    {mostReadFeatured.category}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {mostReadGrid.map((article, index) => (
              <TrendingCard
                key={article.id}
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                tags={article.tags.slice(0, 2)}
                image={article.imageUrl ?? fallbackImage(index)}
                articleSlug={article.slug ?? article.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div
          ref={mostReadScrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 h-fit overflow-x-auto lg:overflow-x-scroll scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mostReadScroll.map((article, index) => (
            <TrendingCard
              key={article.id}
              category={article.category}
              categorySlug={article.categorySlug}
              time={timeAgo(article.publishedAt)}
              title={article.title}
              tags={article.tags.slice(0, 2)}
              image={article.imageUrl ?? fallbackImage(index)}
              articleSlug={article.slug ?? article.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleScroll(mostReadScrollRef, 'left')}
          className="w-10 h-10 rounded-full bg-[#F4F4F4] dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={() => handleScroll(mostReadScrollRef, 'right')}
          className="w-10 h-10 rounded-full bg-[#EFB81A] flex items-center justify-center hover:bg-[#F9D96A] transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Market Section */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <span className="text-green-900 dark:text-green-200 text-xs md:text-sm">MARKET</span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('news/market')}
            className="text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            View more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>

        <div
          ref={marketScrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {marketScrollItems.map((article, idx) => (
            <div key={article.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TrendingCard
                category={article.category}
                categorySlug={article.categorySlug}
                time={timeAgo(article.publishedAt)}
                title={article.title}
                tags={article.tags.slice(0, 2)}
                image={article.imageUrl ?? fallbackImage(idx)}
                articleSlug={article.slug ?? article.id}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 md:mt-6">
          <button
            onClick={() => handleScroll(marketScrollRef, 'left')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleScroll(marketScrollRef, 'right')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 dark:bg-gray-200 flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-gray-800" />
          </button>
        </div>
      </div>

      {/* Points readers from the newsroom into the project directory. */}
      <EcosystemSpotlight projects={spotlightProjects} />

      {/* Policy Section */}
      {policyFeatured && (
        <BestOfMonthSection
          title="POLICY"
          featuredArticle={{
            category: policyFeatured.category,
            categorySlug: policyFeatured.categorySlug,
            time: timeAgo(policyFeatured.publishedAt),
            title: policyFeatured.title,
            image: policyFeatured.imageUrl ?? fallbackImage(0),
            articleSlug: policyFeatured.slug ?? policyFeatured.id,
          }}
          sideArticles={policySide.map((article, index) => ({
            category: article.category,
            categorySlug: article.categorySlug,
            time: timeAgo(article.publishedAt),
            title: article.title,
            image: article.imageUrl ?? fallbackImage(index + 1),
            articleSlug: article.slug ?? article.id,
          }))}
          onNavigate={onNavigate}
        />
      )}
    </main>
  );
}
