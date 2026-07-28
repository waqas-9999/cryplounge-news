import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Key,
  Bell,
  Activity,
  Monitor,
  Smartphone,
  Clock,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import { useState } from 'react';

interface AdminProfilePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminProfilePage({ currentPage, onNavigate, onLogout }: AdminProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'activity'>('profile');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@cryplounge.com',
    phone: '+1 (555) 123-4567',
    role: 'Super Admin',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2024',
    bio: 'Experienced cryptocurrency platform administrator with a passion for blockchain technology and community management.'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailAlerts: true,
    loginNotifications: true
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    newArticles: true,
    newUsers: true,
    newComments: false,
    systemAlerts: true,
    weeklyReports: true,
    monthlyAnalytics: true
  });

  const recentActivity = [
    { action: 'Updated article', title: 'Bitcoin Price Analysis', time: '2 hours ago', type: 'edit' },
    { action: 'Created new category', title: 'DeFi Trends', time: '5 hours ago', type: 'create' },
    { action: 'Approved user comment', title: 'Ethereum 2.0 Discussion', time: '1 day ago', type: 'approve' },
    { action: 'Published event', title: 'Blockchain Summit 2024', time: '2 days ago', type: 'publish' },
    { action: 'Updated system settings', title: 'Email Configuration', time: '3 days ago', type: 'settings' }
  ];

  const activeSessions = [
    { device: 'Chrome on MacBook Pro', location: 'San Francisco, CA', lastActive: 'Active now', current: true },
    { device: 'Safari on iPhone 14', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
    { device: 'Chrome on Windows', location: 'New York, NY', lastActive: '1 day ago', current: false }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0D0D0E] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader 
          title="My Profile"
          subtitle="Manage your account settings and preferences"
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
            
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A]"></div>
              <div className="px-8 pb-8">
                <div className="flex items-end gap-6 -mt-16">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-[#1A1A1C] flex items-center justify-center overflow-hidden">
                      <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-[#EFB81A] rounded-full flex items-center justify-center hover:bg-[#d9a617] transition-colors">
                      <Camera className="w-4 h-4 text-gray-900" />
                    </button>
                  </div>
                  <div className="flex-1 pt-4">
                    <h2 className="text-2xl text-gray-900 dark:text-gray-100">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-[#EFB81A]" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{profileData.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Joined {profileData.joinDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
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
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                  activeTab === 'security'
                    ? 'border-[#EFB81A] text-[#EFB81A]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                  activeTab === 'notifications'
                    ? 'border-[#EFB81A] text-[#EFB81A]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-[#EFB81A] text-[#EFB81A]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Activity & Sessions
              </button>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">About</h3>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Brief description for your profile. Max 200 characters.
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-4">Account Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{profileData.role}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{profileData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <button className="px-6 py-2.5 bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 rounded-lg transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D0D0E] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] focus:border-transparent"
                      />
                    </div>
                    <button className="w-full px-4 py-2.5 bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Key className="w-4 h-4" />
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0D0D0E] rounded-lg">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Add an extra layer of security</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          securitySettings.twoFactorEnabled ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0D0D0E] rounded-lg">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">Email Alerts</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Get notified of account activity</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, emailAlerts: !securitySettings.emailAlerts })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          securitySettings.emailAlerts ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          securitySettings.emailAlerts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0D0D0E] rounded-lg">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">Login Notifications</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Alert me of new login attempts</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, loginNotifications: !securitySettings.loginNotifications })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          securitySettings.loginNotifications ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Active Sessions</h3>
                  <div className="space-y-3">
                    {activeSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0D0D0E] rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center">
                            {session.device.includes('iPhone') ? (
                              <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm text-gray-900 dark:text-gray-100">{session.device}</h4>
                              {session.current && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.location}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="text-xs text-red-600 dark:text-red-400 hover:underline">
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">Content Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">New Articles</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Notify when new articles are published</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, newArticles: !notificationPreferences.newArticles })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.newArticles ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.newArticles ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">New Users</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Notify when users register</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, newUsers: !notificationPreferences.newUsers })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.newUsers ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.newUsers ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">New Comments</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Notify when users comment</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, newComments: !notificationPreferences.newComments })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.newComments ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.newComments ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-6">System Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">System Alerts</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Critical system notifications</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, systemAlerts: !notificationPreferences.systemAlerts })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.systemAlerts ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.systemAlerts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">Weekly Reports</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Weekly analytics summary</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, weeklyReports: !notificationPreferences.weeklyReports })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.weeklyReports ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.weeklyReports ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-gray-100">Monthly Analytics</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Monthly performance reports</p>
                      </div>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, monthlyAnalytics: !notificationPreferences.monthlyAnalytics })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationPreferences.monthlyAnalytics ? 'bg-[#EFB81A]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationPreferences.monthlyAnalytics ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <button className="px-6 py-2.5 bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 rounded-lg transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your recent actions on the platform</p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-[#0D0D0E] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'edit' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          activity.type === 'create' ? 'bg-green-100 dark:bg-green-900/20' :
                          activity.type === 'approve' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          activity.type === 'publish' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          <Activity className={`w-5 h-5 ${
                            activity.type === 'edit' ? 'text-blue-600 dark:text-blue-400' :
                            activity.type === 'create' ? 'text-green-600 dark:text-green-400' :
                            activity.type === 'approve' ? 'text-yellow-600 dark:text-yellow-400' :
                            activity.type === 'publish' ? 'text-purple-600 dark:text-purple-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900 dark:text-gray-100">{activity.action}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
