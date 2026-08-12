'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Globe, ArrowLeft, ChevronLeft, ChevronRight, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { getAuthorBySlug, type AuthorProfile } from '@/services/authors';

/**
 * Public byline page.
 *
 * Everything here comes from the `authors` API. This page used to render a
 * fabricated journalist ("Sarah Chen", invented bio and social links) with
 * eight invented headlines — real-looking bylines that belonged to nobody,
 * which is not something an editorial site can ship.
 */

interface AuthorPageProps {
  onNavigate: (page: string) => void;
  authorSlug?: string;
}

const ARTICLES_PER_PAGE = 5;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Unpublished';
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function AuthorPage({ onNavigate, authorSlug }: AuthorPageProps) {
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!authorSlug) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    getAuthorBySlug(authorSlug)
      .then(result => {
        if (active) setAuthor(result);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authorSlug]);

  const articles = useMemo(() => author?.articles ?? [], [author]);

  // The desks this author actually writes for, rather than a stored list that
  // could disagree with their work.
  const categories = useMemo(() => {
    const names = articles.map(article => article.category?.name).filter((n): n is string => !!n);
    return Array.from(new Set(names));
  }, [articles]);

  const filtered =
    activeCategory === 'All'
      ? articles
      : articles.filter(article => article.category?.name === activeCategory);
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const visible = filtered.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const backButton = (
    <button
      onClick={() => onNavigate('home')}
      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#FFD200] transition-colors text-sm mb-8"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );

  if (isLoading) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {backButton}
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="h-72 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-1/2 rounded bg-gray-100 dark:bg-[#1A1A1A]" />
            <div className="h-64 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A]" />
          </div>
        </div>
      </main>
    );
  }

  if (!author) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {backButton}
        <EmptyState
          icon={UserRound}
          title="Author not found"
          description="This byline does not exist, or the profile has been removed."
          action={{ label: 'Back to News', onClick: () => onNavigate('news') }}
        />
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {backButton}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Sidebar — author profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            {/* Avatar */}
            {author.avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <ImageWithFallback
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#FFD200] flex items-center justify-center text-black text-2xl font-bold mb-4">
                {initials(author.name)}
              </div>
            )}
            <h1 className="text-xl md:text-2xl text-gray-900 dark:text-white mb-1">{author.name}</h1>
            {author.bio && (
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 mt-4">
                {author.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-2xl text-gray-900 dark:text-white font-medium">{articles.length}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Articles</p>
              </div>
              <div>
                <p className="text-2xl text-gray-900 dark:text-white font-medium">
                  {joinedLabel(author.createdAt)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Joined</p>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {author.x && (
                <a href={author.x} target="_blank" rel="noopener noreferrer"
                  aria-label={`${author.name} on X`}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Twitter className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
              {author.linkedin && (
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer"
                  aria-label={`${author.name} on LinkedIn`}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Linkedin className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
              {author.website && (
                <a href={author.website} target="_blank" rel="noopener noreferrer"
                  aria-label={`${author.name}'s website`}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:border-[#FFD200] transition-all group">
                  <Globe className="w-4 h-4 text-gray-500 group-hover:text-[#FFD200]" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-gray-900 dark:text-white mb-4 font-medium">Covers</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-[#FFD200]/10 text-gray-800 dark:text-[#F3F3F5] rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main — articles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white">
              Articles by {author.name}
            </h2>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', ...categories].map(cat => (
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
          )}

          {/* Articles list */}
          {visible.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              {articles.length === 0
                ? 'This author has not published anything yet.'
                : 'No articles in this category yet.'}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {visible.map(article => (
                <Link
                  key={article.id}
                  href={`/news/${article.category?.slug ?? 'news'}/${article.slug}`}
                  className="block p-5 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#FFD200] text-xs">{article.category?.name ?? 'News'}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">·</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                      {timeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white group-hover:text-[#FFD200] transition-colors text-base md:text-lg leading-snug">
                    {article.title}
                  </h3>
                </Link>
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
