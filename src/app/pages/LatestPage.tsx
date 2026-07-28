import { TrendingCard } from '../components/TrendingCard';
import { LatestNewsCard } from '../components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '../data/crossPromotionData';
import { useState } from 'react';

interface LatestPageProps {
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

export function LatestPage({ images, onNavigate }: LatestPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'latest';
  const displayTitle = 'Latest';

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
            onClick={() => onNavigate?.(`news/${category}/breaking-bitcoin-all-time-high`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">Breaking</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">12 minutes ago</span>
            </div>
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Bitcoin Surges Past $100K as Institutional Demand Hits New Record
            </h2>
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Bitcoin</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Markets</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Breaking</span>
            </div>
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold">LATEST</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest Stories</h3>
            </div>
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <LatestNewsCard category="Breaking" categorySlug={category} time="30 min ago" title="SEC Approves New Crypto ETF Applications From Major Asset Managers" image={vrImage} articleSlug="sec-approves-crypto-etf" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category={displayTitle} categorySlug={category} time="1 hour ago" title="Ethereum Layer 2 Networks Hit Combined $50B in Total Value Locked" image={solanaImage} articleSlug="eth-layer2-tvl-record" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category={displayTitle} categorySlug={category} time="2 hours ago" title="Solana DeFi Volume Overtakes Ethereum for First Time in 2026" image={speakerImage} articleSlug="solana-defi-volume-record" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category={displayTitle} categorySlug={category} time="3 hours ago" title="Central Banks Explore Crypto Reserves as Dollar Weakens" image={documentImage} articleSlug="central-banks-crypto-reserves" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category={displayTitle} categorySlug={category} time="4 hours ago" title="Binance Receives Full Regulatory Approval in Three New Markets" image={asianBusinessmanImage} articleSlug="binance-regulatory-approval" onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Trending Now</h3>
            <div className="space-y-4 md:space-y-6">
              {currentArticles.map((article, index) => (
                <div key={index}>
                  <div onClick={() => onNavigate?.(`news/${article.categorySlug}/${article.articleSlug}`)} className="cursor-pointer group">
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
              {['#Bitcoin', '#Ethereum', '#DeFi', '#ETF', '#Layer2', '#Stablecoins', '#Web3'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFD200] rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-black text-base md:text-lg font-semibold mb-2">Breaking News Alerts</h3>
            <p className="text-black/70 text-sm mb-4">Be first to know about major crypto events.</p>
            <form onSubmit={e => { e.preventDefault(); }} className="space-y-2">
              <input type="email" placeholder="Your email" className="w-full px-3 py-2.5 bg-white/80 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20" />
              <button type="submit" className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Most Read</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <TrendingCard category={displayTitle} categorySlug={category} time="5 hours ago" title="BlackRock Bitcoin ETF Surpasses $20B in Assets Under Management" tags={['BlackRock', 'ETF']} image={vrImage} articleSlug="blackrock-btc-etf-aua" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="6 hours ago" title="MicroStrategy Adds 10,000 BTC to Corporate Treasury Holdings" tags={['MicroStrategy', 'Bitcoin']} image={phoneImage} articleSlug="microstrategy-btc-purchase" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="8 hours ago" title="Coinbase Reports Record Revenue as Crypto Trading Volumes Soar" tags={['Coinbase', 'Exchange']} image={businessmanImage} articleSlug="coinbase-record-revenue" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="10 hours ago" title="DeFi Protocol Aave Launches V4 with Cross-Chain Liquidity" tags={['Aave', 'DeFi']} image={solanaImage} articleSlug="aave-v4-launch" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="12 hours ago" title="Hong Kong Crypto Exchange Volume Triples After Regulation Update" tags={['HongKong', 'Regulation']} image={speakerImage} articleSlug="hk-exchange-volume" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="14 hours ago" title="NFT Market Rebounds with $500M in Monthly Sales Volume" tags={['NFT', 'Markets']} image={documentImage} articleSlug="nft-market-rebound" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="16 hours ago" title="Grayscale Converts GBTC Discount to Premium for First Time" tags={['Grayscale', 'ETF']} image={asianBusinessmanImage} articleSlug="grayscale-gbtc-premium" onNavigate={onNavigate} />
          <TrendingCard category={displayTitle} categorySlug={category} time="18 hours ago" title="Uniswap V4 Hooks Enable Custom AMM Logic for Developers" tags={['Uniswap', 'DeFi']} image={vrImage} articleSlug="uniswap-v4-hooks" onNavigate={onNavigate} />
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
