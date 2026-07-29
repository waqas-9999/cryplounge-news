'use client';

import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getCrossPromotionArticles } from '@/data/crossPromotionData';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { labelForSlug } from '@/lib/taxonomy';

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
}

export function CategoryPage({ category, images, onNavigate }: CategoryPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  // Labels come from the shared taxonomy so they cannot drift per page.
  const displayTitle = labelForSlug(category);
  
  // Get cross-promotion articles from related categories
  const crossPromotionArticles = getCrossPromotionArticles(category);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('news');
    }
  };

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

      {/* Category Header */}
      

      {/* Featured Article */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div 
            onClick={() => onNavigate?.(`news/${category}/breaking-major-developments`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">2 hours ago</span>
            </div>
            
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Breaking: Major Developments in {displayTitle} Sector Reshaping the Industry
            </h2>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#News</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Crypto</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider">{displayTitle.toUpperCase()}</div>
              </div>
            </div>
          </div>
          
          {/* Latest Articles in Category */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest in {displayTitle}</h3>
            </div>
            
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="3 hours ago"
                title={`${displayTitle} Platform Announces Revolutionary Update to Core Infrastructure`}
                image={vrImage}
                articleSlug="revolutionary-update"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="5 hours ago"
                title={`Top Analysts Predict Major Growth in ${displayTitle} Sector for Q2 2024`}
                image={solanaImage}
                articleSlug="major-growth-prediction"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="7 hours ago"
                title={`Industry Leaders Discuss Future of ${displayTitle} at Major Conference`}
                image={speakerImage}
                articleSlug="industry-leaders-conference"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="9 hours ago"
                title={`New Report Reveals ${displayTitle} Adoption Reaches All-Time High`}
                image={documentImage}
                articleSlug="adoption-report"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="12 hours ago"
                title={`Major Investment Firm Allocates $500M to ${displayTitle} Projects`}
                image={businessmanImage}
                articleSlug="investment-allocation"
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
        
        {/* Sidebar - Featured News and Cross-Promotion */}
        <div className="space-y-6 md:space-y-8">
          {/* Featured News Section */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg">FEATURED NEWS</h3>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {/* Main Featured Article with Image Overlay */}
              <div 
                onClick={() => onNavigate?.('news/market/crypto-etf-market-analysis')}
                className="relative rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group h-[240px] md:h-[280px]"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=600&fit=crop"
                  alt="Crypto Market Analysis"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                  <div className="mb-2">
                    <span className="text-white text-xs md:text-sm">Finance</span>
                    <span className="text-white/80 text-xs md:text-sm ml-2">3 hours ago</span>
                  </div>
                  <h4 className="text-white leading-snug text-base md:text-xl mb-0 group-hover:text-[#F9D96A] transition-colors">
                    US-Approved Spot Bitcoin ETFs Could Surpass Entire $50 Billion Crypto ETP Market
                  </h4>
                </div>
              </div>

              {/* Secondary Featured Articles - Horizontal Layout */}
              <div 
                onClick={() => onNavigate?.('news/technology/blockchain-innovation-2024')}
                className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] transition-all cursor-pointer group flex items-center gap-3 md:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="text-[#EFB81A] text-xs md:text-sm">Technology</span>
                    <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">4 hours ago</span>
                  </div>
                  <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-[#EFB81A] transition-colors line-clamp-2">
                    Breakthrough Blockchain Technology Achieves 100,000 Transactions Per Second
                  </h4>
                </div>
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop"
                    alt="Blockchain technology"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div 
                onClick={() => onNavigate?.('news/business/crypto-enterprise-adoption')}
                className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] transition-all cursor-pointer group flex items-center gap-3 md:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="text-[#EFB81A] text-xs md:text-sm">Business</span>
                    <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">5 hours ago</span>
                  </div>
                  <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-[#EFB81A] transition-colors line-clamp-2">
                    Major Enterprises Announce Blockchain Integration Plans for Q2 2026
                  </h4>
                </div>
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop"
                    alt="Business strategy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Latest News Section */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg">LATEST NEWS</h3>
            </div>
          
            <div className="space-y-3 md:space-y-4">
            {crossPromotionArticles.map((article, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate?.(`news/${article.categorySlug}/${article.slug}`)}
                className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
              >
                <div className="mb-2">
                  <span className="text-[#EFB81A] text-xs md:text-sm">{article.category}</span>
                  <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{article.time}</span>
                </div>
                <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base mb-3 group-hover:text-[#EFB81A] transition-colors">
                  {article.title}
                </h4>
                <div className="flex gap-2">
                  {article.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="text-gray-400 dark:text-[#A0A0A5] text-xs">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* More Articles Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More {displayTitle} Articles</h3>
          <button className="px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors flex items-center gap-2 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { image: vrImage, slug: 'update-1' },
            { image: phoneImage, slug: 'update-2' },
            { image: asianBusinessmanImage, slug: 'update-3' },
            { image: speakerImage, slug: 'update-4' },
            { image: businessmanImage, slug: 'update-5' },
            { image: solanaImage, slug: 'update-6' },
            { image: documentImage, slug: 'update-7' },
            { image: phoneImage, slug: 'update-8' }
          ].map((item, idx) => (
            <TrendingCard 
              key={idx}
              category={displayTitle}
              categorySlug={category}
              time={`${idx + 1} hours ago`}
              title={`${displayTitle}: Important Update #${idx + 1} You Need to Know About`}
              tags={[displayTitle, 'News']}
              image={item.image}
              articleSlug={item.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        
        <div className="flex justify-center gap-2 mt-6 md:mt-8">
          <button className="w-10 h-10 rounded-full bg-[#F4F4F4] dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-[#A0A0A5]" />
          </button>
          <button className="px-4 md:px-5 py-2 md:py-2.5 bg-[#EFB81A] text-black rounded-full text-sm hover:bg-[#F9D96A] transition-colors">
            1
          </button>
          <button className="px-4 md:px-5 py-2 md:py-2.5 bg-[#F4F4F4] dark:bg-[#1A1A1A] text-gray-800 dark:text-[#F3F3F5] border border-gray-200 dark:border-gray-800 rounded-full text-sm hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-colors">
            2
          </button>
          <button className="px-4 md:px-5 py-2 md:py-2.5 bg-[#F4F4F4] dark:bg-[#1A1A1A] text-gray-800 dark:text-[#F3F3F5] border border-gray-200 dark:border-gray-800 rounded-full text-sm hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-colors">
            3
          </button>
          <button className="w-10 h-10 rounded-full bg-[#EFB81A] flex items-center justify-center hover:bg-[#F9D96A] transition-colors">
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </main>
  );
}