'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Eye, 
  Clock,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface NewsModerationQueuePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface QueuedArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: string;
  aiCategory: string;
  aiTags: string[];
  aiQualityScore: number;
  aiSentiment: 'positive' | 'neutral' | 'negative';
  fetchedAt: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  requiresEdit: boolean;
}

export function NewsModerationQueuePage({ currentPage, onNavigate, onLogout }: NewsModerationQueuePageProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'high-quality' | 'needs-review'>('pending');
  const [articles, setArticles] = useState<QueuedArticle[]>([
    {
      id: '1',
      title: 'IMF Report: Global Digital Currency Adoption Accelerates',
      summary: 'International Monetary Fund releases comprehensive analysis on the rapid adoption of digital currencies by central banks worldwide.',
      content: 'Full article content here...',
      source: 'Reuters API',
      sourceUrl: 'https://reuters.com/imf-digital-currency',
      category: 'Finance',
      aiCategory: 'Finance',
      aiTags: ['Central Banks', 'IMF', 'CBDC', 'Policy'],
      aiQualityScore: 92,
      aiSentiment: 'positive',
      fetchedAt: '2025-11-13T10:30:00',
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
      status: 'pending',
      requiresEdit: false
    },
    {
      id: '2',
      title: 'Quantum Computing Breakthrough for Blockchain Security',
      summary: 'New quantum-resistant algorithms promise enhanced security for distributed ledger technology networks.',
      content: 'Full article content here...',
      source: 'TechCrunch RSS',
      sourceUrl: 'https://techcrunch.com/quantum-blockchain',
      category: 'Technology',
      aiCategory: 'Technology',
      aiTags: ['Quantum Computing', 'Security', 'Innovation'],
      aiQualityScore: 88,
      aiSentiment: 'positive',
      fetchedAt: '2025-11-13T09:45:00',
      status: 'pending',
      requiresEdit: false
    },
    {
      id: '3',
      title: 'EU Finalizes Comprehensive Crypto Regulation Framework',
      summary: 'European Union announces finalized MiCA regulations establishing clear guidelines for digital asset operations.',
      content: 'Full article content here...',
      source: 'Bloomberg API',
      sourceUrl: 'https://bloomberg.com/eu-crypto-regulation',
      category: 'Geopolitics',
      aiCategory: 'Geopolitics',
      aiTags: ['Regulation', 'EU', 'MiCA', 'Policy'],
      aiQualityScore: 76,
      aiSentiment: 'neutral',
      fetchedAt: '2025-11-13T08:20:00',
      status: 'pending',
      requiresEdit: true
    },
    {
      id: '4',
      title: 'Major Banks Form Blockchain Consortium',
      summary: 'Leading financial institutions announce partnership for cross-border payment infrastructure.',
      content: 'Full article content here...',
      source: 'Financial Times',
      sourceUrl: 'https://ft.com/banks-blockchain',
      category: 'Business',
      aiCategory: 'Business',
      aiTags: ['Banking', 'Consortium', 'Payments'],
      aiQualityScore: 54,
      aiSentiment: 'negative',
      fetchedAt: '2025-11-13T07:15:00',
      status: 'pending',
      requiresEdit: true
    }
  ]);

  const handleApprove = (id: string) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, status: 'approved' as const } : article
    ));
    toast.success('Article approved and published');
  };

  const handleReject = (id: string) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, status: 'rejected' as const } : article
    ));
    toast.success('Article rejected');
  };

  const handleEdit = (id: string) => {
    toast.info('Opening article in editor...');
    onNavigate(`admin/news/edit/${id}`);
  };

  const handleApproveAll = () => {
    const highQualityArticles = articles.filter(a => 
      a.status === 'pending' && a.aiQualityScore >= 80 && !a.requiresEdit
    );
    
    if (highQualityArticles.length === 0) {
      toast.error('No high-quality articles to auto-approve');
      return;
    }

    setArticles(articles.map(article => 
      highQualityArticles.some(a => a.id === article.id) 
        ? { ...article, status: 'approved' as const } 
        : article
    ));
    toast.success(`${highQualityArticles.length} high-quality articles approved`);
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'pending') return article.status === 'pending';
    if (filter === 'high-quality') return article.aiQualityScore >= 80 && !article.requiresEdit;
    if (filter === 'needs-review') return article.requiresEdit || article.aiQualityScore < 70;
    return true;
  });

  const pendingCount = articles.filter(a => a.status === 'pending').length;
  const highQualityCount = articles.filter(a => a.aiQualityScore >= 80 && !a.requiresEdit && a.status === 'pending').length;
  const needsReviewCount = articles.filter(a => (a.requiresEdit || a.aiQualityScore < 70) && a.status === 'pending').length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Moderation Queue" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">Content Moderation Queue</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review and approve auto-fetched news articles
                  </p>
                </div>
                <button
                  onClick={handleApproveAll}
                  disabled={highQualityCount === 0}
                  className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Auto-Approve High Quality ({highQualityCount})
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'pending'
                      ? 'bg-[#EFB81A] text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Pending ({pendingCount})
                </button>
                
                <button
                  onClick={() => setFilter('high-quality')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'high-quality'
                      ? 'bg-[#EFB81A] text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  High Quality ({highQualityCount})
                </button>
                
                <button
                  onClick={() => setFilter('needs-review')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'needs-review'
                      ? 'bg-[#EFB81A] text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Needs Review ({needsReviewCount})
                </button>
                
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'all'
                      ? 'bg-[#EFB81A] text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  All ({articles.length})
                </button>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  className={`bg-white dark:bg-[#1A1A1C] rounded-xl border-2 transition-all ${
                    article.status === 'approved' 
                      ? 'border-green-500 dark:border-green-600 opacity-60' 
                      : article.status === 'rejected'
                      ? 'border-red-500 dark:border-red-600 opacity-60'
                      : 'border-gray-200 dark:border-gray-800 hover:border-[#EFB81A]'
                  } p-6`}
                >
                  <div className="flex gap-4">
                    {/* Article Image */}
                    {article.imageUrl && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{article.aiCategory}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              from {article.source}
                            </span>
                            <a
                              href={article.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          
                          <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {article.summary}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            {/* AI Quality Score */}
                            <div className="flex items-center gap-2">
                              <Sparkles className={`w-4 h-4 ${
                                article.aiQualityScore >= 80 ? 'text-green-500' :
                                article.aiQualityScore >= 60 ? 'text-yellow-500' :
                                'text-red-500'
                              }`} />
                              <span className={`${
                                article.aiQualityScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                article.aiQualityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                Quality: {article.aiQualityScore}%
                              </span>
                            </div>

                            {/* AI Sentiment */}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Sentiment: 
                                <span className={`ml-1 ${
                                  article.aiSentiment === 'positive' ? 'text-green-600 dark:text-green-400' :
                                  article.aiSentiment === 'negative' ? 'text-red-600 dark:text-red-400' :
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {article.aiSentiment}
                                </span>
                              </span>
                            </div>

                            {/* Fetched Time */}
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              {new Date(article.fetchedAt).toLocaleString()}
                            </div>
                          </div>

                          {/* AI Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.aiTags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Warnings */}
                          {article.requiresEdit && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                              <AlertCircle className="w-4 h-4" />
                              AI suggests manual review before publishing
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        {article.status !== 'pending' && (
                          <Badge 
                            variant={article.status === 'approved' ? 'default' : 'destructive'}
                            className="ml-4"
                          >
                            {article.status}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {article.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <button
                            onClick={() => handleApprove(article.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Publish
                          </button>
                          
                          <button
                            onClick={() => handleEdit(article.id)}
                            className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit First
                          </button>
                          
                          <button
                            onClick={() => handleReject(article.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>

                          <button
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredArticles.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {filter === 'pending' ? 'No Pending Articles' : 'No Articles Found'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === 'pending' 
                      ? 'All caught up! No articles waiting for review.' 
                      : 'Try changing the filter to see more articles.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}