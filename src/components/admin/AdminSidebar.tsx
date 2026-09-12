'use client';

import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  UserCircle,
  ChevronDown,
  LogOut,
  ScrollText,
  CalendarDays,
  BookUser,
  Mail,
  Send,
  Layers,
  FileText,
  X
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

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
    if (currentPage.startsWith('admin/events') || currentPage.startsWith('admin/organizers')) sections.push('events');
    if (currentPage.startsWith('admin/founders')) sections.push('founders');
    if (currentPage.startsWith('admin/projects')) sections.push('projects');
    if (currentPage.startsWith('admin/newsletter')) sections.push('newsletter');
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

  /* ------------------------------------------------------- scroll affordance -- */

  const navRef = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  /**
   * Tracks whether the nav is scrolled away from either end, so the fade masks
   * below only appear on the side that actually has content hidden. Without
   * this the list just gets clipped mid-item and looks like it ends there.
   */
  const measureEdges = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      top: scrollTop > 4,
      // A 4px tolerance avoids the mask flickering on sub-pixel scroll heights.
      bottom: scrollTop + clientHeight < scrollHeight - 4,
    });
  }, []);

  // Re-measure when the menu height changes (a section expanding or collapsing
  // is the most common cause) as well as on scroll and viewport resize.
  useEffect(() => {
    measureEdges();
    const el = navRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measureEdges);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measureEdges, expandedSections]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      page: 'admin/dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      page: 'admin/analytics'
    },
    {
      id: 'news',
      label: 'News Management',
      icon: Newspaper,
      submenu: [
        { label: 'All Articles', page: 'admin/news' },
        { label: 'Create New', page: 'admin/news/create' },
        { label: 'Comments', page: 'admin/news/comments' },
        { label: 'Categories', page: 'admin/news/categories' },
        { label: 'Analytics', page: 'admin/news/analytics' }
      ]
    },
    {
      id: 'events',
      label: 'Events Management',
      icon: CalendarDays,
      submenu: [
        { label: 'All Events', page: 'admin/events' },
        { label: 'Create New', page: 'admin/events/create' },
        { label: 'Organizers', page: 'admin/organizers' },
        { label: 'Analytics & Reports', page: 'admin/events/analytics' }
      ]
    },
    {
      id: 'projects',
      label: 'Ecosystem Projects',
      icon: Layers,
      submenu: [
        { label: 'All Projects', page: 'admin/projects' },
        { label: 'Create New', page: 'admin/projects/create' }
      ]
    },
    {
      id: 'founders',
      label: 'Stories Management',
      icon: BookUser,
      submenu: [
        { label: 'All Stories', page: 'admin/founders' },
        { label: 'Create New', page: 'admin/founders/create' },
        { label: 'Analytics & Reports', page: 'admin/founders/analytics' }
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
      id: 'contact',
      label: 'Contact Messages',
      icon: Mail,
      page: 'admin/contact'
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      icon: Send,
      submenu: [
        { label: 'Subscribers', page: 'admin/newsletter' },
        { label: 'Campaigns', page: 'admin/newsletter/campaigns' },
        { label: 'Create Newsletter', page: 'admin/newsletter/campaigns/new' }
      ]
    },
    {
      id: 'ai',
      label: 'AI Newsroom',
      icon: Bot,
      submenu: [
        { label: 'Intelligence', page: 'admin/newsroom-intelligence' },
        { label: 'Qualified News', page: 'admin/news-discovery/qualified' },
        { label: 'All Discovered News', page: 'admin/news-discovery/all' },
        { label: 'Automation', page: 'admin/ai-automation' }
      ]
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: ScrollText,
      page: 'admin/logs'
    },
    {
      id: 'legal-pages',
      label: 'Legal Pages',
      icon: FileText,
      submenu: [
        { label: 'All Pages', page: 'admin/pages' },
        { label: 'Create New', page: 'admin/pages/create' }
      ]
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

        {/* Navigation. The wrapper is the positioning context for the scroll
            fades; the nav itself is the scroll container. */}
        <div className="relative flex-1 min-h-0">
          {/* Fade masks. Purely decorative and never interactive, so they are
              pointer-events-none and hidden from assistive tech. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute top-0 inset-x-0 h-6 z-10 bg-gradient-to-b from-white dark:from-[#1A1A1C] to-transparent transition-opacity duration-200 ${
              edges.top ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute bottom-0 inset-x-0 h-8 z-10 bg-gradient-to-t from-white dark:from-[#1A1A1C] to-transparent transition-opacity duration-200 ${
              edges.bottom ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <nav
            ref={navRef}
            onScroll={measureEdges}
            /* `overscroll-contain` stops a scroll that reaches the end of the
               menu from continuing into the page behind it.
               `scrollbar-gutter: stable` reserves the track's width so the menu
               does not shift sideways when the scrollbar appears. */
            style={{ scrollbarGutter: 'stable' }}
            className="h-full overflow-y-auto overscroll-contain px-4 py-4 space-y-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/70 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-600 [scrollbar-width:thin] [scrollbar-color:#D1D5DB_transparent] dark:[scrollbar-color:#374151_transparent]"
          >
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
        </div>

        {/* Profile & Logout. `shrink-0` keeps it pinned at full height however
            long the menu above grows. */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
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