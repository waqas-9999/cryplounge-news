import { TrendingCard } from '../components/TrendingCard';
import { LatestNewsCard } from '../components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '../data/crossPromotionData';
import { useState } from 'react';

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

export function ResearchPage({ images, onNavigate }: ResearchPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'research';
  const displayTitle = 'Research';

  const crossPromotionArticles = getCrossPromotionArticles(category);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const articlesPerPage = 6;
  const totalPages = Math.ceil(crossPromotionArticles.length / articlesPerPage);

  const currentArticles = crossPromotionArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const researchTypes = ['Industry Reports', 'Market Reports', 'Project Research', 'Company Research', 'Deep Dive', 'Interviews', 'Opinion'];

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      <button
        onClick={() => onNavigate?.('home')}
        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="flex flex-wrap gap-2">
        {researchTypes.map(type => (
          <span key={type} className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-[#A0A0A5] rounded-full text-xs md:text-sm hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors cursor-pointer">{type}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div
            onClick={() => onNavigate?.(`news/${category}/state-of-crypto-2026`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">Industry Report</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">Today</span>
            </div>
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              State of Crypto 2026: How Institutional Adoption Is Reshaping the Digital Asset Landscape
            </h2>
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Report</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Institutional</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#2026</span>
            </div>
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

          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest {displayTitle}</h3>
            </div>
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <LatestNewsCard category="Market Report" categorySlug={category} time="1 day ago" title="Q1 2026 Crypto Market Report: $1.2T in Spot Volume Traded Across Top Exchanges" image={vrImage} articleSlug="q1-2026-market-report" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Deep Dive" categorySlug={category} time="2 days ago" title="Deep Dive: How Ethereum Rollup Ecosystems Are Evolving in 2026" image={solanaImage} articleSlug="ethereum-rollup-deep-dive" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Project Research" categorySlug={category} time="3 days ago" title="Solana vs Sui vs Aptos: Comparative Analysis of High-Performance Chains" image={speakerImage} articleSlug="solana-sui-aptos-comparison" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Interview" categorySlug={category} time="4 days ago" title="Exclusive: Vitalik Buterin on Ethereum\'s Endgame and Future Roadmap" image={documentImage} articleSlug="vitalik-ethereum-endgame-interview" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Opinion" categorySlug={category} time="5 days ago" title="Why the Next Crypto Bull Run Will Be Driven by Real-World Adoption" image={asianBusinessmanImage} articleSlug="next-bull-run-real-world" onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Featured Reports</h3>
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
              {['#Report', '#DeepDive', '#Opinion', '#Interview', '#Analysis', '#Research'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">{tag}</span>
              ))}
            </div>
          </div>

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

      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More {displayTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <TrendingCard category="Company Research" categorySlug={category} time="1 week ago" title="Coinbase Annual Report Analysis: Path to $10B Revenue by 2027" tags={['Coinbase', 'Analysis']} image={vrImage} articleSlug="coinbase-annual-report" onNavigate={onNavigate} />
          <TrendingCard category="Market Report" categorySlug={category} time="1 week ago" title="DeFi Quarterly Report: Protocol Revenue Reaches $2B in Q4 2025" tags={['DeFi', 'Revenue']} image={phoneImage} articleSlug="defi-quarterly-report" onNavigate={onNavigate} />
          <TrendingCard category="Deep Dive" categorySlug={category} time="1 week ago" title="The Rise of AI Agents in DeFi: Opportunities and Risks" tags={['AI', 'DeFi']} image={businessmanImage} articleSlug="ai-agents-defi-deep-dive" onNavigate={onNavigate} />
          <TrendingCard category="Opinion" categorySlug={category} time="1 week ago" title="Why Bitcoin Is Becoming the Global Reserve Asset of the Internet Age" tags={['Bitcoin', 'Opinion']} image={solanaImage} articleSlug="bitcoin-reserve-asset-opinion" onNavigate={onNavigate} />
          <TrendingCard category="Project Research" categorySlug={category} time="2 weeks ago" title="Polkadot Parachain Ecosystem: State of the Network in 2026" tags={['Polkadot', 'Ecosystem']} image={speakerImage} articleSlug="polkadot-ecosystem-2026" onNavigate={onNavigate} />
          <TrendingCard category="Interview" categorySlug={category} time="2 weeks ago" title="Exclusive Interview: Binance CEO on the Future of Centralized Exchanges" tags={['Binance', 'CEX']} image={documentImage} articleSlug="binance-ceo-interview" onNavigate={onNavigate} />
          <TrendingCard category="Industry Report" categorySlug={category} time="2 weeks ago" title="Global Blockchain Adoption Report 2026: 500M Users and Counting" tags={['Adoption', 'Global']} image={asianBusinessmanImage} articleSlug="blockchain-adoption-report-2026" onNavigate={onNavigate} />
          <TrendingCard category="Deep Dive" categorySlug={category} time="3 weeks ago" title="Cross-Chain Bridges: Security Risks and the Road to Safe Interoperability" tags={['Bridges', 'Security']} image={vrImage} articleSlug="cross-chain-bridges-security" onNavigate={onNavigate} />
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
