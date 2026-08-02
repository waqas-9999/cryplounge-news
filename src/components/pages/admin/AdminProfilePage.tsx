'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { User, Mail, Shield, Calendar, Activity, Save, Camera, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';

interface AdminProfilePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  summary: string | null;
  createdAt: string;
}

export function AdminProfilePage({ currentPage, onNavigate, onLogout }: AdminProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [activityState, setActivityState] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');

  useEffect(() => {
    apiClient
      .get<Me>('users/me')
      .then(user => {
        setMe(user);
        setName(user.name);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    if (activeTab !== 'activity' || activityState !== 'idle' || !me) return;
    setActivityState('loading');
    apiClient
      .get<AuditEntry[]>(`users/${me.id}/activity`)
      .then(entries => {
        setActivity(entries);
        setActivityState('ready');
      })
      .catch(() => setActivityState('unavailable'));
  }, [activeTab, activityState, me]);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'avatars');
      const asset = await apiClient.upload<{ id: string; path: string; url: string }>('media', form);
      const updated = await apiClient.patch<Me>('users/me', { avatarUrl: asset.url });
      setMe(updated);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update avatar'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await apiClient.patch<Me>('users/me', { name });
      setMe(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0D0D0E] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="My Profile" subtitle="Manage your account settings and preferences" />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' || !me ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load your profile.
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A]"></div>
                  <div className="px-8 pb-8">
                    <div className="flex items-end gap-6 -mt-16">
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                          }}
                        />
                        <div className="w-32 h-32 rounded-2xl bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-[#1A1A1C] flex items-center justify-center overflow-hidden">
                          {me.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-[#EFB81A] rounded-full flex items-center justify-center hover:bg-[#d9a617] transition-colors disabled:opacity-50"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 text-gray-900 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4 text-gray-900" />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 pt-4">
                        <h2 className="text-2xl text-gray-900 dark:text-gray-100">{me.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Shield className="w-4 h-4 text-[#EFB81A]" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{me.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Joined {new Date(me.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                      activeTab === 'profile'
                        ? 'border-[#EFB81A] text-[#EFB81A]'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                      activeTab === 'activity'
                        ? 'border-[#EFB81A] text-[#EFB81A]'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Activity
                  </button>
                </div>

                {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Personal Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={me.email}
                              disabled
                              className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Email cannot be changed here.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-4">Account Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{me.role}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {new Date(me.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">Recent Activity</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your recent actions on the platform</p>
                    </div>
                    {activityState === 'loading' ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                      </div>
                    ) : activityState === 'unavailable' ? (
                      <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        Activity history isn&apos;t available for your role.
                      </div>
                    ) : activity.length === 0 ? (
                      <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No recent activity.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {activity.map(entry => (
                          <div key={entry.id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#0D0D0E] transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm text-gray-900 dark:text-gray-100">
                                  {entry.action} {entry.entity}
                                </h4>
                                {entry.summary && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.summary}</p>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                                  {new Date(entry.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
