'use client';

import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCrossPromotionArticles } from '@/data/crossPromotionData';
import { useState } from 'react';

interface RegulationPageProps {
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

export function RegulationPage({ images, onNavigate }: RegulationPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;

  const category = 'regulation';
  const displayTitle = 'Regulation';

  const crossPromotionArticles = getCrossPromotionArticles(category);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const articlesPerPage = 6;
  const totalPages = Math.ceil(crossPromotionArticles.length / articlesPerPage);

  const currentArticles = crossPromotionArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const regions = ['Global', 'United States', 'Europe', 'India', 'Middle East', 'Asia-Pacific', 'Tax', 'Compliance', 'AML', 'KYC'];

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
        {regions.map(region => (
          <span key={region} className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-[#A0A0A5] rounded-full text-xs md:text-sm hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors cursor-pointer">{region}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div
            onClick={() => onNavigate?.(`news/${category}/us-crypto-regulation-framework`)}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">United States</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">3 hours ago</span>
            </div>
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              US Congress Passes Landmark Crypto Regulatory Framework After Years of Debate
            </h2>
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#USA</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#SEC</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">#Compliance</span>
            </div>
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                <div className="text-black dark:text-[#EFB81A] text-2xl md:text-4xl lg:text-5xl tracking-wider font-bold">REGULATION</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest in {displayTitle}</h3>
            </div>
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <LatestNewsCard category="Europe" categorySlug={category} time="4 hours ago" title="MiCA Full Implementation Brings Legal Clarity to 450M EU Citizens" image={vrImage} articleSlug="mica-full-implementation" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="India" categorySlug={category} time="6 hours ago" title="India Unveils Crypto Tax Reforms to Encourage Domestic Trading" image={solanaImage} articleSlug="india-crypto-tax-reform" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Middle East" categorySlug={category} time="8 hours ago" title="UAE Positions Abu Dhabi as Global Crypto Hub With New ADGM Rules" image={speakerImage} articleSlug="uae-adgm-crypto-hub" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="AML" categorySlug={category} time="10 hours ago" title="FATF Travel Rule Compliance Reaches 80% Among Global Exchanges" image={documentImage} articleSlug="fatf-travel-rule-compliance" onNavigate={onNavigate} />
              <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>
              <LatestNewsCard category="Asia-Pacific" categorySlug={category} time="12 hours ago" title="Singapore MAS Issues New Guidelines for Digital Asset Custody" image={asianBusinessmanImage} articleSlug="singapore-mas-custody-guidelines" onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-[#F3F3F5] text-base md:text-lg mb-4 md:mb-6">Global Updates</h3>
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
              {['#SEC', '#MiCA', '#FATF', '#KYC', '#AML', '#Tax', '#Compliance'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-xs md:text-sm hover:bg-[#F9D96A]/40 dark:hover:bg-[#EFB81A]/20 transition-colors cursor-pointer">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFD200] rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-black text-base md:text-lg font-semibold mb-2">Regulation Alerts</h3>
            <p className="text-black/70 text-sm mb-4">Get regulatory updates from global jurisdictions.</p>
            <form onSubmit={e => { e.preventDefault(); }} className="space-y-2">
              <input type="email" placeholder="Your email" className="w-full px-3 py-2.5 bg-white/80 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20" />
              <button type="submit" className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More in {displayTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <TrendingCard category="United States" categorySlug={category} time="14 hours ago" title="CFTC Expands Crypto Jurisdiction to Include DeFi Protocols" tags={['CFTC', 'DeFi']} image={vrImage} articleSlug="cftc-defi-jurisdiction" onNavigate={onNavigate} />
          <TrendingCard category="Tax" categorySlug={category} time="15 hours ago" title="IRS Releases Crypto Tax Guidance Covering NFTs and DeFi Yield" tags={['IRS', 'Tax']} image={phoneImage} articleSlug="irs-crypto-tax-guidance" onNavigate={onNavigate} />
          <TrendingCard category="KYC" categorySlug={category} time="16 hours ago" title="Zero-Knowledge KYC Solutions Gain Traction Among Compliant DEXs" tags={['KYC', 'ZK-Proof']} image={businessmanImage} articleSlug="zk-kyc-dex" onNavigate={onNavigate} />
          <TrendingCard category="Europe" categorySlug={category} time="17 hours ago" title="ECB Digital Euro Pilot Expands to Five New Member States" tags={['CBDC', 'Europe']} image={solanaImage} articleSlug="ecb-digital-euro-pilot" onNavigate={onNavigate} />
          <TrendingCard category="Asia-Pacific" categorySlug={category} time="18 hours ago" title="Japan FSA Approves 12 New Cryptocurrency Exchange Licenses" tags={['Japan', 'FSA']} image={speakerImage} articleSlug="japan-fsa-exchange-licenses" onNavigate={onNavigate} />
          <TrendingCard category="Global" categorySlug={category} time="20 hours ago" title="G20 Nations Agree on Unified Crypto Reporting Framework" tags={['G20', 'Global']} image={documentImage} articleSlug="g20-crypto-reporting" onNavigate={onNavigate} />
          <TrendingCard category="Middle East" categorySlug={category} time="22 hours ago" title="Saudi Arabia Launches Blockchain Regulatory Sandbox for Fintechs" tags={['Saudi', 'Sandbox']} image={asianBusinessmanImage} articleSlug="saudi-blockchain-sandbox" onNavigate={onNavigate} />
          <TrendingCard category="Compliance" categorySlug={category} time="1 day ago" title="Crypto Exchanges Invest $2B in Compliance Infrastructure in 2026" tags={['Compliance', 'Exchanges']} image={vrImage} articleSlug="exchange-compliance-investment" onNavigate={onNavigate} />
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
