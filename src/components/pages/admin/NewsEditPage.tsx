'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Tag, 
  Sparkles,
  Image as ImageIcon,
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface NewsEditPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  articleId?: string;
}

export function NewsEditPage({ currentPage, onNavigate, onLogout, articleId }: NewsEditPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Central Banks Accelerate Digital Currency Development',
    slug: 'central-banks-digital-currency-development',
    summary: 'Analysis of how central banks worldwide are advancing their CBDC programs and the implications for the global financial system.',
    body: `Central banks across the globe are accelerating their development of Central Bank Digital Currencies (CBDCs), marking a significant shift in the evolution of money and monetary policy.

## Key Development Areas

Major central banks including the Federal Reserve, European Central Bank, and Bank of England have advanced their CBDC research programs into pilot phases. These initiatives represent the most significant transformation in monetary systems since the end of the gold standard.

### International Coordination

The Bank for International Settlements (BIS) has facilitated unprecedented cooperation between central banks, establishing common frameworks for CBDC implementation while preserving monetary sovereignty.

## Technical Infrastructure

Leading central banks are exploring both account-based and token-based CBDC models, with particular attention to:

- Privacy-preserving technologies
- Offline payment capabilities
- Cross-border settlement systems
- Integration with existing payment infrastructure

## Policy Implications

The introduction of CBDCs raises fundamental questions about the future role of commercial banks, monetary policy transmission, and financial stability. Policymakers are carefully considering how to implement digital currencies without disrupting existing financial systems.

### Economic Impact

Early research suggests CBDCs could enhance payment efficiency, reduce costs, and improve financial inclusion. However, concerns remain about potential bank disintermediation and the need for appropriate safeguards.

## Long-term Vision

The CBDC development represents a strategic response to the digitalization of the global economy. As implementation progresses, the intersection of monetary policy, financial stability, and technological innovation will define the future of money.

Central banks emphasize that CBDCs will complement rather than replace physical currency, ensuring continued access to sovereign money in an increasingly digital world.`,
    category: 'Market',
    tags: ['CBDC', 'Central Banks', 'Digital Currency', 'Monetary Policy'],
    ecosystemTags: [],
    tokenTags: [],
    heroImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
    author: 'AI',
    sourceLink: 'https://coindesk.com/bitcoin-etf-approval',
    publishDate: '2024-11-13',
    publishTime: '14:30',
    seoTitle: 'Bitcoin ETF Approval Impact Analysis - Market Dynamics 2024',
    seoMeta: 'Complete analysis of Bitcoin ETF approval impact on institutional investment, market liquidity, and regulatory framework. Expert insights on long-term implications.',
    status: 'published'
  });

  const [tagInput, setTagInput] = useState('');
  const [ecosystemInput, setEcosystemInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  const categories = [
    'Finance',
    'Technology', 
    'Geopolitics',
    'Business'
  ];

  const ecosystems = [
    'Ethereum', 'Polygon', 'Solana', 'BNB Chain', 
    'Avalanche', 'Arbitrum', 'Optimism', 'Base'
  ];

  const handleAddTag = (type: 'tags' | 'ecosystemTags' | 'tokenTags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      if (type === 'tags') setTagInput('');
      if (type === 'ecosystemTags') setEcosystemInput('');
      if (type === 'tokenTags') setTokenInput('');
    }
  };

  const handleRemoveTag = (type: 'tags' | 'ecosystemTags' | 'tokenTags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = (status: string) => {
    const dataToSave = { ...formData, status };
    console.log('Updating article:', dataToSave);
    alert(`Article ${status === 'published' ? 'updated and published' : 'saved as draft'} successfully!`);
    onNavigate('admin/news');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      console.log('Deleting article:', articleId);
      alert('Article deleted successfully!');
      onNavigate('admin/news');
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
          title="Edit Article"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back & Action Buttons */}
            <div className="mb-6 flex gap-3 justify-between">
              <button
                onClick={() => onNavigate('admin/news')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => onNavigate(`admin/news/analytics/${articleId || '1'}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Analytics
                </button>
                <button
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleSave('published')}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Update & Publish
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Slug */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="article-url-slug"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    URL: /news/{formData.category ? formData.category.toLowerCase() : 'category'}/{formData.slug || 'article-slug'}
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief summary of the article..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Body Editor */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300">
                      Article Body *
                    </label>
                    <button className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Enhance
                    </button>
                  </div>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Write your article content here..."
                    rows={20}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                  />
                </div>

                {/* SEO Section */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="SEO optimized title..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.seoMeta}
                        onChange={(e) => setFormData({ ...formData, seoMeta: e.target.value })}
                        placeholder="Meta description for search engines..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Category */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Publish Date & Time */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Publish Date & Time
                  </label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="time"
                      value={formData.publishTime}
                      onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Leave blank to publish immediately
                  </p>
                </div>

                {/* Tags */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag('tags', tagInput)}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() => handleAddTag('tags', tagInput)}
                      className="px-3 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                        {tag}
                        <button onClick={() => handleRemoveTag('tags', idx)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Tags */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Ecosystems
                  </label>
                  <select
                    value={ecosystemInput}
                    onChange={(e) => {
                      handleAddTag('ecosystemTags', e.target.value);
                      setEcosystemInput('');
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 mb-3"
                  >
                    <option value="">Select ecosystem...</option>
                    {ecosystems.map(eco => (
                      <option key={eco} value={eco}>{eco}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {formData.ecosystemTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                        {tag}
                        <button onClick={() => handleRemoveTag('ecosystemTags', idx)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Token Tags */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Tokens
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag('tokenTags', tokenInput)}
                      placeholder="BTC, ETH, SOL..."
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() => handleAddTag('tokenTags', tokenInput)}
                      className="px-3 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tokenTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                        {tag}
                        <button onClick={() => handleRemoveTag('tokenTags', idx)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Hero Image
                  </label>
                  {formData.heroImage && (
                    <div className="mb-3 relative">
                      <img src={formData.heroImage} alt="Hero" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => setFormData({ ...formData, heroImage: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center gap-2 mx-auto">
                      <Upload className="w-4 h-4" />
                      Change Image
                    </button>
                  </div>
                </div>

                {/* Author & Source */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Author
                  </label>
                  <select
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 mb-4"
                  >
                    <option value="AI">AI Generated</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                  </select>

                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Source Link
                  </label>
                  <input
                    type="url"
                    value={formData.sourceLink}
                    onChange={(e) => setFormData({ ...formData, sourceLink: e.target.value })}
                    placeholder="https://source.com/article"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}