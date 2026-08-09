'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import { Shield, Users, CheckCircle2, Search, Save, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    Promise.all([
      apiClient.get<Role[]>('roles'),
      apiClient.get<PermissionGroup[]>('permissions'),
    ])
      .then(([rolesData, groups]) => {
        setRoles(rolesData);
        setPermissionGroups(groups);
        setSelectedRole(rolesData[0]?.key ?? null);
        setPendingGrants(rolesData[0]?.permissions ?? []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

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
    </div>
  );
}
