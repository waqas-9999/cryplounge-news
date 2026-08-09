'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { errorMessage } from '@/lib/api-client';
import { deletePage, listAdminPages, type AdminLegalPageSummary } from '@/services/pages';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface LegalPagesListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function LegalPagesListPage({ currentPage, onNavigate, onLogout }: LegalPagesListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pages, setPages] = useState<AdminLegalPageSummary[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState('loading');
    listAdminPages()
      .then(items => {
        setPages(items);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePage(id);
      toast.success('Page deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete page'));
    } finally {
      setDeletingId(null);
    }
  }

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
        <AdminHeader title="Legal Pages" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Terms, Privacy and other policy pages shown on the public site.
            </p>
            <button
              onClick={() => onNavigate('admin/pages/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Page
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load pages. Please try again.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Slug</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Updated</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map(page => (
                      <tr key={page.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{page.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">/{page.slug}</td>
                        <td className="py-3 px-4">
                          {page.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">
                              <Clock className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onNavigate(`admin/pages/edit/${page.id}`)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(page.id, page.title)}
                              disabled={deletingId === page.id}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pages.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No pages yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
