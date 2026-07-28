'use client';

import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '@/data/crossPromotionData';
import { useState } from 'react';

interface FinancePageProps {
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

export function FinancePage({ images, onNavigate }: FinancePageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'finance';
  const displayTitle = 'Finance';
  
  // Get cross-promotion articles from related categories
  const crossPromotionArticles = getCrossPromotionArticles(category);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const articlesPerPage = 6;
  const totalPages = Math.ceil(crossPromotionArticles.length / articlesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextArticlePage = () => {
    if (currentArticlePage < 5) {
      setCurrentArticlePage(currentArticlePage + 1);
    }
  };

  const handlePrevArticlePage = () => {
    if (currentArticlePage > 1) {
      setCurrentArticlePage(currentArticlePage - 1);
    }
  };

  const currentArticles = crossPromotionArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </button>

      {/* Featured Article */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div 
            onClick={() => onNavigate?.(`news/${category}/crypto-market-surge-institutional`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">2 hours ago</span>
            </div>
            
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Crypto Market Cap Surpasses $2 Trillion as Institutional Money Flows In
            </h2>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Finance</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Markets</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Institutional</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold">FINANCE</div>
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
                title="Bitcoin ETFs See $500M Daily Inflows as Wall Street Embraces Crypto"
                image={vrImage}
                articleSlug="bitcoin-etf-daily-inflows"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="5 hours ago"
                title="Major US Banks Launch Crypto Custody Services for High Net Worth Clients"
                image={solanaImage}
                articleSlug="banks-crypto-custody-launch"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="7 hours ago"
                title="Stablecoin Payment Volume Exceeds $1 Trillion Annually, Rivals Visa"
                image={speakerImage}
                articleSlug="stablecoin-payment-volume"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="9 hours ago"
                title="Crypto Derivatives Market Hits $10B Open Interest as Trading Activity Surges"
                image={documentImage}
                articleSlug="derivatives-market-growth"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="11 hours ago"
                title="DeFi Total Value Locked Reaches New All-Time High of $150B"
                image={asianBusinessmanImage}
                articleSlug="defi-tvl-record"
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
        
        {/* Sidebar - Featured News from other categories */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Featured News</h3>
            
            <div className="space-y-4 md:space-y-6">
              {currentArticles.map((article, index) => (
                <div key={index}>
                  <div 
                    onClick={() => onNavigate?.(`news/${article.categorySlug}/${article.slug}`)}
                    className="cursor-pointer group"
                  >
                    <div className="mb-2">
                      <span className="text-[#EFB81A] text-xs md:text-sm">{article.category}</span>
                      <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{article.time}</span>
                    </div>
                    <h4 className="text-gray-800 dark:text-[#F3F3F5] text-sm md:text-base group-hover:text-[#EFB81A] transition-colors">
                      {article.title}
                    </h4>
                  </div>
                  {index < currentArticles.length - 1 && (
                    <div className="h-px bg-gray-100 dark:bg-white/[0.08] mt-4 md:mt-6"></div>
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-4 md:mt-6">
                <button
                  onClick={handlePrevPage}
                  className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextPage}
                  className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
                  disabled={currentPage === totalPages}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Trending Topics</h3>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Bitcoin
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #ETF
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #DeFi
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Trading
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Stablecoins
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Markets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* More Articles */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More in {displayTitle}</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="12 hours ago"
            title="Ethereum Staking Returns Outperform Traditional Bonds"
            tags={['Ethereum', 'Staking']}
            image={vrImage}
            articleSlug="ethereum-staking-returns"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="14 hours ago"
            title="Crypto Hedge Funds Report 45% Average Returns for 2026"
            tags={['Hedge Funds', 'Returns']}
            image={phoneImage}
            articleSlug="crypto-hedge-fund-returns"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="16 hours ago"
            title="Lending Platforms See Record Borrowing Activity"
            tags={['Lending', 'DeFi']}
            image={businessmanImage}
            articleSlug="lending-platforms-activity"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="18 hours ago"
            title="Yield Farming Strategies Evolve with New Protocols"
            tags={['Yield', 'Farming']}
            image={solanaImage}
            articleSlug="yield-farming-strategies"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="20 hours ago"
            title="Decentralized Exchanges Break Daily Volume Records"
            tags={['DEX', 'Volume']}
            image={speakerImage}
            articleSlug="dex-volume-records"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="NFT Marketplaces Launch Fractional Ownership Features"
            tags={['NFTs', 'Finance']}
            image={documentImage}
            articleSlug="nft-fractional-ownership"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="Institutional Crypto Lending Reaches $50B Total Value"
            tags={['Institutional', 'Lending']}
            image={asianBusinessmanImage}
            articleSlug="institutional-crypto-lending"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="2 days ago"
            title="Algorithmic Trading Bots Dominate 60% of Crypto Volume"
            tags={['Trading', 'AI']}
            image={vrImage}
            articleSlug="algorithmic-trading-bots"
            onNavigate={onNavigate}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={handlePrevArticlePage}
            disabled={currentArticlePage === 1}
            className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page}
              onClick={() => setCurrentArticlePage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentArticlePage === page
                  ? 'bg-[#EFB81A] text-white'
                  : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A]'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={handleNextArticlePage}
            disabled={currentArticlePage === 5}
            className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}