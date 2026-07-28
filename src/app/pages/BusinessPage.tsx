import { TrendingCard } from '../components/TrendingCard';
import { LatestNewsCard } from '../components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '../data/crossPromotionData';
import { useState } from 'react';

interface BusinessPageProps {
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

export function BusinessPage({ images, onNavigate }: BusinessPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'business';
  const displayTitle = 'Business';
  
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
            onClick={() => onNavigate?.(`news/${category}/corporate-bitcoin-holdings`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">2 hours ago</span>
            </div>
            
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              Fortune 500 Companies Now Hold $15B in Bitcoin on Corporate Balance Sheets
            </h2>
            
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Business</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Corporate</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Bitcoin</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold">BUSINESS</div>
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
                title="PayPal Expands Crypto Services to 200 Countries, Enables Merchant Payments"
                image={vrImage}
                articleSlug="paypal-global-crypto-expansion"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="5 hours ago"
                title="Amazon Web Services Launches Managed Blockchain Network for Enterprise Clients"
                image={solanaImage}
                articleSlug="aws-blockchain-enterprise"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="7 hours ago"
                title="Visa and Mastercard Partner with Major Stablecoin Issuers for Settlement"
                image={speakerImage}
                articleSlug="visa-mastercard-stablecoin-partnership"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="9 hours ago"
                title="Retail Giants Test Blockchain-Based Supply Chain Solutions"
                image={documentImage}
                articleSlug="retail-blockchain-supply-chain"
                onNavigate={onNavigate}
              />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard 
                category={displayTitle}
                categorySlug={category}
                time="11 hours ago"
                title="Major Accounting Firms Launch Crypto Audit Services"
                image={asianBusinessmanImage}
                articleSlug="crypto-audit-services-launch"
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
                #Enterprise
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Adoption
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Corporate
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Payments
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Supply Chain
              </span>
              <span className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">
                #Treasury
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
            title="Tech Giants Form Consortium for Blockchain Standards"
            tags={['Tech', 'Standards']}
            image={vrImage}
            articleSlug="tech-blockchain-consortium"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="14 hours ago"
            title="E-Commerce Platforms Integrate Crypto Payment Options"
            tags={['E-Commerce', 'Payments']}
            image={phoneImage}
            articleSlug="ecommerce-crypto-payments"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="16 hours ago"
            title="Insurance Companies Launch Crypto Asset Coverage Products"
            tags={['Insurance', 'Coverage']}
            image={businessmanImage}
            articleSlug="crypto-insurance-products"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="18 hours ago"
            title="Real Estate Firms Pilot Blockchain Property Transactions"
            tags={['Real Estate', 'Blockchain']}
            image={solanaImage}
            articleSlug="real-estate-blockchain"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="20 hours ago"
            title="Automotive Industry Explores NFT-Based Vehicle Ownership"
            tags={['Automotive', 'NFTs']}
            image={speakerImage}
            articleSlug="automotive-nft-ownership"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="Healthcare Sector Tests Blockchain for Patient Data Management"
            tags={['Healthcare', 'Data']}
            image={documentImage}
            articleSlug="healthcare-blockchain-data"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="1 day ago"
            title="Airlines Launch Blockchain-Based Loyalty Programs"
            tags={['Airlines', 'Loyalty']}
            image={asianBusinessmanImage}
            articleSlug="airline-blockchain-loyalty"
            onNavigate={onNavigate}
          />
          <TrendingCard 
            category={displayTitle}
            categorySlug={category}
            time="2 days ago"
            title="Global Logistics Companies Adopt Smart Contracts"
            tags={['Logistics', 'Contracts']}
            image={vrImage}
            articleSlug="logistics-smart-contracts"
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
