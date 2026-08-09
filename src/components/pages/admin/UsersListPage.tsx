'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { getCurrentUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Ban,
  CheckCircle2,
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Loader2,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

interface UsersListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Matches `Role` in `server/prisma/schema.prisma`. Viewer stays out of the
 * invite picker: it isn't part of the active staff authentication workflow. */
const ASSIGNABLE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
  MODERATOR: 'Moderator',
  VIEWER: 'Viewer',
};

const PER_PAGE = 15;

export function UsersListPage({ currentPage, onNavigate, onLogout }: UsersListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const me = getCurrentUser();
  const canManage = me?.permissions.includes('users.manage') ?? false;
  const canGrantSuperAdmin = me?.role === 'SUPER_ADMIN';
  const isSuperAdmin = me?.role === 'SUPER_ADMIN';

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .getPaginated<StaffUser>('users', {
        query: {
          search: searchQuery || undefined,
          role: filterRole === 'all' ? undefined : filterRole,
          isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
          page,
          perPage: PER_PAGE,
        },
      })
      .then(({ items, pagination }) => {
        setUsers(items);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [searchQuery, filterRole, filterStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleActive(user: StaffUser) {
    if (user.id === me?.id) {
      toast.error('You cannot disable your own account');
      return;
    }
    if (user.isActive && !window.confirm(`Disable ${user.name}? This revokes their active sessions.`)) return;

    setBusyId(user.id);
    try {
      await apiClient.patch(`users/${user.id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Account disabled' : 'Account re-enabled');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update account'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: StaffUser) {
    if (user.id === me?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;

    setBusyId(user.id);
    try {
      await apiClient.delete(`users/${user.id}`);
      toast.success('Account deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete account'));
    } finally {
      setBusyId(null);
    }
  }

  const stats = [
    { label: 'Total Staff', value: total, icon: UsersIcon },
    { label: 'Active', value: users.filter(u => u.isActive).length, icon: UserCheck },
    { label: 'Super Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length, icon: ShieldCheck },
    { label: 'Disabled', value: users.filter(u => !u.isActive).length, icon: Ban },
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
        <AdminHeader title="Staff & Access — Users" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
            <div className="flex-1 flex flex-wrap gap-3">
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
                    placeholder="Search staff by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={e => {
                  setPage(1);
                  setFilterRole(e.target.value);
                }}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => {
                  setPage(1);
                  setFilterStatus(e.target.value);
                }}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>

            {canManage && (
              <button
                onClick={() => setInviteOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                Invite User
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load staff accounts.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Staff</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Role</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Last Active</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Joined</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                        {canManage && <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                              {ROLE_LABELS[user.role] ?? user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                              user.isActive
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }`}>
                              {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              {user.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleActive(user)}
                                  disabled={busyId === user.id || user.id === me?.id}
                                  title={user.isActive ? 'Disable account' : 'Re-enable account'}
                                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-40"
                                >
                                  {busyId === user.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                  ) : user.isActive ? (
                                    <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  )}
                                </button>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => handleDelete(user)}
                                    disabled={busyId === user.id || user.id === me?.id}
                                    title="Delete account permanently"
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            No staff accounts match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {users.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{(page - 1) * PER_PAGE + users.length} of {total} staff
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <InviteUserDialog
        open={inviteOpen}
        canGrantSuperAdmin={canGrantSuperAdmin}
        onOpenChange={open => {
          setInviteOpen(open);
          if (!open) setInviteLink(null);
        }}
        onInvited={link => {
          setInviteLink(link);
          load();
        }}
      />

      <Dialog open={!!inviteLink} onOpenChange={open => !open && setInviteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation created</DialogTitle>
            <DialogDescription>
              Share this one-time link with the new staff member so they can set their password. It expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink ?? ''}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => {
                if (!inviteLink) return;
                navigator.clipboard.writeText(inviteLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
          <DialogFooter>
            <button
              onClick={() => setInviteLink(null)}
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InviteUserDialog({
  open,
  canGrantSuperAdmin,
  onOpenChange,
  onInvited,
}: {
  open: boolean;
  canGrantSuperAdmin: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: (link: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('AUTHOR');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setRole('AUTHOR');
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { inviteToken } = await apiClient.post<{ user: StaffUser; inviteToken: string }>(
        'users/invite',
        { name, email, role }
      );
      toast.success(`Invitation sent to ${email}`);
      onOpenChange(false);
      onInvited(`${window.location.origin}/admin/accept-invite?token=${inviteToken}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create invitation'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a staff member</DialogTitle>
          <DialogDescription>
            They&apos;ll receive a one-time link to set their own password. The account stays disabled until they accept.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Full name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {ASSIGNABLE_ROLES.filter(r => r !== 'SUPER_ADMIN' || canGrantSuperAdmin).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invitation
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
