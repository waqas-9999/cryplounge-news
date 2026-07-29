'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface NewsListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsListPage({ currentPage, onNavigate, onLogout }: NewsListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const articles = [
    {
      id: 1,
      title: 'Central Banks Accelerate Digital Currency Development',
      source: 'Reuters',
      category: 'Market',
      status: 'published',
      aiScore: 95,
      views: 12453,
      ctr: 8.7,
      publishedAt: '2 hours ago'
    },
    {
      id: 2,
      title: 'AI Integration in Blockchain Networks',
      source: 'TechCrunch',
      category: 'Technology',
      status: 'published',
      aiScore: 92,
      views: 10832,
      ctr: 9.2,
      publishedAt: '5 hours ago'
    },
    {
      id: 3,
      title: 'G20 Summit Addresses Crypto Regulation Framework',
      source: 'Bloomberg',
      category: 'Policy',
      status: 'review',
      aiScore: 78,
      views: 0,
      ctr: 0,
      publishedAt: null
    },
    {
      id: 4,
      title: 'Fortune 500 Companies Adopt Blockchain Solutions',
      source: 'Forbes',
      category: 'Business',
      status: 'draft',
      aiScore: 85,
      views: 0,
      ctr: 0,
      publishedAt: null
    },
    {
      id: 5,
      title: 'Institutional Investment in Digital Assets Reaches New High',
      source: 'Financial Times',
      category: 'Market',
      status: 'published',
      aiScore: 90,
      views: 8976,
      ctr: 7.3,
      publishedAt: '1 day ago'
    },
    {
      id: 6,
      title: 'China Updates CBDC Implementation Timeline',
      source: 'Reuters',
      category: 'Policy',
      status: 'review',
      aiScore: 88,
      views: 0,
      ctr: 0,
      publishedAt: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Needs Review
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

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
          title="News Management"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header Actions */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
            <div className="flex-1 flex gap-3">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              >
                <option value="all">All Categories</option>
                <option value="market">Market</option>
                <option value="technology">Technology</option>
                <option value="policy">Policy</option>
                <option value="business">Business</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="review">Needs Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => onNavigate('admin/news/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Article
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Source</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">AI Score</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Views</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">CTR</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Published</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                          {article.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {article.source}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                          {article.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                          article.aiScore >= 90 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : article.aiScore >= 80
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {article.aiScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {article.ctr}%
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {article.publishedAt || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate(`admin/news/analytics/${article.id}`)}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Preview">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => onNavigate(`admin/news/edit/${article.id}`)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing 1-6 of 1,245 articles
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg text-sm hover:bg-yellow-500 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}