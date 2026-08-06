'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  listNewsletterCampaigns,
  getNewsletterStats,
  deleteNewsletterCampaign,
  type NewsletterCampaign,
  type NewsletterCampaignStatus,
  type NewsletterStats,
} from '@/services/newsletter';
import { errorMessage } from '@/lib/api-client';

interface CampaignsListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type StatusFilter = 'all' | NewsletterCampaignStatus;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function CampaignsListPage({ currentPage, onNavigate, onLogout }: CampaignsListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listNewsletterCampaigns({
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      perPage: 20,
    })
      .then(result => {
        setCampaigns(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => setError('Failed to load campaigns. You may not have permission to view them.'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const loadStats = useCallback(() => {
    getNewsletterStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleDelete = async (campaign: NewsletterCampaign) => {
    if (!window.confirm(`Delete the campaign "${campaign.subject}"?`)) return;
    setDeletingId(campaign.id);
    try {
      await deleteNewsletterCampaign(campaign.id);
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
      setTotal(prev => prev - 1);
      loadStats();
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete the campaign'));
    } finally {
      setDeletingId(null);
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
      icon: Mail,
      bg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Campaigns',
      value: stats ? stats.totalCampaigns.toLocaleString() : '—',
      icon: FileText,
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Newsletters Sent',
      value: stats ? stats.sentCampaigns.toLocaleString() : '—',
      icon: CheckCircle2,
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
        <AdminHeader title="Campaigns" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">Newsletter Campaigns</h1>
              <p className="text-gray-600 dark:text-gray-400">Compose, preview and send newsletters to your subscribers</p>
            </div>
            <button
              onClick={() => onNavigate('admin/newsletter/campaigns/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold hover:bg-[#f0c445]"
            >
              <Plus className="w-4 h-4" />
              Create Newsletter
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
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
                placeholder="Search by subject or title..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
            >
              <option value="all">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENDING">Sending</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
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
            {!error && !loading && campaigns.length === 0 && (
              <p className="p-6 text-sm text-gray-500 dark:text-gray-400">
                No campaigns found. Create your first newsletter to get started.
              </p>
            )}
            {!error && !loading && campaigns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-600 dark:text-gray-400">
                      <th className="py-3 px-4 font-medium">Subject</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium hidden md:table-cell">Recipients</th>
                      <th className="py-3 px-4 font-medium hidden lg:table-cell">Sent / Failed</th>
                      <th className="py-3 px-4 font-medium hidden xl:table-cell">Created</th>
                      <th className="py-3 px-4 font-medium hidden xl:table-cell">Sent At</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(campaign => (
                      <tr
                        key={campaign.id}
                        onClick={() => onNavigate(`admin/newsletter/campaigns/${campaign.id}`)}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      >
                        <td className="py-3 px-4 max-w-[260px]">
                          <p className="text-gray-900 dark:text-gray-100 truncate font-medium">{campaign.subject}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{campaign.title}</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {campaign.recipientCount.toLocaleString() || '—'}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {campaign.status === 'DRAFT' ? (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">
                              {campaign.sentCount.toLocaleString()}
                              <span className="mx-1 text-gray-300 dark:text-gray-600">/</span>
                              <span className={campaign.failedCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                                {campaign.failedCount.toLocaleString()}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden xl:table-cell">
                          {formatDate(campaign.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden xl:table-cell">
                          {formatDate(campaign.sentAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            {deletingId === campaign.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <>
                                <button
                                  onClick={() => onNavigate(`admin/newsletter/campaigns/${campaign.id}`)}
                                  title="View"
                                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                {campaign.status === 'DRAFT' && (
                                  <button
                                    onClick={() => onNavigate(`admin/newsletter/campaigns/${campaign.id}/edit`)}
                                    title="Edit draft"
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                )}
                                {campaign.status !== 'SENDING' && (
                                  <button
                                    onClick={() => void handleDelete(campaign)}
                                    title="Delete"
                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{total} total campaigns</p>
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

function StatusBadge({ status }: { status: NewsletterCampaignStatus }) {
  const styles: Record<NewsletterCampaignStatus, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    SENDING: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    SENT: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    FAILED: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  };
  const icons: Record<NewsletterCampaignStatus, React.ReactNode> = {
    DRAFT: <Pencil className="w-3 h-3" />,
    SENDING: <Loader2 className="w-3 h-3 animate-spin" />,
    SENT: <CheckCircle2 className="w-3 h-3" />,
    FAILED: <Clock className="w-3 h-3" />,
    CANCELLED: <Trash2 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
