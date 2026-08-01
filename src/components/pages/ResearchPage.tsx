'use client';

import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listResearch, type ResearchItem } from '@/services/research';

interface ResearchPageProps {
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

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}

const FALLBACK_IMAGES_KEY = ['vrImage', 'solanaImage', 'speakerImage', 'documentImage', 'asianBusinessmanImage', 'phoneImage', 'businessmanImage'] as const;

export function ResearchPage({ images, onNavigate }: ResearchPageProps) {
  const displayTitle = 'Research';

  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listResearch({ perPage: 30 })
      .then(({ items }) => setItems(items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const imageFor = (index: number) => images[FALLBACK_IMAGES_KEY[index % FALLBACK_IMAGES_KEY.length]];

  const hero = items[0];
  const latest = items.slice(1, 6);
  const sidebarItems = items.slice(6);
  const trending = items.slice(6, 14);

  const tags = Array.from(new Set(items.flatMap(i => i.tags))).slice(0, 8);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const articlesPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(sidebarItems.length / articlesPerPage));

  const currentArticles = sidebarItems.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  if (!loading && !hero) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <p className="text-gray-500 dark:text-[#A0A0A5]">No research reports published yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      <button
        onClick={() => onNavigate?.('home')}
        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          {hero && (
            <div
              onClick={() => onNavigate?.(`news/${hero.categorySlug}/${hero.slug}`)}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
            >
              <div className="mb-3 md:mb-4">
                <span className="text-[#EFB81A] text-xs md:text-sm">{hero.category}</span>
                <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{timeAgo(hero.publishedAt)}</span>
              </div>
              <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
                {hero.title}
              </h2>
              {hero.tags.length > 0 && (
                <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
                  {hero.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#{tag}</span>
                  ))}
                </div>
              )}
              <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
                Read report
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="rounded-xl md:rounded-2xl overflow-hidden">
                <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                  <div className="text-black dark:text-[#EFB81A] text-2xl md:text-4xl lg:text-5xl tracking-wider font-bold">RESEARCH</div>
                </div>
              </div>
            </div>
          )}

          {latest.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest {displayTitle}</h3>
              </div>
              <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
                {latest.map((item, index) => (
                  <div key={item.id}>
                    <LatestNewsCard category={item.category} categorySlug={item.categorySlug} time={timeAgo(item.publishedAt)} title={item.title} image={imageFor(index)} articleSlug={item.slug} onNavigate={onNavigate} />
                    {index < latest.length - 1 && <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          {sidebarItems.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Featured Reports</h3>
              <div className="space-y-4 md:space-y-6">
                {currentArticles.map((item, index) => (
                  <div key={item.id}>
                    <div onClick={() => onNavigate?.(`news/${item.categorySlug}/${item.slug}`)} className="cursor-pointer group">
                      <div className="mb-2">
                        <span className="text-[#EFB81A] text-xs md:text-sm">{item.category}</span>
                        <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{timeAgo(item.publishedAt)}</span>
                      </div>
                      <h4 className="text-gray-800 dark:text-[#F3F3F5] text-sm md:text-base group-hover:text-[#EFB81A] transition-colors">{item.title}</h4>
                    </div>
                    {index < currentArticles.length - 1 && <div className="h-px bg-gray-100 dark:bg-white/[0.08] mt-4 md:mt-6"></div>}
                  </div>
                ))}
                <div className="flex justify-between mt-4 md:mt-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm" disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" /><span>Previous</span>
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm" disabled={currentPage === totalPages}>
                    <span>Next</span><ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#FFD200] rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-black text-base md:text-lg font-semibold mb-2">Research Digest</h3>
            <p className="text-black/70 text-sm mb-4">Receive in-depth reports and analysis weekly.</p>
            <form onSubmit={e => { e.preventDefault(); }} className="space-y-2">
              <input type="email" placeholder="Your email" className="w-full px-3 py-2.5 bg-white/80 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20" />
              <button type="submit" className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {trending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More {displayTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.map((item, index) => (
              <TrendingCard key={item.id} category={item.category} categorySlug={item.categorySlug} time={timeAgo(item.publishedAt)} title={item.title} tags={item.tags.slice(0, 2)} image={imageFor(index)} articleSlug={item.slug} onNavigate={onNavigate} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setCurrentArticlePage(p => Math.max(1, p - 1))} disabled={currentArticlePage === 1} className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
            <span className="px-3 py-2 rounded-lg text-sm font-medium bg-[#EFB81A] text-white">{currentArticlePage}</span>
            <button onClick={() => setCurrentArticlePage(p => p + 1)} className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </main>
  );
}
