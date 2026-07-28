import { TrendingCard } from '../components/TrendingCard';
import { LatestNewsCard } from '../components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '../data/crossPromotionData';
import { useState } from 'react';

interface TechnologyPageProps {
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

export function TechnologyPage({ images, onNavigate }: TechnologyPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'technology';
  const displayTitle = 'Technology';
  
  // Get cross-promotion articles from related categories
  const crossPromotionArticles = getCrossPromotionArticles(category);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
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
            onClick={() => onNavigate?.(`news/${category}/blockchain-scalability-breakthrough`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">2 hours ago</span>
            </div>
            
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              New Blockchain Consensus Mechanism Achieves 100,000 TPS Without Sacrificing Decentralization
            </h2>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Technology</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Blockchain</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Innovation</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold">TECH</div>
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
                title="Zero-Knowledge Rollups Process 1 Million Transactions in Single Ethereum Block"
                image={vrImage}
                articleSlug="zk-rollups-ethereum-milestone"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="5 hours ago"
                title="Major Blockchains Implement Quantum-Resistant Cryptography to Future-Proof Networks"
                image={solanaImage}
                articleSlug="quantum-resistant-blockchain"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="7 hours ago"
                title="AI-Powered Smart Contracts Autonomously Optimize Gas Fees and Execution"
                image={speakerImage}
                articleSlug="ai-smart-contracts-optimization"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="9 hours ago"
                title="Universal Cross-Chain Protocol Enables Seamless Asset Transfers Across All Blockchains"
                image={documentImage}
                articleSlug="cross-chain-protocol-launch"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="11 hours ago"
                title="Layer 2 Solutions See 300% Growth in Transaction Volume This Quarter"
                image={asianBusinessmanImage}
                articleSlug="layer2-growth-q1-2026"
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
                    onClick={() => onNavigate?.(`news/${article.categorySlug}/${article.articleSlug}`)}
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 md:mt-6">
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

          {/* Trending Topics */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Trending Topics</h3>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Blockchain
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #ZK-Proofs
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Layer2
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #AI
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Quantum
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Scalability
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
            title="Ethereum Merge Anniversary: Network Efficiency Improved by 99.9%"
            tags={['Ethereum', 'PoS']}
            image={vrImage}
            articleSlug="ethereum-merge-anniversary"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="14 hours ago"
            title="Decentralized Storage Solutions Reach 10 Petabytes Capacity Milestone"
            tags={['Storage', 'Web3']}
            image={phoneImage}
            articleSlug="decentralized-storage-milestone"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="16 hours ago"
            title="New Programming Language Simplifies Smart Contract Development"
            tags={['Development', 'Tools']}
            image={businessmanImage}
            articleSlug="smart-contract-language"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="18 hours ago"
            title="Privacy-Focused Blockchain Launches Mainnet with Enhanced Features"
            tags={['Privacy', 'Launch']}
            image={solanaImage}
            articleSlug="privacy-blockchain-mainnet"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="20 hours ago"
            title="Interoperability Protocol Connects 50+ Blockchain Networks"
            tags={['Interoperability', 'Protocol']}
            image={speakerImage}
            articleSlug="interoperability-protocol-launch"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="Blockchain Validators Achieve 99.99% Uptime Across Networks"
            tags={['Validators', 'Infrastructure']}
            image={documentImage}
            articleSlug="validator-uptime-record"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="Decentralized Identity Solutions Gain Mainstream Adoption"
            tags={['Identity', 'DID']}
            image={asianBusinessmanImage}
            articleSlug="decentralized-identity-adoption"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="2 days ago"
            title="Web3 Gaming Platforms Surpass 10 Million Daily Active Users"
            tags={['Gaming', 'Web3']}
            image={vrImage}
            articleSlug="web3-gaming-milestone"
            onNavigate={onNavigate}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="px-3 py-2 rounded-lg bg-[#EFB81A] text-white text-sm font-medium">
            1
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] text-sm hover:border-[#EFB81A] transition-colors">
            2
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] text-sm hover:border-[#EFB81A] transition-colors">
            3
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] text-sm hover:border-[#EFB81A] transition-colors">
            4
          </button>
          <button className="px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] text-sm hover:border-[#EFB81A] transition-colors">
            5
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] text-sm hover:border-[#EFB81A] transition-colors">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}