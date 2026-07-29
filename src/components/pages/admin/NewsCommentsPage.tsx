'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  MessageSquare, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsCommentsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: string;
  status: 'approved' | 'pending' | 'hidden';
  category: string;
}

export function NewsCommentsPage({ currentPage, onNavigate, onLogout }: NewsCommentsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      articleId: 'news1',
      articleTitle: 'Bitcoin Reaches New All-Time High',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      content: 'This is great news for crypto investors! The momentum seems unstoppable.',
      timestamp: new Date().toISOString(),
      status: 'approved',
      category: 'Market'
    },
    {
      id: '2',
      articleId: 'news2',
      articleTitle: 'Ethereum 2.0 Upgrade Complete',
      userName: 'Sarah Smith',
      userEmail: 'sarah@example.com',
      content: 'Finally! This upgrade will change everything for DeFi applications.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'approved',
      category: 'Technology'
    },
    {
      id: '3',
      articleId: 'news3',
      articleTitle: 'US SEC Approves Bitcoin ETF',
      userName: 'Mike Johnson',
      userEmail: 'mike@example.com',
      content: 'Regulatory clarity is what the market needed. Bullish!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'pending',
      category: 'Policy'
    },
    {
      id: '4',
      articleId: 'news4',
      articleTitle: 'Major Bank Announces Crypto Integration',
      userName: 'Emily Davis',
      userEmail: 'emily@example.com',
      content: 'Traditional finance meeting crypto is the future we need.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: 'approved',
      category: 'Business'
    },
  ]);

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    }
  };

  const handleToggleStatus = (commentId: string, newStatus: 'approved' | 'hidden') => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, status: newStatus } : c
    ));
    toast.success(`Comment ${newStatus === 'approved' ? 'approved' : 'hidden'} successfully`);
  };

  const handleApproveComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, status: 'approved' as const } : c
    ));
    toast.success('Comment approved successfully');
  };

  const categories = ['Finance', 'Technology', 'Geopolitics', 'Business'];

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || comment.status === filterStatus;
    const matchesCategory = selectedCategory === 'all' || comment.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = [
    {
      label: 'Total Comments',
      value: comments.length,
      color: 'blue',
      icon: MessageSquare
    },
    {
      label: 'Approved',
      value: comments.filter(c => c.status === 'approved').length,
      color: 'green',
      icon: CheckCircle2
    },
    {
      label: 'Pending',
      value: comments.filter(c => c.status === 'pending').length,
      color: 'yellow',
      icon: Clock
    },
    {
      label: 'Hidden',
      value: comments.filter(c => c.status === 'hidden').length,
      color: 'red',
      icon: EyeOff
    }
  ];

  const getStatusBadge = (status: Comment['status']) => {
    const styles = {
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      hidden: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };
    return styles[status];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          title="Comments Management"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-[#FFD200] to-[#F1EFA5] rounded-xl shadow-lg">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white">Comments Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">View, approve, and moderate user comments</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comments..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FFD200] min-h-[44px]"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FFD200] appearance-none min-h-[44px]"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FFD200] appearance-none min-h-[44px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {filteredComments.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No comments found</p>
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div 
                  key={comment.id}
                  className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 hover:border-[#FFD200] transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD200] to-[#F1EFA5] flex items-center justify-center">
                          <User className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{comment.userEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(comment.status)}`}>
                          {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {comment.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {comment.status === 'pending' && (
                        <button
                          onClick={() => handleApproveComment(comment.id)}
                          className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Approve comment"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </button>
                      )}
                      
                      {comment.status === 'approved' && (
                        <button
                          onClick={() => handleToggleStatus(comment.id, 'hidden')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Hide comment"
                        >
                          <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      
                      {comment.status === 'hidden' && (
                        <button
                          onClick={() => handleToggleStatus(comment.id, 'approved')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Show comment"
                        >
                          <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {/* Article Reference */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => onNavigate(`admin/news/edit/${comment.articleId}`)}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors"
                    >
                      On: <span className="underline">{comment.articleTitle}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}