'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SlugField } from '@/components/admin/SlugField';
import { ContentToolbar } from '@/components/admin/ContentToolbar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import { Save, Upload, X, Tag, Sparkles, Image as ImageIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FoundersEditPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  founderId: string;
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

interface BackendFounderDetail {
  id: string;
  name: string;
  slug: string;
  role: string;
  company: string | null;
  bio: string;
  excerpt: string;
  website: string | null;
  x: string | null;
  linkedin: string | null;
  github: string | null;
  region: string | null;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  photo: MediaAsset | null;
  tags: TagOption[];
  seoTitle: string | null;
  seoDescription: string | null;
  submittedByName?: string | null;
  submittedByEmail?: string | null;
}

export function FoundersEditPage({ currentPage, onNavigate, onLogout, founderId }: FoundersEditPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    role: '',
    company: '',
    bio: '',
    excerpt: '',
    website: '',
    x: '',
    linkedin: '',
    github: '',
    region: '',
    tagIds: [] as string[],
    photoId: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    status: 'DRAFT' as BackendFounderDetail['status'],
  });

  const [submission, setSubmission] = useState<{ name: string | null; email: string | null } | null>(null);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [photo, setPhoto] = useState<MediaAsset | null>(null);
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    apiClient
      .getPaginated<TagOption>('taxonomy/tags', { query: { perPage: 200 }, auth: false })
      .then(({ items }) => setTags(items))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    apiClient
      .get<BackendFounderDetail>(`founders/${founderId}`)
      .then(founder => {
        setFormData({
          name: founder.name,
          slug: founder.slug,
          role: founder.role,
          company: founder.company ?? '',
          bio: founder.bio,
          excerpt: founder.excerpt,
          website: founder.website ?? '',
          x: founder.x ?? '',
          linkedin: founder.linkedin ?? '',
          github: founder.github ?? '',
          region: founder.region ?? '',
          tagIds: founder.tags.map(t => t.id),
          photoId: founder.photo?.id ?? '',
          featured: founder.featured,
          seoTitle: founder.seoTitle ?? '',
          seoDescription: founder.seoDescription ?? '',
          status: founder.status,
        });
        setPhoto(founder.photo);
        if (founder.submittedByEmail || founder.submittedByName) {
          setSubmission({ name: founder.submittedByName ?? null, email: founder.submittedByEmail ?? null });
        }
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [founderId]);

  const selectedTags = tags.filter(t => formData.tagIds.includes(t.id));
  const tagSuggestions = tags
    .filter(t => !formData.tagIds.includes(t.id))
    .filter(t => t.name.toLowerCase().includes(tagQuery.toLowerCase()))
    .slice(0, 8);

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
      form.append('folder', 'founders');
      const asset = await apiClient.upload<MediaAsset>('media', form);
      setPhoto(asset);
      setFormData(prev => ({ ...prev, photoId: asset.id }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(status: 'draft' | 'published') {
    setSaving(status);
    try {
      await apiClient.patch(`founders/${founderId}`, {
        name: formData.name,
        slug: formData.slug || undefined,
        role: formData.role,
        company: formData.company || undefined,
        bio: formData.bio,
        excerpt: formData.excerpt,
        website: formData.website || undefined,
        x: formData.x || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        region: formData.region || undefined,
        status: status === 'published' ? 'PUBLISHED' : 'DRAFT',
        featured: formData.featured,
        photoId: formData.photoId || undefined,
        tagIds: formData.tagIds,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      });
      toast.success(status === 'published' ? 'Story published' : 'Draft saved');
      onNavigate('admin/founders');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save story'));
    } finally {
      setSaving(null);
    }
  }

  async function handleReject() {
    if (!window.confirm('Reject this submission? It will be moved back to Draft.')) return;
    try {
      await apiClient.patch(`founders/${founderId}`, { status: 'DRAFT' });
      toast.success('Story rejected');
      onNavigate('admin/founders');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to reject story'));
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0F0F10]">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0F0F10] text-sm text-gray-500 dark:text-gray-400">
        Couldn&apos;t load this story.
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
        <AdminHeader title="Edit Story" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {submission && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/40 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
                Submitted publicly by {submission.name || 'Anonymous'} ({submission.email || 'no email'}).
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-3 justify-end">
              {formData.status === 'REVIEW' && (
                <>
                  <button
                    onClick={() => handleSave('published')}
                    disabled={saving !== null}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Publish
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={saving !== null}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleSave('draft')}
                disabled={saving !== null}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save as Draft
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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Founder Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <SlugField
                  value={formData.slug}
                  onChange={next => setFormData(prev => ({ ...prev, slug: next }))}
                />

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Excerpt *</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    maxLength={600}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Full Biography *</label>
                  <ContentToolbar
                    textareaRef={bioRef}
                    value={formData.bio}
                    onChange={bio => setFormData(prev => ({ ...prev, bio }))}
                  />
                  <textarea
                    ref={bioRef}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Links & Region</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Website</label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">X (Twitter)</label>
                      <input
                        type="text"
                        value={formData.x}
                        onChange={e => setFormData({ ...formData, x: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">GitHub</label>
                      <input
                        type="text"
                        value={formData.github}
                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Region</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
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
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                        rows={2}
                        maxLength={400}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Feature this story
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Featured stories appear in the hero and highlights sections on the Yellow Page.
                  </p>
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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
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
                  {photo ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.altText ?? ''}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setPhoto(null);
                          setFormData(prev => ({ ...prev, photoId: '' }));
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
