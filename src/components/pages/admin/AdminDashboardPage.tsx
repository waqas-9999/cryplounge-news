'use client';

import {
  ArrowUpRight,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { QuickActionsPanel } from '@/components/admin/QuickActionsPanel';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { ContentPipeline } from '@/components/admin/ContentPipeline';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';

interface AdminDashboardPageProps {
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

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user: { id: string; name: string } | null;
}

interface DashboardData {
  totalViews: number;
  totalArticles: number;
  published: number;
  drafts: number;
  review: number;
  scheduled: number;
  topArticles: TopArticle[];
  recentActivity: AuditEntry[];
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AdminDashboardPage({ currentPage, onNavigate, onLogout }: AdminDashboardPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ totalViews: number }>('admin/analytics/overview'),
      apiClient.get<TopArticle[]>('admin/analytics/content', { query: { entity: 'Article', limit: 10 } }),
      apiClient.get<AuditEntry[]>('audit/recent'),
      apiClient.getPaginated('articles/admin', { query: { perPage: 1 } }),
      apiClient.getPaginated('articles/admin', { query: { status: 'PUBLISHED', perPage: 1 } }),
      apiClient.getPaginated('articles/admin', { query: { status: 'DRAFT', perPage: 1 } }),
      apiClient.getPaginated('articles/admin', { query: { status: 'REVIEW', perPage: 1 } }),
      apiClient.getPaginated('articles/admin', { query: { status: 'SCHEDULED', perPage: 1 } }),
    ])
      .then(([overview, topArticles, recentActivity, all, published, drafts, review, scheduled]) => {
        setData({
          totalViews: overview.totalViews,
          totalArticles: all.pagination.total,
          published: published.pagination.total,
          drafts: drafts.pagination.total,
          review: review.pagination.total,
          scheduled: scheduled.pagination.total,
          topArticles,
          recentActivity,
        });
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const handleQuickAction = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'create-article': 'admin/news/create',
      'create-event': 'admin/events/create',
      'create-tutorial': 'admin/learn/create',
      'manage-users': 'admin/users',
    };
    if (actionMap[action]) {
      onNavigate(actionMap[action]);
    }
  };

  const handleArticleClick = (articleId: string) => {
    onNavigate(`admin/news/edit/${articleId}`);
  };

  const stats = data
    ? [
        { label: 'Total Views (30d)', value: data.totalViews.toLocaleString(), icon: Eye, color: 'yellow' },
        { label: 'Total Articles', value: data.totalArticles.toString(), icon: FileText, color: 'blue' },
      ]
    : [];

  const activities = data
    ? data.recentActivity.map(entry => ({
        type: entry.entity.toLowerCase(),
        title: `${entry.action.replace(/_/g, ' ').toLowerCase()} ${entry.entity.toLowerCase()}`,
        time: timeAgo(entry.createdAt),
        user: entry.user?.name ?? 'System',
        icon: 'FileText',
      }))
    : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader
          title="Dashboard"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {state === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : state === 'error' || !data ? (
            <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load dashboard data.
            </div>
          ) : (
            <>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Content Pipeline Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <QuickActionsPanel onAction={handleQuickAction} />
                <div className="lg:col-span-2">
                  <ContentPipeline
                    published={data.published}
                    pending={data.review}
                    scheduled={data.scheduled}
                    drafts={data.drafts}
                    total={data.totalArticles}
                  />
                </div>
              </div>

              {/* Top Articles & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Top Articles */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
                    <h3 className="text-gray-900 dark:text-gray-100">Top Viewed Articles (30d)</h3>
                    {/* This panel stays the summary; the detail lives at /admin/analytics. */}
                    <button
                      onClick={() => onNavigate('admin/analytics')}
                      className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs md:text-sm rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    >
                      View Detailed Analytics
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {data.topArticles.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No view data yet</p>
                  ) : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Title</th>
                              <th className="text-right py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Views</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.topArticles.map((article) => (
                              <tr
                                key={article.id}
                                onClick={() => handleArticleClick(article.id)}
                                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                role="button"
                                tabIndex={0}
                                aria-label={`View article: ${article.title}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleArticleClick(article.id);
                                  }
                                }}
                              >
                                <td className="py-3 px-4 text-xs md:text-sm text-gray-700 dark:text-gray-300 max-w-[200px] md:max-w-none truncate">{article.title}</td>
                                <td className="py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">{article.views.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <ActivityFeed activities={activities} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
