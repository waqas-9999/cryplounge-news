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
  X,
  PenSquare,
} from 'lucide-react';

interface UsersListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface RoleOption {
  key: string;
  name: string;
  isSystem: boolean;
}

interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  additionalRoles: { key: string; name: string }[];
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

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

  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [addRoleFor, setAddRoleFor] = useState<StaffUser | null>(null);

  const me = getCurrentUser();
  const canManage = me?.permissions.includes('users.manage') ?? false;
  const canManageAuthors = me?.permissions.includes('authors.manage') ?? false;
  const canGrantSuperAdmin = me?.role === 'SUPER_ADMIN';
  const isSuperAdmin = me?.role === 'SUPER_ADMIN';

  const [bylineFor, setBylineFor] = useState<StaffUser | null>(null);

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

  useEffect(() => {
    if (!isSuperAdmin) return;
    apiClient
      .get<RoleOption[]>('roles')
      .then(setRoleOptions)
      .catch(() => setRoleOptions([]));
  }, [isSuperAdmin]);

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

  async function handleRevokeRole(user: StaffUser, roleKey: string, roleName: string) {
    if (!window.confirm(`Remove the ${roleName} role from ${user.name}?`)) return;

    setBusyId(user.id);
    try {
      await apiClient.delete(`users/${user.id}/roles/${roleKey}`);
      toast.success(`${roleName} role removed`);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to remove role'));
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
                            <div className="flex flex-wrap gap-1.5">
                              <span className="inline-block px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                                {ROLE_LABELS[user.role] ?? user.role}
                              </span>
                              {user.additionalRoles.map(role => (
                                <span
                                  key={role.key}
                                  title="Additional role"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs"
                                >
                                  {role.name}
                                  {isSuperAdmin && (
                                    <button
                                      onClick={() => handleRevokeRole(user, role.key, role.name)}
                                      disabled={busyId === user.id}
                                      title={`Remove ${role.name} role`}
                                      className="hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              ))}
                              {isSuperAdmin && (
                                <button
                                  onClick={() => setAddRoleFor(user)}
                                  disabled={busyId === user.id}
                                  title="Add another role"
                                  className="inline-flex items-center px-2 py-1 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-40"
                                >
                                  + Role
                                </button>
                              )}
                            </div>
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
                                {canManageAuthors && (
                                  <button
                                    onClick={() => setBylineFor(user)}
                                    disabled={busyId === user.id}
                                    title="Create a byline for this staff member"
                                    className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded transition-colors disabled:opacity-40"
                                  >
                                    <PenSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                )}
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

      <AddRoleDialog
        user={addRoleFor}
        roleOptions={roleOptions}
        onOpenChange={open => !open && setAddRoleFor(null)}
        onGranted={() => {
          setAddRoleFor(null);
          load();
        }}
      />

      <CreateBylineDialog
        user={bylineFor}
        onOpenChange={open => !open && setBylineFor(null)}
        onCreated={() => setBylineFor(null)}
      />
    </div>
  );
}

function AddRoleDialog({
  user,
  roleOptions,
  onOpenChange,
  onGranted,
}: {
  user: StaffUser | null;
  roleOptions: RoleOption[];
  onOpenChange: (open: boolean) => void;
  onGranted: () => void;
}) {
  const [roleKey, setRoleKey] = useState('');
  const [saving, setSaving] = useState(false);

  const available = user
    ? roleOptions.filter(r => r.key !== user.role && !user.additionalRoles.some(a => a.key === r.key))
    : [];

  useEffect(() => {
    if (user) setRoleKey(available[0]?.key ?? '');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !roleKey) return;
    setSaving(true);
    try {
      await apiClient.post(`users/${user.id}/roles/${roleKey}`, {});
      toast.success('Role granted');
      onGranted();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to grant role'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a role for {user?.name}</DialogTitle>
          <DialogDescription>
            Grants this role immediately, in addition to their existing role(s). No invitation or acceptance step
            is needed since they already have an active account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={roleKey}
              onChange={e => setRoleKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {available.length === 0 && <option value="">No roles left to grant</option>}
              {available.map(r => (
                <option key={r.key} value={r.key}>
                  {r.name}
                  {!r.isSystem ? ' (custom)' : ''}
                </option>
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
              disabled={saving || !roleKey}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Grant Role
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ExistingAuthor {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  avatarUrl: string | null;
}

function CreateBylineDialog({
  user,
  onOpenChange,
  onCreated,
}: {
  user: StaffUser | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<ExistingAuthor | null>(null);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'done'>('idle');

  useEffect(() => {
    if (!user) {
      setExisting(null);
      setLookupState('idle');
      return;
    }
    setName(user.name);
    setSlug(slugify(user.name));
    setAvatarUrl(user.avatarUrl || '');
    setLookupState('loading');
    apiClient
      .getPaginated<ExistingAuthor>('authors', { query: { search: user.name, perPage: 50 } })
      .then(({ items }) => {
        const match = items.find(a => a.email && a.email.toLowerCase() === user.email.toLowerCase()) ?? null;
        setExisting(match);
        if (match) {
          setName(match.name);
          setSlug(match.slug);
          setAvatarUrl(match.avatarUrl || user.avatarUrl || '');
        }
        setLookupState('done');
      })
      .catch(() => setLookupState('done'));
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (existing) {
        await apiClient.patch(`authors/${existing.id}`, {
          name,
          slug: slug || undefined,
          avatarUrl: avatarUrl || undefined,
        });
        toast.success(`Byline updated for ${name}`);
      } else {
        await apiClient.post('authors', {
          name,
          slug: slug || undefined,
          email: user.email,
          avatarUrl: avatarUrl || undefined,
        });
        toast.success(`Byline created for ${name}`);
      }
      onCreated();
    } catch (err) {
      toast.error(errorMessage(err, existing ? 'Failed to update byline' : 'Failed to create byline'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? `Edit byline for ${user?.name}` : `Create a byline for ${user?.name}`}</DialogTitle>
          <DialogDescription>
            This is a separate public-facing attribution (name, slug, avatar, bio) — not their staff role. It's what
            readers see under a news article's byline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Display name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="Derived from the name when left blank"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Profile picture URL</label>
            <div className="flex gap-2">
              <input
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(user.avatarUrl || '')}
                  className="px-3 py-2 text-xs whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Use staff photo
                </button>
              )}
            </div>
            {lookupState === 'loading' && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Checking for an existing byline…</p>
            )}
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
              disabled={saving || !name}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {existing ? 'Save Changes' : 'Create Byline'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setRole('AUTHOR');
      apiClient
        .get<RoleOption[]>('roles')
        .then(roles => setRoleOptions(roles))
        .catch(() => setRoleOptions([]));
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
            {canGrantSuperAdmin && (
              <>
                {' '}If this email already belongs to an active account, this instead sends a link that adds the
                selected role to that account — a super admin power for giving someone a second role (e.g. an Editor
                who is also an Author).
              </>
            )}
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
              {roleOptions
                .filter(r => r.key !== 'SUPER_ADMIN' || canGrantSuperAdmin)
                .filter(r => r.isSystem || canGrantSuperAdmin)
                .map(r => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                    {!r.isSystem ? ' (custom — additional role only)' : ''}
                  </option>
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
