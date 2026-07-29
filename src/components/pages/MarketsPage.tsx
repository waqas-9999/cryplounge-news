'use client';

import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '@/data/crossPromotionData';
import { useState } from 'react';

interface MarketsPageProps {
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

export function MarketsPage({ images, onNavigate }: MarketsPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'markets';
  const displayTitle = 'Markets';

  const crossPromotionArticles = getCrossPromotionArticles(category);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const articlesPerPage = 6;
  const totalPages = Math.ceil(crossPromotionArticles.length / articlesPerPage);

  const currentArticles = crossPromotionArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

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
          <div
            onClick={() => onNavigate?.(`news/${category}/crypto-market-cap-surpasses-3-trillion`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">1 hour ago</span>
            </div>
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Total Crypto Market Cap Surpasses $3 Trillion as Institutional Inflows Accelerate
            </h2>
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Bitcoin</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Markets</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Institutional</span>
            </div>
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold">MARKETS</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest in {displayTitle}</h3>
            </div>
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <LatestNewsCard category="Market" categorySlug={category} time="2 hours ago" title="Bitcoin Dominance Rises to 58% as Altcoins Consolidate" image={vrImage} articleSlug="bitcoin-dominance-rises" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Market" categorySlug={category} time="4 hours ago" title="Ethereum Gas Fees Hit Six-Month Low as Blob Transactions Scale" image={solanaImage} articleSlug="ethereum-gas-fees-low" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="ETF" categorySlug={category} time="5 hours ago" title="Spot Bitcoin ETFs Record $800M in Single-Day Inflows" image={speakerImage} articleSlug="spot-btc-etf-inflows" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Technical Analysis" categorySlug={category} time="7 hours ago" title="BTC Chart Forms Classic Bull Flag Pattern, Analysts Target $120K" image={documentImage} articleSlug="btc-bull-flag-pattern" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Market" categorySlug={category} time="9 hours ago" title="Solana, Avalanche Lead Altcoin Rally With Double-Digit Gains" image={asianBusinessmanImage} articleSlug="sol-avax-altcoin-rally" onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Market Overview</h3>
            <div className="space-y-4 md:space-y-6">
              {currentArticles.map((article, index) => (
                <div key={index}>
                  <div onClick={() => onNavigate?.(`news/${article.categorySlug}/${article.slug}`)} className="cursor-pointer group">
                    <div className="mb-2">
                      <span className="text-[#EFB81A] text-xs md:text-sm">{article.category}</span>
                      <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{article.time}</span>
                    </div>
                    <h4 className="text-gray-800 dark:text-[#F3F3F5] text-sm md:text-base group-hover:text-[#EFB81A] transition-colors">{article.title}</h4>
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

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#Bitcoin', '#Ethereum', '#ETF', '#Altcoins', '#Stablecoins', '#DeFi', '#Technical'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">{tag}</span>
              ))}
            </div>
          </div>

          {/* Newsletter Widget */}
          <div className="bg-[#FFD200] rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-black text-base md:text-lg font-semibold mb-2">Markets Newsletter</h3>
            <p className="text-black/70 text-sm mb-4">Get market analysis and price alerts delivered daily.</p>
            <form onSubmit={e => { e.preventDefault(); }} className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2.5 bg-white/80 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More in {displayTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <TrendingCard category="Market" categorySlug={category} time="10 hours ago" title="Bitcoin Halving Countdown: 30 Days and Price Implications" tags={['Bitcoin', 'Halving']} image={vrImage} articleSlug="bitcoin-halving-countdown" onNavigate={onNavigate} />
          <TrendingCard category="Market" categorySlug={category} time="11 hours ago" title="Ethereum Staking Yield Rises to 6.2% After Network Upgrade" tags={['Ethereum', 'Staking']} image={phoneImage} articleSlug="ethereum-staking-yield" onNavigate={onNavigate} />
          <TrendingCard category="Investment" categorySlug={category} time="12 hours ago" title="Crypto Hedge Funds Outperform S&P 500 by 3x in Q1 2026" tags={['Investment', 'Hedge Funds']} image={businessmanImage} articleSlug="crypto-hedge-fund-performance" onNavigate={onNavigate} />
          <TrendingCard category="Technical Analysis" categorySlug={category} time="13 hours ago" title="Ethereum Breaks Key Resistance, Bulls Target $5,000 Next" tags={['ETH', 'Technical']} image={solanaImage} articleSlug="eth-technical-resistance" onNavigate={onNavigate} />
          <TrendingCard category="Stablecoins" categorySlug={category} time="14 hours ago" title="USDT Supply Hits $120B as Demand for Dollar-Pegged Assets Grows" tags={['USDT', 'Stablecoins']} image={speakerImage} articleSlug="usdt-supply-record" onNavigate={onNavigate} />
          <TrendingCard category="ETF" categorySlug={category} time="16 hours ago" title="Ethereum ETF Applications Stack Up as Approval Window Opens" tags={['ETH ETF', 'SEC']} image={documentImage} articleSlug="ethereum-etf-applications" onNavigate={onNavigate} />
          <TrendingCard category="Market" categorySlug={category} time="18 hours ago" title="Cardano ADA Rallies 35% on Smart Contract Upgrade Announcement" tags={['Cardano', 'ADA']} image={asianBusinessmanImage} articleSlug="cardano-ada-rally" onNavigate={onNavigate} />
          <TrendingCard category="Market" categorySlug={category} time="20 hours ago" title="Crypto Fear & Greed Index Enters Extreme Greed Territory" tags={['Sentiment', 'Markets']} image={vrImage} articleSlug="fear-greed-extreme-greed" onNavigate={onNavigate} />
        </div>
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setCurrentArticlePage(p => Math.max(1, p - 1))} disabled={currentArticlePage === 1} className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
          {[1, 2, 3, 4, 5].map(page => (
            <button key={page} onClick={() => setCurrentArticlePage(page)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentArticlePage === page ? 'bg-[#EFB81A] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A]'}`}>{page}</button>
          ))}
          <button onClick={() => setCurrentArticlePage(p => Math.min(5, p + 1))} disabled={currentArticlePage === 5} className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </main>
  );
}
