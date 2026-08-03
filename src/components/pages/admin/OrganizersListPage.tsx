'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus, Trash2, BadgeCheck, Loader2, X } from 'lucide-react';

interface OrganizersListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Organizer {
  id: string;
  name: string;
  contactEmail: string | null;
  verified: boolean;
}

export function OrganizersListPage({ currentPage, onNavigate, onLogout }: OrganizersListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .getPaginated<Organizer>('organizers', { query: { perPage: 100 } })
      .then(({ items }) => {
        setOrganizers(items);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error('Organizer name is required');
      return;
    }
    setCreating(true);
    try {
      await apiClient.post('organizers', {
        name: newName,
        contactEmail: newEmail || undefined,
      });
      toast.success('Organizer created');
      setNewName('');
      setNewEmail('');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create organizer'));
    } finally {
      setCreating(false);
    }
  }

  async function handleVerify(id: string) {
    setBusyId(id);
    try {
      await apiClient.post(`organizers/${id}/verify`, {});
      toast.success('Organizer verified');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to verify organizer'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete organizer "${name}"?`)) return;
    setBusyId(id);
    try {
      await apiClient.delete(`organizers/${id}`);
      toast.success('Organizer deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete organizer'));
    } finally {
      setBusyId(null);
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
        <AdminHeader title="Organizers" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowForm(v => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                New Organizer
              </button>
            </div>

            {showForm && (
              <div className="mb-6 bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {state === 'loading' ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                </div>
              ) : state === 'error' ? (
                <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                  Couldn&apos;t load organizers. Please try again.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Contact</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Verified</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.map(org => (
                      <tr key={org.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{org.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{org.contactEmail ?? '-'}</td>
                        <td className="py-3 px-4">
                          {org.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {!org.verified && (
                              <button
                                onClick={() => handleVerify(org.id)}
                                disabled={busyId === org.id}
                                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                                title="Verify"
                              >
                                <BadgeCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(org.id, org.name)}
                              disabled={busyId === org.id}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {organizers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No organizers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
