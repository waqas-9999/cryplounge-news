'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ContentToolbar } from '@/components/admin/ContentToolbar';
import { SlugField } from '@/components/admin/SlugField';
import { errorMessage } from '@/lib/api-client';
import { slugify } from '@/lib/slug';
import { createPage, getAdminPage, updatePage } from '@/services/pages';
import { toast } from 'sonner';
import { Save, Sparkles, Loader2 } from 'lucide-react';

interface LegalPageFormPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  /** Present when editing an existing page; absent when creating one. */
  pageId?: string;
}

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400';

export function LegalPageFormPage({ currentPage, onNavigate, onLogout, pageId }: LegalPageFormPageProps) {
  const isEditing = Boolean(pageId);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    if (slugTouched) return;
    setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
  }, [formData.title, slugTouched]);

  useEffect(() => {
    if (!pageId) return;
    getAdminPage(pageId)
      .then(page => {
        setFormData({
          title: page.title,
          slug: page.slug,
          content: page.content,
          seoTitle: page.seoTitle ?? '',
          seoDescription: page.seoDescription ?? '',
        });
      })
      .catch(err => toast.error(errorMessage(err, 'Failed to load page')))
      .finally(() => setLoading(false));
  }, [pageId]);

  async function handleSave(status: 'draft' | 'published') {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(status);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        content: formData.content,
        status: status === 'published' ? ('PUBLISHED' as const) : ('DRAFT' as const),
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      };

      if (isEditing && pageId) {
        await updatePage(pageId, payload);
        toast.success(status === 'published' ? 'Page published' : 'Draft saved');
      } else {
        const created = await createPage(payload);
        toast.success(status === 'published' ? 'Page published' : 'Draft saved');
        onNavigate(`admin/pages/edit/${created.id}`);
        return;
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save page'));
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0F0F10]">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
      </div>
    );
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
        <AdminHeader
          title={isEditing ? 'Edit Page' : 'Create Page'}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
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

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Terms of Service"
                  className={inputClass}
                />
              </div>

              <SlugField
                value={formData.slug}
                onChange={(next, touched) => {
                  setFormData(prev => ({ ...prev, slug: next }));
                  if (touched) setSlugTouched(true);
                }}
              />

              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Content *</label>
                <ContentToolbar
                  textareaRef={contentRef}
                  value={formData.content}
                  onChange={content => setFormData(prev => ({ ...prev, content }))}
                />
                <textarea
                  ref={contentRef}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the page content here..."
                  rows={20}
                  className={`${inputClass} font-mono text-sm`}
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
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Meta description for search engines..."
                      rows={2}
                      maxLength={400}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.seoDescription.length}/400
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
