'use client';

import { Twitter, Send, Globe, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AuthorPageProps {
  onNavigate: (page: string) => void;
  authorSlug?: string;
}

const MOCK_AUTHOR = {
  name: 'Sarah Chen',
  slug: 'sarah-chen',
  role: 'Senior Crypto Analyst',
  bio: 'Sarah covers crypto markets, DeFi protocols, and institutional adoption at CrypLounge. Former Bloomberg analyst with 8 years covering digital assets. Based in Singapore.',
  avatar: 'SC',
  articles: 312,
  joined: 'March 2021',
  twitter: 'https://twitter.com/sarahchen',
  telegram: 'https://t.me/sarahchen',
  website: 'https://sarahchen.io',
  categories: ['Markets', 'DeFi', 'Regulation', 'Institutional'],
};

const MOCK_ARTICLES = [
  { title: 'Bitcoin Dominance Rises to 58% as Altcoins Consolidate Gains', category: 'Markets', time: '2 hours ago', slug: 'btc-dominance-rises' },
  { title: 'Ethereum Layer 2 Networks Hit Combined $50B in Total Value Locked', category: 'Ecosystem', time: '1 day ago', slug: 'eth-l2-tvl-record' },
  { title: 'SEC Approves New Crypto ETF Applications from Major Asset Managers', category: 'Regulation', time: '3 days ago', slug: 'sec-crypto-etf-approvals' },
  { title: 'DeFi Protocol Aave Launches V4 with Cross-Chain Liquidity Features', category: 'DeFi', time: '5 days ago', slug: 'aave-v4-launch' },
  { title: 'BlackRock Bitcoin ETF Surpasses $20B in Assets Under Management', category: 'Markets', time: '1 week ago', slug: 'blackrock-btc-etf-aua' },
  { title: 'MiCA Full Implementation Brings Legal Clarity to 450M EU Citizens', category: 'Regulation', time: '1 week ago', slug: 'mica-full-implementation' },
  { title: 'Solana DeFi Volume Overtakes Ethereum for First Time in 2026', category: 'DeFi', time: '2 weeks ago', slug: 'solana-defi-overtakes-eth' },
  { title: 'Stablecoin Payment Volume Exceeds $1 Trillion Annually, Rivals Visa', category: 'Markets', time: '2 weeks ago', slug: 'stablecoin-payment-volume' },
];

export default function AuthorPage({ onNavigate, authorSlug }: AuthorPageProps) {
  const author = MOCK_AUTHOR;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const articlesPerPage = 5;

  const filtered = activeCategory === 'All' ? MOCK_ARTICLES : MOCK_ARTICLES.filter(a => a.category === activeCategory);
  const totalPages = Math.ceil(filtered.length / articlesPerPage);
  const visible = filtered.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#FFD200] transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Sidebar — author profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#FFD200] flex items-center justify-center text-black text-2xl font-bold mb-4">
              {author.avatar}
            </div>
            <h1 className="text-xl md:text-2xl text-gray-900 dark:text-white mb-1">{author.name}</h1>
            <p className="text-[#FFD200] text-sm mb-4">{author.role}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{author.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-2xl text-gray-900 dark:text-white font-medium">{author.articles}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Articles</p>
              </div>
              <div>
                <p className="text-2xl text-gray-900 dark:text-white font-medium">{author.joined}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Joined</p>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {author.twitter && (
                <a href={author.twitter} target="_blank" rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Twitter className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
              {author.telegram && (
                <a href={author.telegram} target="_blank" rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Send className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
              {author.website && (
                <a href={author.website} target="_blank" rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Globe className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-gray-900 dark:text-white mb-4 font-medium">Covers</h3>
            <div className="flex flex-wrap gap-2">
              {author.categories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-[#FFD200]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-sm">{cat}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Main — articles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white">Articles by {author.name}</h2>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', ...author.categories].map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#FFD200] text-black'
                    : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#FFD200] hover:text-[#FFD200]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles list */}
          {visible.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">No articles in this category yet.</div>
          ) : (
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {visible.map((article, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate(`news/${article.category.toLowerCase()}/${article.slug}`)}
                  className="p-5 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#FFD200] text-xs">{article.category}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">·</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{article.time}</span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white group-hover:text-[#FFD200] transition-colors text-base md:text-lg leading-snug">
                    {article.title}
                  </h3>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#FFD200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#FFD200] text-black'
                      : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#FFD200]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#FFD200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
