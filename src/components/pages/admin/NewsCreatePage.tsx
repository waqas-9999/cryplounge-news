'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Tag, 
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface NewsCreatePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsCreatePage({ currentPage, onNavigate, onLogout }: NewsCreatePageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    body: '',
    category: '',
    tags: [] as string[],
    ecosystemTags: [] as string[],
    tokenTags: [] as string[],
    heroImage: '',
    thumbnail: '',
    author: 'AI',
    sourceLink: '',
    publishDate: '',
    publishTime: '',
    seoTitle: '',
    seoMeta: '',
    status: 'draft',
    showInFeatured: false,
    featuredCategory: ''
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
    console.log('Saving article:', dataToSave);
    // Show success toast
    alert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
    onNavigate('admin/news');
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
          title="Create News Article"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Action Buttons */}
            <div className="mb-6 flex gap-3 justify-end">
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
                Publish
              </button>
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
                    rows={15}
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
                    Schedule Publishing
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time</label>
                      <input
                        type="time"
                        value={formData.publishTime}
                        onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Leave blank to publish immediately. Scheduled articles will be published automatically at the specified time.
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

                {/* Images */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Hero Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center gap-2 mx-auto">
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">or</p>
                    <button className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline mt-1 flex items-center gap-1 mx-auto">
                      <Sparkles className="w-3 h-3" />
                      Generate with AI
                    </button>
                  </div>
                </div>

                {/* Featured Settings */}
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Featured Settings</h3>
                  
                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-[#202225] rounded-lg">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Show in Homepage Featured Section
                    </label>
                    <Switch
                      checked={formData.showInFeatured}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        showInFeatured: checked,
                        featuredCategory: checked ? formData.featuredCategory : ''
                      })}
                    />
                  </div>

                  {/* Featured Category Dropdown */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Featured Category
                    </label>
                    <select
                      value={formData.featuredCategory}
                      onChange={(e) => setFormData({ ...formData, featuredCategory: e.target.value })}
                      disabled={!formData.showInFeatured}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                        !formData.showInFeatured ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Select featured category...</option>
                      <option value="hero">Hero Article</option>
                      <option value="featured">Featured News</option>
                      <option value="recommended">Recommended</option>
                      <option value="latest">Latest News</option>
                      <option value="most-read">Most Read</option>
                      <option value="market">Market</option>
                      <option value="policy">Policy</option>
                      <option value="policy">Policy</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      This article will appear in the selected featured section on the homepage
                    </p>
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