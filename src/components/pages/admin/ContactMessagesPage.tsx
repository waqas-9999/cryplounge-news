'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Search, ChevronLeft, ChevronRight, Mail, MailOpen, Trash2 } from 'lucide-react';
import {
  listContactMessages,
  markContactRead,
  deleteContactMessage,
  type ContactMessage,
} from '@/services/contact';

interface ContactMessagesPageProps {
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

export function ContactMessagesPage({ currentPage, onNavigate, onLogout }: ContactMessagesPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listContactMessages({
      search: search || undefined,
      read: readFilter === 'all' ? undefined : readFilter === 'read',
      page,
      perPage: 20,
    })
      .then(result => {
        setMessages(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => setError('Failed to load contact messages. You may not have permission to view them.'))
      .finally(() => setLoading(false));
  }, [search, readFilter, page]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (msg: ContactMessage) => {
    setExpandedId(prev => (prev === msg.id ? null : msg.id));
    if (!msg.read) {
      try {
        await markContactRead(msg.id, true);
        setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: true } : m)));
      } catch {
        // Non-fatal: the message still opens even if the read flag fails to save.
      }
    }
  };

  const toggleRead = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRead = !msg.read;
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: nextRead } : m)));
    try {
      await markContactRead(msg.id, nextRead);
    } catch {
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: msg.read } : m)));
    }
  };

  const handleDelete = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete the message from ${msg.name}?`)) return;
    try {
      await deleteContactMessage(msg.id);
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      setTotal(prev => prev - 1);
    } catch {
      setError('Failed to delete the message. Please try again.');
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
        <AdminHeader title="Contact Messages" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">Contact Us Submissions</h1>
            <p className="text-gray-600 dark:text-gray-400">Messages sent through the public Contact Us form</p>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email or subject..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
              />
            </div>
            <select
              value={readFilter}
              onChange={e => { setReadFilter(e.target.value as typeof readFilter); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
            >
              <option value="all">All messages</option>
              <option value="unread">Unread only</option>
              <option value="read">Read only</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {error && <p className="p-6 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {!error && loading && <p className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
            {!error && !loading && messages.length === 0 && (
              <p className="p-6 text-sm text-gray-500 dark:text-gray-400">No contact messages found.</p>
            )}
            {!error && !loading && messages.length > 0 && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {messages.map(msg => (
                  <div key={msg.id}>
                    <button
                      onClick={() => toggleExpand(msg)}
                      className="w-full text-left px-4 py-3 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="mt-1">
                        {msg.read ? (
                          <MailOpen className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Mail className="w-4 h-4 text-[#EFB81A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${msg.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                            {msg.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">{msg.email}</span>
                        </div>
                        <p className={`text-sm truncate ${msg.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {msg.subject}
                        </p>
                        {expandedId === msg.id && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                        <button
                          onClick={e => toggleRead(msg, e)}
                          title={msg.read ? 'Mark as unread' : 'Mark as read'}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          {msg.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={e => handleDelete(msg, e)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{total} total messages</p>
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
