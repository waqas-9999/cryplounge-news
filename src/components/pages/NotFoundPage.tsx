'use client';

import { ArrowLeft, Home, Search, TrendingUp } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const suggestions = [
    { label: 'Latest News', page: 'news' },
    { label: 'Markets', page: 'news/market' },
    { label: 'Ecosystem', page: 'ecosystem' },
    { label: 'Research', page: 'research' },
    { label: 'Learn', page: 'learn' },
  ];

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-16">
      <div className="max-w-xl w-full text-center">
        {/* Large 404 */}
        <div className="mb-8">
          <div className="text-[120px] md:text-[180px] font-bold leading-none text-gray-100 dark:text-gray-800 select-none">
            404
          </div>
          <div className="relative -mt-10 md:-mt-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD200] rounded-full">
              <TrendingUp className="w-4 h-4 text-black" />
              <span className="text-black text-sm font-medium">Page not found</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">
          This page doesn't exist
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-base md:text-lg">
          The article or page you're looking for may have been moved, deleted, or never existed. Try searching or browse our sections below.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFD200] text-black rounded-xl hover:bg-[#F1EFA5] transition-colors font-medium w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl hover:border-[#FFD200] transition-colors font-medium w-full sm:w-auto justify-center"
          >
            <Search className="w-4 h-4" />
            Search Articles
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Or browse a section</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map(({ label, page }) => (
              <button
                key={label}
                onClick={() => onNavigate(page)}
                className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:border-[#FFD200] hover:text-[#FFD200] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 mt-10 text-sm text-gray-400 hover:text-[#FFD200] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </main>
  );
}
