'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { getCurrentUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Shield, Users, CheckCircle2, Search, Save, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RolesPermissionsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Role {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

interface Permission {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string | null;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

export function RolesPermissionsPage({ currentPage, onNavigate, onLogout }: RolesPermissionsPageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [pendingGrants, setPendingGrants] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const me = getCurrentUser();
  const isSuperAdmin = me?.role === 'SUPER_ADMIN';

  const load = useCallback((preserveSelection = false) => {
    Promise.all([
      apiClient.get<Role[]>('roles'),
      apiClient.get<PermissionGroup[]>('permissions'),
    ])
      .then(([rolesData, groups]) => {
        setRoles(rolesData);
        setPermissionGroups(groups);
        if (!preserveSelection) {
          setSelectedRole(rolesData[0]?.key ?? null);
          setPendingGrants(rolesData[0]?.permissions ?? []);
        }
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeRole = roles.find(r => r.key === selectedRole);

  function selectRole(key: string) {
    setSelectedRole(key);
    setPendingGrants(roles.find(r => r.key === key)?.permissions ?? []);
  }

  function toggle(permKey: string) {
    setPendingGrants(prev =>
      prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]
    );
  }

  async function handleSave() {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await apiClient.put(`roles/${selectedRole}/permissions`, { permissionKeys: pendingGrants });
      setRoles(prev =>
        prev.map(r => (r.key === selectedRole ? { ...r, permissions: pendingGrants } : r))
      );
      toast.success('Permissions updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update permissions'));
    } finally {
      setSaving(false);
    }
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return permissionGroups;
    return permissionGroups
      .map(g => ({ ...g, permissions: g.permissions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) }))
      .filter(g => g.permissions.length > 0);
  }, [permissionGroups, searchQuery]);

  const stats = {
    totalRoles: roles.length,
    totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
    totalPermissions: permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0),
    activeRoles: roles.filter(r => r.userCount > 0).length,
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Roles & Permissions" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {state === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : state === 'error' ? (
            <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load roles and permissions.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Roles</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{stats.totalRoles}</p>
                </div>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Permissions</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{stats.totalPermissions}</p>
                </div>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Roles</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{stats.activeRoles}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg text-gray-900 dark:text-gray-100">Roles</h3>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setCreateOpen(true)}
                        className="p-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors"
                        title="Create a new role"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {roles.map(role => (
                      <button
                        key={role.key}
                        onClick={() => selectRole(role.key)}
                        className={`w-full p-4 rounded-lg border transition-all text-left ${
                          selectedRole === role.key
                            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900 dark:text-gray-100">{role.name}</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {role.userCount} users
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg text-gray-900 dark:text-gray-100">
                      Permissions for {activeRole?.name ?? '...'}
                    </h3>
                    <button
                      onClick={handleSave}
                      disabled={saving || activeRole?.isSystem}
                      title={activeRole?.isSystem ? 'System role — grants are fixed' : undefined}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="space-y-6">
                    {filteredGroups.map(group => (
                      <div key={group.module}>
                        <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                          {group.module}
                        </h4>
                        <div className="space-y-2">
                          {group.permissions.map(perm => {
                            const hasPermission = pendingGrants.includes(perm.key);
                            return (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-[#202225] rounded-lg"
                              >
                                <div>
                                  <p className="text-sm text-gray-900 dark:text-gray-100">{perm.name}</p>
                                  {perm.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{perm.description}</p>
                                  )}
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={hasPermission}
                                    disabled={activeRole?.isSystem}
                                    className="sr-only peer"
                                    onChange={() => toggle(perm.key)}
                                  />
                                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400 peer-disabled:opacity-50"></div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={key => {
          load(true);
          setSelectedRole(key);
        }}
      />
    </div>
  );
}

function CreateRoleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: string) => void;
}) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setKey('');
      setName('');
      setDescription('');
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('roles', { key: key.trim().toUpperCase(), name, description: description || undefined });
      toast.success(`Role ${name} created`);
      onOpenChange(false);
      onCreated(key.trim().toUpperCase());
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create role'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a role</DialogTitle>
          <DialogDescription>
            Custom roles can be granted to existing staff as an additional role (on top of their primary role) —
            they cannot be used as a brand-new account&apos;s primary role. Set its permissions afterwards from the
            list on the right.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Key</label>
            <input
              required
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              placeholder="CONTRIBUTOR"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Display name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contributor"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
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
              Create Role
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
