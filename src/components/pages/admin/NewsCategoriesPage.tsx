'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Search,
  Eye,
  FileText,
  Tag,
  CheckCircle,
  Lock,
  TrendingUp,
  Cpu,
  Globe,
  Briefcase,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { listNewsCategories, type NewsCategorySummary } from '@/services/taxonomy';
import { NEWS_CATEGORIES, labelForSlug } from '@/lib/taxonomy';

interface NewsCategoriesPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

/**
 * Presentation only. The list of desks itself comes from the API — this maps a
 * slug to the icon and accent colour the card is drawn with, and falls back to
 * a neutral pair for any desk added later in the CMS.
 */
const DESK_STYLE: Record<string, { icon: LucideIcon; color: string; description: string }> = {
  industry: {
    icon: Newspaper,
    color: '#0EA5E9',
    description: 'Exchanges, funds, mining and the wider crypto industry',
  },
  business: {
    icon: Briefcase,
    color: '#F59E0B',
    description: 'Corporate adoption, partnerships, funding and enterprise news',
  },
  technology: {
    icon: Cpu,
    color: '#3B82F6',
    description: 'Blockchain technology, AI, Web3, protocols and development',
  },
  security: {
    icon: ShieldCheck,
    color: '#EF4444',
    description: 'Hacks, exploits, audits, custody and operational security',
  },
  policy: {
    icon: Globe,
    color: '#8B5CF6',
    description: 'Global regulation, CBDCs, government policy and enforcement',
  },
  adoption: {
    icon: Users,
    color: '#14B8A6',
    description: 'Merchant, retail, institutional and country-level adoption',
  },
  market: {
    icon: TrendingUp,
    color: '#10B981',
    description: 'Market news, trading, DeFi and institutional flows',
  },
};

const FALLBACK_STYLE = { icon: Tag, color: '#6B7280', description: '' };

/** Shown while the request is in flight, so the grid never renders as empty. */
const PLACEHOLDER: NewsCategorySummary[] = NEWS_CATEGORIES.map((slug, index) => ({
  id: slug,
  slug,
  name: labelForSlug(slug),
  position: index,
  articleCount: 0,
}));

export function NewsCategoriesPage({ currentPage, onNavigate, onLogout }: NewsCategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<NewsCategorySummary[]>(PLACEHOLDER);

  useEffect(() => {
    let active = true;
    listNewsCategories().then(items => {
      if (active && items.length > 0) setCategories(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalArticles = categories.reduce((sum, cat) => sum + cat.articleCount, 0);

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
        <AdminHeader
          title="News Categories"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Info Alert */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-900 dark:text-yellow-200 mb-1">Main Categories Locked</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                These are the news desks the public site navigates by
                ({categories.map(cat => cat.name).join(', ')}). They are system categories and
                cannot be edited or deleted from here.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Categories</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">{categories.length}</p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">{categories.length}</p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Articles</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">{totalArticles}</p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">System Locked</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">{categories.length}</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-80"
                />
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCategories.map((category) => {
              const style = DESK_STYLE[category.slug] ?? FALLBACK_STYLE;
              const IconComponent = style.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${style.color}20`, color: style.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-gray-100 mb-1">{category.name}</h3>
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {category.slug}
                        </code>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{style.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        {category.articleCount} articles
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs">
                        <Eye className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No categories found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
