'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NewsListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface AdminArticle {
  id: string;
  title: string;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  /** When the row was created — for a draft, when it arrived. */
  createdAt: string;
  updatedAt: string;
  category: { slug: string; name: string } | null;
  author: { name: string } | null;
}

/**
 * The date that actually matters for this article.
 *
 * A draft has no `publishedAt`, so the column showed a dash for every
 * unpublished row — which is precisely the set an editor is working through.
 * Drafts arriving from the AI newsroom were indistinguishable from ones filed
 * last week, and the time of day matters when several land in the same hour.
 */
function articleTimestamp(article: AdminArticle): { label: string; value: string } {
  const stamp = article.status === 'PUBLISHED' && article.publishedAt
    ? { label: 'Published', at: article.publishedAt }
    : { label: 'Added', at: article.createdAt };

  const date = new Date(stamp.at);
  if (Number.isNaN(date.getTime())) return { label: stamp.label, value: '-' };

  return {
    label: stamp.label,
    // Date and time together: "when did this arrive?" is not answerable to the
    // day when a newsroom cycle files several drafts in one afternoon.
    value: date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

const PER_PAGE = 15;

export function NewsListPage({ currentPage, onNavigate, onLogout }: NewsListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .getPaginated<AdminArticle>('articles/admin', {
        query: {
          search: searchQuery || undefined,
          category: filterCategory === 'all' ? undefined : filterCategory,
          status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
          page,
          perPage: PER_PAGE,
        },
      })
      .then(({ items, pagination }) => {
        setArticles(items);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [searchQuery, filterCategory, filterStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can be restored later by an administrator.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`articles/${id}`);
      toast.success('Article deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete article'));
    } finally {
      setDeletingId(null);
    }
  }

  const getStatusBadge = (status: AdminArticle['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Needs Review
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">
            Archived
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

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
        <AdminHeader title="News Management" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
            <div className="flex-1 flex gap-3">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setPage(1);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  />
                </div>
              </div>

              <select
                value={filterCategory}
                onChange={e => {
                  setPage(1);
                  setFilterCategory(e.target.value);
                }}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              >
                <option value="all">All Categories</option>
                <option value="market">Market</option>
                <option value="technology">Technology</option>
                <option value="policy">Policy</option>
                <option value="business">Business</option>
                <option value="industry">Industry</option>
                <option value="security">Security</option>
                <option value="adoption">Adoption</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => {
                  setPage(1);
                  setFilterStatus(e.target.value);
                }}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="review">Needs Review</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={() => onNavigate('admin/news/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Article
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load articles. Please try again.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Title</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Author</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Date</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map(article => (
                        <tr key={article.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{article.title}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {article.author?.name ?? '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                              {article.category?.name ?? 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(article.status)}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {(() => {
                              const stamp = articleTimestamp(article);
                              return (
                                <>
                                  <span className="block">{stamp.value}</span>
                                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                                    {stamp.label}
                                  </span>
                                </>
                              );
                            })()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onNavigate(`admin/news/analytics/${article.id}`)}
                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="View Analytics"
                              >
                                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => onNavigate(`admin/news/edit/${article.id}`)}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(article.id, article.title)}
                                disabled={deletingId === article.id}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {articles.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            No articles match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {articles.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{(page - 1) * PER_PAGE + articles.length} of {total} articles
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
