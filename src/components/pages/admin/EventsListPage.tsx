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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface EventsListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface AdminEvent {
  id: string;
  name: string;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  startsAt: string;
  city: string | null;
  country: string | null;
  category: { slug: string; name: string } | null;
}

const PER_PAGE = 15;

export function EventsListPage({ currentPage, onNavigate, onLogout }: EventsListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .getPaginated<AdminEvent>('events/admin', {
        query: {
          search: searchQuery || undefined,
          status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
          when: 'all',
          page,
          perPage: PER_PAGE,
        },
      })
      .then(({ items, pagination }) => {
        setEvents(items);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [searchQuery, filterStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can be restored later by an administrator.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`events/${id}`);
      toast.success('Event deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete event'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleApprove(id: string) {
    try {
      await apiClient.patch(`events/${id}`, { status: 'PUBLISHED' });
      toast.success('Event approved and published');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to approve event'));
    }
  }

  const getStatusBadge = (status: AdminEvent['status']) => {
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
            Pending Review
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
        <AdminHeader title="Events Management" onMenuClick={() => setIsMobileSidebarOpen(true)} />

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
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  />
                </div>
              </div>

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
                <option value="review">Pending Review</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={() => onNavigate('admin/events/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load events. Please try again.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Location</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Starts</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{event.name}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {[event.city, event.country].filter(Boolean).join(', ') || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                              {event.category?.name ?? 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(event.status)}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.startsAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {event.status === 'REVIEW' && (
                                <button
                                  onClick={() => handleApprove(event.id)}
                                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Approve & Publish"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </button>
                              )}
                              <button
                                onClick={() => onNavigate(`admin/events/edit/${event.id}`)}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(event.id, event.name)}
                                disabled={deletingId === event.id}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {events.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            No events match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {events.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{(page - 1) * PER_PAGE + events.length} of {total} events
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
