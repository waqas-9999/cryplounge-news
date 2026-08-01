'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Search, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { listAuditLog, getFailedLogins, type AuditEntry, type FailedLoginEntry } from '@/services/audit';

interface LogsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function actionColor(action: string): string {
  if (action.includes('DELETE') || action === 'LOGIN_FAILED') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
  if (action.includes('CREATE')) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10';
  if (action.includes('UPDATE') || action.includes('CHANGE')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10';
  return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
}

export function LogsPage({ currentPage, onNavigate, onLogout }: LogsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [failedLogins, setFailedLogins] = useState<FailedLoginEntry[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFailedLogins().catch(() => []).then(rows => setFailedLogins(rows ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listAuditLog({ search: search || undefined, page, perPage: 20 })
      .then(result => {
        setEntries(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => setError('Failed to load the audit log. You may not have permission to view it.'))
      .finally(() => setLoading(false));
  }, [search, page]);

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
        <AdminHeader title="Logs" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">Audit Log</h1>
            <p className="text-gray-600 dark:text-gray-400">Every recorded change across the platform, newest first</p>
          </div>

          {failedLogins.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="text-sm font-medium">Failed sign-in attempts (last 24h)</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {failedLogins.map((row, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-white dark:bg-[#1A1A1C] border border-red-200 dark:border-red-500/20 text-gray-700 dark:text-gray-300">
                    {row.email ?? 'unknown'} · {row.ipAddress ?? 'unknown IP'} · {row.attempts} attempt{row.attempts === 1 ? '' : 's'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by summary or actor email..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
            />
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {error && <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {!error && loading && <p className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
            {!error && !loading && entries.length === 0 && (
              <p className="p-6 text-sm text-gray-500 dark:text-gray-400">No audit entries found.</p>
            )}
            {!error && !loading && entries.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0F0F10] text-left text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {entries.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColor(entry.action)}`}>
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.summary}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{entry.user?.name ?? 'System'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-500 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{total} total entries</p>
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
