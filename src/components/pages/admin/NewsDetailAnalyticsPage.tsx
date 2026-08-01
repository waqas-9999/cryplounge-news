'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Eye, Calendar, Loader2 } from 'lucide-react';

interface NewsDetailAnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  articleId?: string;
}

interface ArticleInfo {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  category: { name: string } | null;
  author: { name: string } | null;
}

interface TopArticle {
  id: string;
  views: number;
}

const RANGE_DAYS: Record<string, number> = { '7days': 7, '30days': 30, 'all': 365 };

export function NewsDetailAnalyticsPage({ currentPage, onNavigate, onLogout, articleId }: NewsDetailAnalyticsPageProps) {
  const [dateRange, setDateRange] = useState('30days');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [article, setArticle] = useState<ArticleInfo | null>(null);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!articleId) {
      setState('error');
      return;
    }
    const days = RANGE_DAYS[dateRange] ?? 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    setState('loading');
    Promise.all([
      apiClient.get<ArticleInfo>(`articles/${articleId}`),
      apiClient.get<TopArticle[]>('admin/analytics/content', { query: { entity: 'Article', from, limit: 100 } }),
    ])
      .then(([articleData, topArticles]) => {
        setArticle(articleData);
        setViews(topArticles.find(a => a.id === articleId)?.views ?? 0);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [articleId, dateRange]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Article Analytics" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <button
            onClick={() => onNavigate('admin/news/analytics')}
            className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </button>

          {state === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : state === 'error' || !article ? (
            <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load this article&apos;s analytics.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-2">{article.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {article.publishedAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                      {article.category && (
                        <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                          {article.category.name}
                        </span>
                      )}
                      <span className="inline-block px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                        {article.status.toLowerCase()}
                      </span>
                      {article.author && <span>By {article.author.name}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(`admin/news/edit/${articleId}`)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 text-sm"
                  >
                    Edit Article
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                {['7days', '30days', 'all'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateRange(filter)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === filter
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : 'All Time'}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 max-w-xs">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{views.toLocaleString()}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
