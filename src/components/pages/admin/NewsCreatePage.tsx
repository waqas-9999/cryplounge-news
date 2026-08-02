'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Save,
  Upload,
  X,
  Tag,
  Sparkles,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface NewsCreatePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Author {
  id: string;
  slug: string;
  name: string;
}

interface TagOption {
  id: string;
  slug: string;
  name: string;
}

interface MediaAsset {
  id: string;
  path: string;
  url: string;
  altText: string | null;
}

export function NewsCreatePage({ currentPage, onNavigate, onLogout }: NewsCreatePageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    categoryId: '',
    authorId: '',
    tagIds: [] as string[],
    featuredImageId: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [featuredImage, setFeaturedImage] = useState<MediaAsset | null>(null);
  const [tagQuery, setTagQuery] = useState('');
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient
      .get<Category[]>('taxonomy/categories', { query: { kind: 'NEWS' }, auth: false })
      .then(setCategories)
      .catch(() => setCategories([]));
    apiClient
      .getPaginated<Author>('authors', { query: { perPage: 100 }, auth: false })
      .then(({ items }) => setAuthors(items))
      .catch(() => setAuthors([]));
    apiClient
      .getPaginated<TagOption>('taxonomy/tags', { query: { perPage: 200 }, auth: false })
      .then(({ items }) => setTags(items))
      .catch(() => setTags([]));
  }, []);

  const selectedTags = tags.filter(t => formData.tagIds.includes(t.id));
  const tagSuggestions = tags
    .filter(t => !formData.tagIds.includes(t.id))
    .filter(t => t.name.toLowerCase().includes(tagQuery.toLowerCase()))
    .slice(0, 6);

  function addTag(id: string) {
    setFormData(prev => ({ ...prev, tagIds: [...prev.tagIds, id] }));
    setTagQuery('');
  }

  function removeTag(id: string) {
    setFormData(prev => ({ ...prev, tagIds: prev.tagIds.filter(t => t !== id) }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'articles');
      const asset = await apiClient.upload<MediaAsset>('media', form);
      setFeaturedImage(asset);
      setFormData(prev => ({ ...prev, featuredImageId: asset.id }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(status: 'draft' | 'published') {
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      toast.error('Title, summary and body are required');
      return;
    }
    setSaving(status);
    try {
      const created = await apiClient.post<{ id: string }>('articles', {
        title: formData.title,
        slug: formData.slug || undefined,
        summary: formData.summary,
        content: formData.content,
        status: status === 'published' ? 'PUBLISHED' : 'DRAFT',
        categoryId: formData.categoryId || undefined,
        authorId: formData.authorId || undefined,
        tagIds: formData.tagIds.length ? formData.tagIds : undefined,
        featuredImageId: formData.featuredImageId || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      });
      toast.success(status === 'published' ? 'Article published' : 'Draft saved');
      onNavigate(`admin/news/edit/${created.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save article');
    } finally {
      setSaving(null);
    }
  }

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
        <AdminHeader title="Create News Article" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex gap-3 justify-end">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving !== null}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving !== null}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Publish
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Article Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Derived from title when left blank"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief summary of the article..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Article Body *</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your article content here..."
                    rows={15}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="SEO optimized title..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                        placeholder="Meta description for search engines..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={tagQuery}
                      onChange={e => setTagQuery(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                    />
                    {tagQuery && tagSuggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {tagSuggestions.map(t => (
                          <button
                            key={t.id}
                            onClick={() => addTag(t.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                          >
                            <Tag className="w-3 h-3" />
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs"
                      >
                        {tag.name}
                        <button onClick={() => removeTag(tag.id)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Hero Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                  {featuredImage ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredImage.url}
                        alt={featuredImage.altText ?? ''}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setFeaturedImage(null);
                          setFormData(prev => ({ ...prev, featuredImageId: '' }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Author</label>
                  <select
                    value={formData.authorId}
                    onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select author...</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
