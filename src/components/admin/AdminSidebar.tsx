'use client';

import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  UserCircle,
  ChevronDown,
  LogOut,
  ScrollText,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ currentPage, onNavigate, onLogout, isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  // Auto-expand sections based on current page
  const getInitialExpandedSections = () => {
    const sections: string[] = [];
    
    if (currentPage.startsWith('admin/news')) sections.push('news');
    if (currentPage.startsWith('admin/settings')) sections.push('settings');
    
    // Always include dashboard
    if (sections.length === 0) sections.push('dashboard');
    
    return sections;
  };

  const [expandedSections, setExpandedSections] = useState<string[]>(getInitialExpandedSections());

  // Update expanded sections when currentPage changes
  useEffect(() => {
    setExpandedSections(getInitialExpandedSections());
  }, [currentPage]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      page: 'admin/dashboard'
    },
    {
      id: 'news',
      label: 'News Management',
      icon: Newspaper,
      submenu: [
        { label: 'All Articles', page: 'admin/news' },
        { label: 'Create New', page: 'admin/news/create' },
        { label: 'Comments', page: 'admin/news/comments' },
        { label: 'Moderation Queue', page: 'admin/news/moderation' },
        { label: 'News Sources', page: 'admin/news/sources' },
        { label: 'Auto-Fetch Config', page: 'admin/news/auto-fetch' },
        { label: 'AI Settings', page: 'admin/news/ai-settings' },
        { label: 'Categories', page: 'admin/news/categories' },
        { label: 'Analytics', page: 'admin/news/analytics' }
      ]
    },
    {
      id: 'staff',
      label: 'Staff & Access',
      icon: Users,
      submenu: [
        { label: 'Users', page: 'admin/users' },
        { label: 'Roles & Permissions', page: 'admin/roles-permissions' }
      ]
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: ScrollText,
      page: 'admin/logs'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      submenu: [
        { label: 'General', page: 'admin/settings/general' },
        { label: 'SEO', page: 'admin/settings/seo' },
        { label: 'Email', page: 'admin/settings/email' },
        { label: 'API Settings', page: 'admin/settings/api' },
        { label: 'API Integrations', page: 'admin/settings/api-integrations' },
        { label: 'Security', page: 'admin/settings/security' },
        { label: 'Appearance', page: 'admin/settings/appearance' },
        { label: 'Backup', page: 'admin/settings/backup' },
        { label: 'System', page: 'admin/system-settings' }
      ]
    }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-64 h-screen bg-white dark:bg-[#1A1A1C] border-r border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo & Close Button */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">CrypLounge</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-600">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.includes(item.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.page}
                          onClick={() => handleNavigate(subItem.page)}
                          className={`w-full text-left px-3 py-2.5 md:py-2 text-sm rounded-lg transition-colors min-h-[40px] md:min-h-0 flex items-center ${
                            currentPage === subItem.page
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate(item.page!)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === item.page
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={() => handleNavigate('admin/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-sm">My Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}