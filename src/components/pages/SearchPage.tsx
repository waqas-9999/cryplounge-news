'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, X, Filter, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { GridSkeleton, NewsCardSkeleton, TokenRowSkeleton, CourseCardSkeleton } from '@/components/LoadingSkeletons';
import { useCategories } from '@/contexts/CategoriesContext';
import { coursesWithXP } from '@/data/learnData';
import { useFounders } from '@/contexts/FoundersContext';
import { useEvents } from '@/contexts/EventsContext';

interface SearchPageProps {
  onNavigate: (path: string) => void;
  initialQuery?: string;
}

export default function SearchPage({ onNavigate, initialQuery = '' }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'market' | 'learn' | 'founders' | 'events'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { getArticlesByCategory } = useCategories();
  const { getPublishedStories } = useFounders();
  const { getUpcomingEvents } = useEvents();

  // Mock market data (in production, fetch from API)
  const mockTokens = [
    { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 43521.32, change24h: 2.5 },
    { id: '2', name: 'Ethereum', symbol: 'ETH', price: 2234.21, change24h: 3.2 },
    { id: '3', name: 'Solana', symbol: 'SOL', price: 98.43, change24h: -1.2 },
  ];

  // Perform search across all content
  const searchResults = {
    news: getArticlesByCategory('all').filter(article =>
      article.title?.toLowerCase().includes(query.toLowerCase()) ||
      article.summary?.toLowerCase().includes(query.toLowerCase()) ||
      article.tags?.some(tag => tag?.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10),
    
    market: mockTokens.filter(token =>
      token.name?.toLowerCase().includes(query.toLowerCase()) ||
      token.symbol?.toLowerCase().includes(query.toLowerCase())
    ),
    
    learn: coursesWithXP.filter(course =>
      course.title?.toLowerCase().includes(query.toLowerCase()) ||
      course.description?.toLowerCase().includes(query.toLowerCase()) ||
      course.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10),
    
    founders: getPublishedStories().filter(story =>
      story.name?.toLowerCase().includes(query.toLowerCase()) ||
      story.role?.toLowerCase().includes(query.toLowerCase()) ||
      story.excerpt?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10),

    events: getUpcomingEvents().filter(event =>
      event.name?.toLowerCase().includes(query.toLowerCase()) ||
      event.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10),
  };

  const totalResults = 
    searchResults.news.length +
    searchResults.market.length +
    searchResults.learn.length +
    searchResults.founders.length +
    searchResults.events.length;

  // Simulate search delay
  useEffect(() => {
    if (query) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is performed in real-time via useEffect
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title={query ? `Search Results for "${query}"` : 'Search - CrypLounge'}
        description="Search across news, market data, learn courses, founder stories, and crypto events on CrypLounge"
        canonical="/search"
      />
      
      <Header onNavigate={onNavigate} />

      {/* Search Hero */}
      <section className="bg-gradient-to-br from-[#F9D96A]/20 to-white dark:from-[#EFB81A]/10 dark:to-[#0D0D0D] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-gray-900 dark:text-white mb-6">
            {query ? 'Search Results' : 'Search CrypLounge'}
          </h1>
          
          <form onSubmit={handleSearch} className="relative max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news, tokens, courses, founders, events..."
                className="w-full pl-12 pr-24 py-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] text-lg"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Filter className={`w-5 h-5 ${showFilters ? 'text-[#EFB81A]' : 'text-gray-400'}`} />
              </button>
            </div>
          </form>

          {query && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Found <span className="text-[#EFB81A]">{totalResults}</span> results for "{query}"
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {!query ? (
          // Initial state - trending searches
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#EFB81A]" />
              <h2 className="text-gray-900 dark:text-white">Trending Searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Bitcoin', 'DeFi', 'NFT', 'Ethereum', 'Web3', 'Blockchain', 'Trading'].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : isSearching ? (
          <GridSkeleton count={6} />
        ) : totalResults === 0 ? (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`We couldn't find any results for "${query}". Try different keywords or browse our categories.`}
            action={{
              label: 'Browse All Content',
              onClick: () => onNavigate('/')
            }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="news">
                News ({searchResults.news.length})
              </TabsTrigger>
              <TabsTrigger value="market">
                Market ({searchResults.market.length})
              </TabsTrigger>
              <TabsTrigger value="learn">
                Learn ({searchResults.learn.length})
              </TabsTrigger>
              <TabsTrigger value="founders">
                Founders ({searchResults.founders.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                Events ({searchResults.events.length})
              </TabsTrigger>
            </TabsList>

            {/* All Results Tab */}
            <TabsContent value="all" className="space-y-8">
              {searchResults.news.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 dark:text-white">News Articles</h3>
                    <button onClick={() => setActiveTab('news')} className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.news.slice(0, 3).map(article => (
                      <NewsResultCard key={article.id} article={article} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.market.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 dark:text-white">Tokens</h3>
                    <button onClick={() => setActiveTab('market')} className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {searchResults.market.map(token => (
                      <TokenResultCard key={token.id} token={token} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.learn.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 dark:text-white">Learn Courses</h3>
                    <button onClick={() => setActiveTab('learn')} className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.learn.slice(0, 3).map(course => (
                      <CourseResultCard key={course.id} course={course} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news">
              {searchResults.news.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No News Articles Found"
                  description="Try different keywords or browse our news categories."
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.news.map(article => (
                    <NewsResultCard key={article.id} article={article} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market">
              {searchResults.market.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Tokens Found"
                  description="Try different token names or symbols."
                />
              ) : (
                <div className="space-y-2">
                  {searchResults.market.map(token => (
                    <TokenResultCard key={token.id} token={token} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Learn Tab */}
            <TabsContent value="learn">
              {searchResults.learn.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Courses Found"
                  description="Try different course topics or browse all courses."
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.learn.map(course => (
                    <CourseResultCard key={course.id} course={course} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// Result Card Components
function NewsResultCard({ article, onNavigate }: any) {
  return (
    <div
      onClick={() => onNavigate(`news/${article.category}`)}
      className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-[#EFB81A] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
      </div>
      <h4 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{article.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.summary}</p>
    </div>
  );
}

function TokenResultCard({ token, onNavigate }: any) {
  return (
    <div
      onClick={() => onNavigate('market')}
      className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-[#EFB81A] transition-colors cursor-pointer flex items-center justify-between"
    >
      <div>
        <div className="text-gray-900 dark:text-white">{token.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</div>
      </div>
      <div className="text-right">
        <div className="text-gray-900 dark:text-white">${token.price.toLocaleString()}</div>
        <div className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {token.change24h >= 0 ? '+' : ''}{token.change24h}%
        </div>
      </div>
    </div>
  );
}

function CourseResultCard({ course, onNavigate }: any) {
  return (
    <div
      onClick={() => onNavigate(`learn/crypto/course/${course.id}`)}
      className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-[#EFB81A] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">{course.category}</Badge>
        <span className="text-xs text-[#EFB81A]">{course.xpReward} XP</span>
      </div>
      <h4 className="text-gray-900 dark:text-white mb-2">{course.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</p>
    </div>
  );
}
