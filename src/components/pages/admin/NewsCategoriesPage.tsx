'use client';

import { useState } from 'react';
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
  Briefcase
} from 'lucide-react';

interface NewsCategoriesPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsCategoriesPage({ currentPage, onNavigate, onLogout }: NewsCategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fixed main categories - locked and cannot be edited/deleted
  const mainCategories = [
    { 
      id: '1', 
      name: 'Market', 
      slug: 'market', 
      description: 'Financial news, markets, trading, DeFi, and institutional crypto', 
      icon: TrendingUp, 
      color: '#10B981', 
      isActive: true, 
      articleCount: 0 
    },
    { 
      id: '2', 
      name: 'Technology', 
      slug: 'technology', 
      description: 'Blockchain technology, AI, Web3, innovation, and development', 
      icon: Cpu, 
      color: '#3B82F6', 
      isActive: true, 
      articleCount: 0 
    },
    { 
      id: '3', 
      name: 'Policy', 
      slug: 'policy', 
      description: 'Global regulation, CBDC, government policies, and international adoption', 
      icon: Globe, 
      color: '#8B5CF6', 
      isActive: true, 
      articleCount: 0 
    },
    { 
      id: '4', 
      name: 'Business', 
      slug: 'business', 
      description: 'Corporate adoption, partnerships, enterprise solutions, and institutional news', 
      icon: Briefcase, 
      color: '#F59E0B', 
      isActive: true, 
      articleCount: 0 
    }
  ];

  // Filter categories
  const filteredCategories = mainCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                The four main categories (Finance, Technology, Geopolitics, Business) are system categories and cannot be edited or deleted. These are the core categories for CrypLounge news platform.
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
              <p className="text-2xl text-gray-900 dark:text-gray-100">{mainCategories.length}</p>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">
                {mainCategories.filter(cat => cat.isActive).length}
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Articles</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">
                {mainCategories.reduce((sum, cat) => sum + cat.articleCount, 0)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">System Locked</span>
              </div>
              <p className="text-2xl text-gray-900 dark:text-gray-100">4</p>
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
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.id} 
                  className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
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

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>

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
