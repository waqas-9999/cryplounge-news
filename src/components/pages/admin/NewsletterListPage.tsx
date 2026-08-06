'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  Loader2,
} from 'lucide-react';
import {
  listNewsletterSubscribers,
  getNewsletterStats,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
  type NewsletterSubscriber,
  type NewsletterStats,
  type NewsletterStatus,
} from '@/services/newsletter';

interface NewsletterListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type StatusFilter = 'all' | NewsletterStatus;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function NewsletterListPage({ currentPage, onNavigate, onLogout }: NewsletterListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listNewsletterSubscribers({
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      perPage: 20,
    })
      .then(result => {
        setSubscribers(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => setError('Failed to load subscribers. You may not have permission to view them.'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const loadStats = useCallback(() => {
    getNewsletterStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const toggleStatus = async (subscriber: NewsletterSubscriber) => {
    const nextStatus: NewsletterStatus = subscriber.status === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE';
    const label = nextStatus === 'ACTIVE' ? 'reactivate' : 'unsubscribe';

    if (
      !window.confirm(
        `${label === 'unsubscribe' ? 'Unsubscribe' : 'Reactivate'} ${subscriber.email}?`
      )
    ) {
      return;
    }

    setBusyId(subscriber.id);
    try {
      const updated = await updateNewsletterSubscriber(subscriber.id, { status: nextStatus });
      setSubscribers(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      loadStats();
    } catch {
      setError(`Failed to ${label} ${subscriber.email}. Please try again.`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (subscriber: NewsletterSubscriber) => {
    if (!window.confirm(`Delete the subscriber ${subscriber.email}?`)) return;
    setBusyId(subscriber.id);
    try {
      await deleteNewsletterSubscriber(subscriber.id);
      setSubscribers(prev => prev.filter(s => s.id !== subscriber.id));
      setTotal(prev => prev - 1);
      loadStats();
    } catch {
      setError(`Failed to delete ${subscriber.email}. Please try again.`);
    } finally {
      setBusyId(null);
    }
  };

  const statCards = [
    {
      label: 'Total Subscribers',
      value: stats ? stats.total.toLocaleString() : '—',
      icon: Users,
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Active Subscribers',
      value: stats ? stats.active.toLocaleString() : '—',
      icon: UserCheck,
      bg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Unsubscribed',
      value: stats ? stats.unsubscribed.toLocaleString() : '—',
      icon: UserMinus,
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      iconColor: 'text-gray-600 dark:text-gray-400',
    },
  ];

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
        <AdminHeader title="Newsletter" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">Newsletter Subscribers</h1>
            <p className="text-gray-600 dark:text-gray-400">People subscribed through the public newsletter forms</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
            {statCards.map(stat => (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-5 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Search & filter */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
            >
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {error && <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {!error && loading && (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#EFB81A]" />
              </div>
            )}
            {!error && !loading && subscribers.length === 0 && (
              <p className="p-6 text-sm text-gray-500 dark:text-gray-400">
                No subscribers found. Try a different search or filter.
              </p>
            )}
            {!error && !loading && subscribers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-600 dark:text-gray-400">
                      <th className="py-3 px-4 font-medium">Email</th>
                      <th className="py-3 px-4 font-medium hidden md:table-cell">Name</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium hidden lg:table-cell">Subscribed</th>
                      <th className="py-3 px-4 font-medium hidden xl:table-cell">Updated</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(subscriber => (
                      <tr
                        key={subscriber.id}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 max-w-[220px] truncate">{subscriber.email}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {subscriber.name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              subscriber.status === 'ACTIVE'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {subscriber.status === 'ACTIVE' ? (
                              <Mail className="w-3 h-3" />
                            ) : (
                              <UserMinus className="w-3 h-3" />
                            )}
                            {subscriber.status === 'ACTIVE' ? 'Active' : 'Unsubscribed'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden lg:table-cell">
                          {formatDate(subscriber.subscribedAt)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden xl:table-cell">
                          {formatDate(subscriber.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {busyId === subscriber.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <>
                                {subscriber.status === 'ACTIVE' ? (
                                  <button
                                    onClick={() => toggleStatus(subscriber)}
                                    title="Unsubscribe"
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => toggleStatus(subscriber)}
                                    title="Reactivate"
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(subscriber)}
                                  title="Delete"
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{total} total subscribers</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
