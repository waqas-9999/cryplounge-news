'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Save
} from 'lucide-react';

interface RolesPermissionsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function RolesPermissionsPage({ currentPage, onNavigate, onLogout }: RolesPermissionsPageProps) {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      userCount: 3,
      color: 'red'
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can create and edit content',
      userCount: 12,
      color: 'blue'
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Can review and moderate content',
      userCount: 8,
      color: 'green'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to analytics',
      userCount: 25,
      color: 'gray'
    }
  ];

  const permissions = {
    news: [
      { id: 'news.create', name: 'Create Articles', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'news.edit', name: 'Edit Articles', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'news.delete', name: 'Delete Articles', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'news.publish', name: 'Publish Articles', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'news.view', name: 'View Articles', admin: true, editor: true, moderator: true, viewer: true }
    ],
    learn: [
      { id: 'learn.create', name: 'Create Tutorials', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'learn.edit', name: 'Edit Tutorials', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'learn.delete', name: 'Delete Tutorials', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'learn.manage_categories', name: 'Manage Categories', admin: true, editor: false, moderator: false, viewer: false }
    ],
    founders: [
      { id: 'founders.create', name: 'Create Stories', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'founders.edit', name: 'Edit Stories', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'founders.delete', name: 'Delete Stories', admin: true, editor: false, moderator: false, viewer: false }
    ],
    events: [
      { id: 'events.create', name: 'Create Events', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'events.edit', name: 'Edit Events', admin: true, editor: true, moderator: false, viewer: false },
      { id: 'events.delete', name: 'Delete Events', admin: true, editor: false, moderator: false, viewer: false }
    ],
    users: [
      { id: 'users.view', name: 'View Users', admin: true, editor: false, moderator: true, viewer: true },
      { id: 'users.create', name: 'Create Users', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'users.edit', name: 'Edit Users', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'users.delete', name: 'Delete Users', admin: true, editor: false, moderator: false, viewer: false }
    ],
    settings: [
      { id: 'settings.view', name: 'View Settings', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'settings.edit', name: 'Edit Settings', admin: true, editor: false, moderator: false, viewer: false },
      { id: 'settings.manage_roles', name: 'Manage Roles', admin: true, editor: false, moderator: false, viewer: false }
    ]
  };

  const stats = {
    totalRoles: roles.length,
    totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
    totalPermissions: Object.values(permissions).flat().length,
    activeRoles: roles.filter(r => r.userCount > 0).length
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Roles & Permissions" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            {/* Roles List */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg text-gray-900 dark:text-gray-100">Roles</h3>
                <button className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedRole === role.id
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

            {/* Permissions Matrix */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg text-gray-900 dark:text-gray-100">
                  Permissions for {roles.find(r => r.id === selectedRole)?.name}
                </h3>
                <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Permissions by Module */}
              <div className="space-y-6">
                {Object.entries(permissions).map(([module, perms]) => (
                  <div key={module}>
                    <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                      {module}
                    </h4>
                    <div className="space-y-2">
                      {perms.map(perm => {
                        const hasPermission = perm[selectedRole as keyof typeof perm];
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#202225] rounded-lg"
                          >
                            <span className="text-sm text-gray-900 dark:text-gray-100">{perm.name}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasPermission as boolean}
                                className="sr-only peer"
                                onChange={() => {}}
                              />
                              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
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
        </main>
      </div>
    </div>
  );
}
