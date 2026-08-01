'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, X, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { GridSkeleton } from '@/components/LoadingSkeletons';
import { useFounders } from '@/contexts/FoundersContext';
import { useEvents } from '@/contexts/EventsContext';
import { searchArticles } from '@/services/news';
import type { Article } from '@/types/article';

interface SearchPageProps {
  onNavigate: (path: string) => void;
  initialQuery?: string;
}

type SearchTab = 'all' | 'news' | 'founders' | 'events';

/**
 * Site search across the three content types CrypLounge publishes: news,
 * founder stories and events. Header and Footer come from the app layout, so
 * they are deliberately not rendered here.
 */
export default function SearchPage({ onNavigate, initialQuery = '' }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [isSearching, setIsSearching] = useState(false);

  const { getPublishedStories } = useFounders();
  const { getUpcomingEvents } = useEvents();

  const [newsResults, setNewsResults] = useState<Article[]>([]);

  const needle = query.trim().toLowerCase();
  const matches = (value?: string) => !!value && value.toLowerCase().includes(needle);

  useEffect(() => {
    if (!needle) {
      setNewsResults([]);
      return;
    }
    let cancelled = false;
    searchArticles(query, 12)
      .then(results => {
        if (!cancelled) setNewsResults(results);
      })
      .catch(() => {
        if (!cancelled) setNewsResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [needle, query]);

  const searchResults = {
    news: newsResults,

    founders: getPublishedStories()
      .filter(story => matches(story.name) || matches(story.role) || matches(story.excerpt))
      .slice(0, 12),

    events: getUpcomingEvents()
      .filter(event => matches(event.name) || matches(event.description))
      .slice(0, 12),
  };

  const totalResults =
    searchResults.news.length + searchResults.founders.length + searchResults.events.length;

  useEffect(() => {
    if (!needle) return;
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 300);
    return () => clearTimeout(timer);
  }, [needle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Results update as you type.
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      {/* Search Hero */}
      <section className="bg-gradient-to-br from-[#F9D96A]/20 to-white dark:from-[#EFB81A]/10 dark:to-[#0D0D0D] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-gray-900 dark:text-white mb-6">
            {needle ? 'Search Results' : 'Search CrypLounge'}
          </h1>

          <form onSubmit={handleSearch} role="search" className="relative max-w-3xl">
            <label htmlFor="site-search" className="sr-only">
              Search CrypLounge
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="site-search"
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search news, founders, events…"
                className="w-full pl-12 pr-14 py-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] text-lg"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {needle && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
              Found <span className="text-[#EFB81A]">{totalResults}</span> results for &ldquo;
              {query}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {!needle ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#EFB81A]" aria-hidden="true" />
              <h2 className="text-gray-900 dark:text-white">Trending Searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Bitcoin', 'DeFi', 'Regulation', 'Ethereum', 'Stablecoins', 'Layer 2', 'Adoption'].map(
                term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors text-sm"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        ) : isSearching ? (
          <GridSkeleton count={6} />
        ) : totalResults === 0 ? (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`We couldn't find anything for "${query}". Try different keywords or browse a section.`}
            action={{ label: 'Browse all news', onClick: () => onNavigate('news') }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as SearchTab)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="news">News ({searchResults.news.length})</TabsTrigger>
              <TabsTrigger value="founders">Founders ({searchResults.founders.length})</TabsTrigger>
              <TabsTrigger value="events">Events ({searchResults.events.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {searchResults.news.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gray-900 dark:text-white">News Articles</h2>
                    <button
                      onClick={() => setActiveTab('news')}
                      className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1"
                    >
                      View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.news.slice(0, 3).map(article => (
                      <NewsResultCard key={article.id} article={article} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.founders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gray-900 dark:text-white">Founders</h2>
                    <button
                      onClick={() => setActiveTab('founders')}
                      className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1"
                    >
                      View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.founders.slice(0, 3).map(story => (
                      <FounderResultCard key={story.id} story={story} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.events.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gray-900 dark:text-white">Events</h2>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-sm text-[#EFB81A] hover:underline flex items-center gap-1"
                    >
                      View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.events.slice(0, 3).map(event => (
                      <EventResultCard key={event.id} event={event} onNavigate={onNavigate} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="news">
              {searchResults.news.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No News Articles Found"
                  description="Try different keywords or browse the news desks."
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.news.map(article => (
                    <NewsResultCard key={article.id} article={article} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="founders">
              {searchResults.founders.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Founders Found"
                  description="Try a different name, project or region."
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.founders.map(story => (
                    <FounderResultCard key={story.id} story={story} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              {searchResults.events.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Events Found"
                  description="Try a different event name or topic."
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.events.map(event => (
                    <EventResultCard key={event.id} event={event} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- cards ----- */

const CARD =
  'bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-[#EFB81A] transition-colors cursor-pointer text-left w-full';

function NewsResultCard({ article, onNavigate }: any) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(`news/${article.categorySlug}/${article.slug ?? article.id}`)}
      className={CARD}
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          {article.category}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
      </div>
      <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.summary}</p>
    </button>
  );
}

function FounderResultCard({ story, onNavigate }: any) {
  return (
    <button type="button" onClick={() => onNavigate('founders')} className={CARD}>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          {story.category}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{story.readTime}</span>
      </div>
      <h3 className="text-gray-900 dark:text-white mb-1">{story.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{story.role}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{story.excerpt}</p>
    </button>
  );
}

function EventResultCard({ event, onNavigate }: any) {
  return (
    <button type="button" onClick={() => onNavigate('events')} className={CARD}>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          {event.category}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{event.location}</span>
      </div>
      <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{event.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.summary}</p>
    </button>
  );
}
