'use client';

import { useRef } from 'react';
import { HeroArticle } from '@/components/HeroArticle';
import { ArticleCardSmall } from '@/components/ArticleCardSmall';
import { RecommendedCard } from '@/components/RecommendedCard';
import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { FeaturedNewsSection } from '@/components/FeaturedNewsSection';
import { BestOfMonthSection } from '@/components/BestOfMonthSection';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomePageProps {
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

export function HomePage({ images, onNavigate }: HomePageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;
  
  // Refs for scrollable containers
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const mostReadScrollRef = useRef<HTMLDivElement>(null);
  const marketScrollRef = useRef<HTMLDivElement>(null);
  const geopoliticsScrollRef = useRef<HTMLDivElement>(null);

  // Scroll handlers
  // React 19 types `useRef<T>(null)` as RefObject<T | null>, so accept that here.
  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? ref.current.scrollLeft - scrollAmount 
        : ref.current.scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          <HeroArticle 
            category="Finance"
            categorySlug="finance"
            time="4 hours ago"
            title="Bitcoin ETFs Could Surpass Entire $50 Billion Crypto ETP Market: Major Financial Institutions Embrace Crypto"
            tags={['Finance', 'Investment']}
            articleSlug="bitcoin-etf-institutional-investment"
            onNavigate={onNavigate}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <ArticleCardSmall 
              category="Technology"
              categorySlug="technology"
              time="5 hours ago"
              title="Blockchain Technology Achieves Record 100,000 Transactions Per Second..."
              articleSlug="blockchain-scalability-breakthrough"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category="Geopolitics"
              categorySlug="geopolitics"
              time="6 hours ago"
              title="Global Regulations Reshape Cryptocurrency Landscape as Nations Collaborate..."
              articleSlug="global-crypto-regulations-2026"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category="Business"
              categorySlug="business"
              time="7 hours ago"
              title="Major Enterprises Announce Blockchain Integration Plans for Q2 2026..."
              articleSlug="enterprise-blockchain-adoption"
              onNavigate={onNavigate}
            />
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-base sm:text-lg md:text-xl">Recommended</h2>
            <button 
              onClick={() => onNavigate && onNavigate('news/finance')}
              className="text-xs sm:text-sm text-gray-600 dark:text-[#A0A0A5] hover:text-gray-800 dark:hover:text-yellow-400 transition-colors flex items-center gap-1 min-h-[44px] items-center"
            >
              View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <RecommendedCard 
            category="Finance"
            categorySlug="finance"
            time="3 hours ago"
            title="US-Approved Spot Bitcoin ETFs Could Surpass Entire $50 Billion Crypto ETP Market: BitMEX"
            image={businessmanImage}
            articleSlug="bitcoin-etf-market-analysis"
            variant="large"
            onNavigate={onNavigate}
          />
          
          <div className="space-y-3 md:space-y-4">
            <RecommendedCard 
              category="Technology"
              categorySlug="technology"
              time="4 hours ago"
              title="Blockchain Technology Achieves 100,000 Transactions Per Second Breakthrough"
              image={vrImage}
              articleSlug="blockchain-scalability-breakthrough-2026"
              onNavigate={onNavigate}
            />
            <RecommendedCard 
              category="Geopolitics"
              categorySlug="geopolitics"
              time="5 hours ago"
              title="G20 Nations Reach Consensus on Global Cryptocurrency Regulatory Framework"
              image={solanaImage}
              articleSlug="g20-crypto-regulation-2026"
              onNavigate={onNavigate}
            />
            <RecommendedCard 
              category="Business"
              categorySlug="business"
              time="6 hours ago"
              title="Fortune 500 Companies Now Hold Over $15 Billion in Bitcoin on Balance Sheets"
              image={speakerImage}
              articleSlug="corporate-bitcoin-adoption-2026"
              onNavigate={onNavigate}
            />
            <RecommendedCard 
              category="Finance"
              categorySlug="finance"
              time="7 hours ago"
              title="Stablecoin Payment Volume Exceeds $1 Trillion Annually, Rivals Traditional Networks"
              image={documentImage}
              articleSlug="stablecoin-payments-growth-2026"
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>

      {/* Latest News Section (Previously Trending Now) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg">
              <span className="text-black dark:text-[#EFB81A] text-xs md:text-sm">LATEST NEWS</span>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('news/finance')}
              className="px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors flex items-center gap-2 text-sm"
            >
              View more <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div 
            onClick={() => onNavigate && onNavigate('news/finance/cbdc-global-adoption-2026')}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">Finance</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm ml-2">2 hours ago</span>
            </div>
            
            <h1 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Central Banks Accelerate CBDC Development as Digital Currency Adoption Surges Globally
            </h1>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">#CBDC</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">#Finance</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-4xl md:text-6xl tracking-wider">FINANCE</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <TrendingCard 
              category="Finance"
              categorySlug="finance"
              time="3 hours ago"
              title="Crypto Market Cap Surpasses $2 Trillion as Institutional Money Flows In..."
              tags={['Finance', 'Markets']}
              image={vrImage}
              articleSlug="crypto-market-2-trillion-milestone"
              onNavigate={onNavigate}
            />
            <TrendingCard 
              category="Technology"
              categorySlug="technology"
              time="4 hours ago"
              title="New Blockchain Consensus Protocol Achieves 100,000 TPS..."
              tags={['Technology', 'Innovation']}
              image={speakerImage}
              articleSlug="blockchain-consensus-breakthrough"
              onNavigate={onNavigate}
            />
            <TrendingCard 
              category="Business"
              categorySlug="business"
              time="5 hours ago"
              title="Amazon Web Services Launches Managed Blockchain for Enterprise..."
              tags={['Business', 'Enterprise']}
              image={businessmanImage}
              articleSlug="aws-blockchain-enterprise"
              onNavigate={onNavigate}
            />
          </div>
        </div>
        
        <div 
          ref={latestScrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 h-fit overflow-x-auto lg:overflow-x-scroll scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <TrendingCard 
            category="Finance"
            categorySlug="finance"
            time="6 hours ago"
            title="Major Exchange Announces Support for New Layer 2 Solutions..."
            tags={['Finance', 'Trading']}
            image={vrImage}
            articleSlug="exchange-layer2-support"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Business"
            categorySlug="business"
            time="7 hours ago"
            title="Crypto Startup Raises $100M to Build Next-Gen Payment Infrastructure..."
            tags={['Business', 'Startups']}
            image={phoneImage}
            articleSlug="crypto-payment-startup-funding"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Technology"
            categorySlug="technology"
            time="8 hours ago"
            title="AI-Powered Trading Bot Generates 200% Returns in Q1 2026..."
            tags={['Technology', 'AI']}
            image={asianBusinessmanImage}
            articleSlug="ai-trading-bot-performance"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Geopolitics"
            categorySlug="geopolitics"
            time="9 hours ago"
            title="New Security Protocol Prevents $500M in Potential Hacks This Year..."
            tags={['Geopolitics', 'Security']}
            image={speakerImage}
            articleSlug="security-protocol-prevents-hacks"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Geopolitics"
            categorySlug="geopolitics"
            time="10 hours ago"
            title="EU Announces New Crypto Regulation Framework for 2026..."
            tags={['Geopolitics', 'Regulation']}
            image={businessmanImage}
            articleSlug="eu-crypto-regulation-2024"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Technology"
            categorySlug="technology"
            time="11 hours ago"
            title="Zero-Knowledge Proofs See Major Breakthrough in Scalability..."
            tags={['Technology', 'Innovation']}
            image={vrImage}
            articleSlug="zk-proofs-scalability-breakthrough"
            onNavigate={onNavigate}
          />
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
      <FeaturedNewsSection 
        mainImage={asianBusinessmanImage}
        mainCategory="Finance"
        mainCategorySlug="finance"
        mainArticleSlug="bitcoin-institutional-investment-surge"
        mainTitle="Over 65% of Crypto-Related Tweets and 84% of Conversations on Reddit Were Positive in 2023"
        mainTags={['Bitcoin', 'Institutional']}
        mainTime="1 hour ago"
        sidebarArticles={[
          {
            category: "Technology",
            categorySlug: "technology",
            time: "2 hours ago",
            title: "Top Analyst Unveils Ethereum Catalyst That Could Trigger Nearly 50% Surge for ETH – Here's His Outlook",
            articleSlug: "ethereum-price-catalyst-analysis"
          },
          {
            category: "Finance",
            categorySlug: "finance",
            time: "3 hours ago",
            title: "Over 65% of Crypto-Related Tweets and 84% of Conversations on Reddit Were Positive in 2023",
            articleSlug: "defi-adoption-metrics-2024"
          },
          {
            category: "Business",
            categorySlug: "business",
            time: "4 hours ago",
            title: "STX Price Prediction: After 126% Price Jump in December, What's in Store for 2024?",
            articleSlug: "altcoin-investment-opportunities"
          }
        ]}
        onNavigate={onNavigate}
      />

      {/* Most Read Section (Previously Best of the Week) */}
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
            onClick={() => onNavigate && onNavigate('news/technology/blockchain-scalability-breakthrough-2026')}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">Technology</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm ml-2">4 hours ago</span>
              <span className="text-blue-600 dark:text-blue-400 text-xs md:text-sm ml-2">• 125K views</span>
            </div>
            
            <h1 className="text-gray-800 dark:text-gray-200 text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              New Blockchain Consensus Mechanism Achieves 100,000 TPS Without Sacrificing Decentralization
            </h1>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">#Technology</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">#Innovation</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-4xl md:text-6xl tracking-wider">TECH</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <TrendingCard 
              category="Finance"
              categorySlug="finance"
              time="1 day ago"
              title="Bitcoin ETF Approval Impact on Market Dynamics..."
              tags={['Finance', 'ETF']}
              image={asianBusinessmanImage}
              articleSlug="bitcoin-etf-approval-impact"
              onNavigate={onNavigate}
            />
            <TrendingCard 
              category="Geopolitics"
              categorySlug="geopolitics"
              time="1 day ago"
              title="US Congress Passes Comprehensive Crypto Regulation Framework..."
              tags={['Regulation', 'Policy']}
              image={speakerImage}
              articleSlug="us-crypto-regulation-framework"
              onNavigate={onNavigate}
            />
            <TrendingCard 
              category="Business"
              categorySlug="business"
              time="2 days ago"
              title="Fortune 500 Companies Double Their Crypto Holdings..."
              tags={['Business', 'Institutional']}
              image={businessmanImage}
              articleSlug="fortune-500-crypto-holdings"
              onNavigate={onNavigate}
            />
          </div>
        </div>
        
        <div 
          ref={mostReadScrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 h-fit overflow-x-auto lg:overflow-x-scroll scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <TrendingCard 
            category="Technology"
            categorySlug="technology"
            time="2 days ago"
            title="AI-Powered Trading Bots Revolutionize Crypto Markets..."
            tags={['Technology', 'AI']}
            image={vrImage}
            articleSlug="ai-trading-bots-revolution"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Finance"
            categorySlug="finance"
            time="3 days ago"
            title="Stablecoin Adoption Reaches New Heights in 2026..."
            tags={['Finance', 'Stablecoins']}
            image={phoneImage}
            articleSlug="stablecoin-adoption-2026"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Business"
            categorySlug="business"
            time="3 days ago"
            title="Major Corporations Integrate Blockchain into Supply Chains..."
            tags={['Business', 'Enterprise']}
            image={businessmanImage}
            articleSlug="blockchain-supply-chain-integration"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category="Geopolitics"
            categorySlug="geopolitics"
            time="4 days ago"
            title="G7 Nations Announce Joint CBDC Initiative..."
            tags={['Geopolitics', 'CBDC']}
            image={speakerImage}
            articleSlug="g7-cbdc-initiative"
            onNavigate={onNavigate}
          />
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

      {/* Market Section (Previously Latest News) */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <span className="text-green-900 dark:text-green-200 text-xs md:text-sm">MARKET</span>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('news/finance')}
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
          {[
            { image: asianBusinessmanImage, category: 'Finance', slug: 'bitcoin-price-surge-2026', title: 'Bitcoin Price Surges to New All-Time High Above $75K...' },
            { image: vrImage, category: 'Finance', slug: 'ethereum-defi-dominance', title: 'Ethereum DeFi TVL Reaches $200 Billion Milestone...' },
            { image: phoneImage, category: 'Finance', slug: 'altcoin-market-rally', title: 'Altcoin Market Sees 300% Growth in Q1 2026...' },
            { image: businessmanImage, category: 'Finance', slug: 'institutional-crypto-investments', title: 'Institutional Investors Allocate $50B to Crypto...' },
            { image: speakerImage, category: 'Finance', slug: 'stablecoin-market-expansion', title: 'Stablecoin Market Cap Exceeds $300 Billion...' }
          ].map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TrendingCard 
                category={item.category}
                categorySlug={item.category.toLowerCase()}
                time={`${idx + 1} day ago`}
                title={item.title}
                tags={['Market', 'Trading']}
                image={item.image}
                articleSlug={item.slug}
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

      {/* Geopolitics Section (Previously Popular News) */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <span className="text-purple-900 dark:text-purple-200 text-xs md:text-sm">GEOPOLITICS</span>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('news/geopolitics')}
            className="text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            View more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div 
          ref={geopoliticsScrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[
            { image: speakerImage, category: 'Geopolitics', slug: 'us-crypto-regulation-2026', title: 'US Congress Passes Comprehensive Crypto Regulation Bill...' },
            { image: businessmanImage, category: 'Geopolitics', slug: 'eu-mica-implementation', title: 'EU MiCA Regulation Goes Into Effect Across Member States...' },
            { image: asianBusinessmanImage, category: 'Geopolitics', slug: 'asia-crypto-adoption', title: 'Asian Nations Lead Global Crypto Adoption in 2026...' },
            { image: phoneImage, category: 'Geopolitics', slug: 'g20-crypto-framework', title: 'G20 Summit Unveils Unified Crypto Regulatory Framework...' },
            { image: vrImage, category: 'Geopolitics', slug: 'cbdc-global-expansion', title: 'Over 100 Countries Now Exploring or Piloting CBDCs...' }
          ].map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TrendingCard 
                category={item.category}
                categorySlug={item.category.toLowerCase()}
                time={`${idx + 1} day ago`}
                title={item.title}
                tags={['Regulation', 'Policy']}
                image={item.image}
                articleSlug={item.slug}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-4 md:mt-6">
          <button 
            onClick={() => handleScroll(geopoliticsScrollRef, 'left')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            onClick={() => handleScroll(geopoliticsScrollRef, 'right')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 dark:bg-gray-200 flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-gray-800" />
          </button>
        </div>
      </div>

      {/* Policy Section (Previously Best of the Month) */}
      <BestOfMonthSection 
        title="POLICY"
        featuredArticle={{
          category: "Geopolitics",
          categorySlug: "geopolitics",
          time: "1 day ago",
          title: "Global Monetary Policy Shift: Central Banks Embrace Digital Currency Infrastructure",
          image: speakerImage,
          articleSlug: "global-monetary-policy-cbdc"
        }}
        sideArticles={[
          {
            category: "Geopolitics",
            categorySlug: "geopolitics",
            time: "2 days ago",
            title: "International Regulatory Bodies Release Joint Cryptocurrency Guidelines",
            image: solanaImage,
            articleSlug: "international-crypto-guidelines"
          },
          {
            category: "Geopolitics",
            categorySlug: "geopolitics",
            time: "3 days ago",
            title: "G20 Summit: Nations Agree on Unified Cryptocurrency Regulatory Framework",
            image: phoneImage,
            articleSlug: "g20-unified-crypto-regulation"
          },
          {
            category: "Geopolitics",
            categorySlug: "geopolitics",
            time: "4 days ago",
            title: "Financial Action Task Force Updates Travel Rule for Crypto Transactions",
            image: businessmanImage,
            articleSlug: "fatf-travel-rule-update"
          }
        ]}
        onNavigate={onNavigate}
      />
    </main>
  );
}