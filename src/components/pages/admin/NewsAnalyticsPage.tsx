'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient } from '@/lib/api-client';
import { Eye, Search, Loader2 } from 'lucide-react';

interface NewsAnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface TopArticle {
  id: string;
  slug: string;
  title: string;
  views: number;
}

interface SearchTerm {
  term: string;
  count: number;
}

interface AnalyticsData {
  totalViews: number;
  totalSearches: number;
  topArticles: TopArticle[];
  topSearchTerms: SearchTerm[];
  zeroResultTerms: SearchTerm[];
}

const RANGE_DAYS: Record<string, number> = { '7days': 7, '30days': 30, '90days': 90 };

export function NewsAnalyticsPage({ currentPage, onNavigate, onLogout }: NewsAnalyticsPageProps) {
  const [dateRange, setDateRange] = useState('30days');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const days = RANGE_DAYS[dateRange] ?? 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    setState('loading');
    Promise.all([
      apiClient.get<{ totalViews: number }>('admin/analytics/overview', { query: { from, entity: 'Article' } }),
      apiClient.get<TopArticle[]>('admin/analytics/content', { query: { entity: 'Article', from, limit: 10 } }),
      apiClient.get<{ totalSearches: number; topTerms: SearchTerm[]; zeroResultTerms: SearchTerm[] }>(
        'admin/analytics/search',
        { query: { from } }
      ),
    ])
      .then(([overview, topArticles, search]) => {
        setData({
          totalViews: overview.totalViews,
          totalSearches: search.totalSearches,
          topArticles,
          topSearchTerms: search.topTerms,
          zeroResultTerms: search.zeroResultTerms,
        });
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [dateRange]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="News Analytics" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Date Filter */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
            <div className="flex gap-2">
              {['7days', '30days', '90days'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateRange(filter)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateRange === filter
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>

          {state === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : state === 'error' || !data ? (
            <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load analytics.
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{data.totalViews.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Article Views</p>
                </div>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Search className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{data.totalSearches.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Site Searches</p>
                </div>
              </div>

              {/* Top Articles Table */}
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100">Top Performing Articles</h3>
                </div>
                {data.topArticles.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No view data yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Title</th>
                          <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topArticles.map((article) => (
                          <tr
                            key={article.id}
                            onClick={() => onNavigate(`admin/news/analytics/${article.id}`)}
                            className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 hover:text-yellow-600 dark:hover:text-yellow-400">
                              {article.title}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                              {article.views.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Search Terms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Top Search Terms</h3>
                  {data.topSearchTerms.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No searches yet</p>
                  ) : (
                    <div className="space-y-2">
                      {data.topSearchTerms.map((t) => (
                        <div key={t.term} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{t.term}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Zero-Result Searches</h3>
                  {data.zeroResultTerms.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No zero-result searches</p>
                  ) : (
                    <div className="space-y-2">
                      {data.zeroResultTerms.map((t) => (
                        <div key={t.term} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{t.term}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
