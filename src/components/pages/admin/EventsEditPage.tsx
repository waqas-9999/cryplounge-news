'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SlugField } from '@/components/admin/SlugField';
import { ContentToolbar } from '@/components/admin/ContentToolbar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import { Save, Upload, X, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

interface EventsEditPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  eventId: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Organizer {
  id: string;
  name: string;
}

interface MediaAsset {
  id: string;
  path: string;
  url: string;
  altText: string | null;
}

interface BackendEventDetail {
  id: string;
  name: string;
  slug: string;
  summary: string;
  content: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  mode: 'OFFLINE' | 'ONLINE' | 'HYBRID';
  venue: string | null;
  city: string | null;
  country: string | null;
  onlineUrl: string | null;
  registerUrl: string | null;
  telegramChannel: string | null;
  language: string | null;
  isFree: boolean;
  ticketPrice: string | null;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  category: { id: string } | null;
  organizer: { id: string } | null;
  bannerImage: MediaAsset | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventsEditPage({ currentPage, onNavigate, onLogout, eventId }: EventsEditPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    summary: '',
    content: '',
    startsAt: '',
    endsAt: '',
    timezone: 'UTC',
    mode: 'OFFLINE' as 'OFFLINE' | 'ONLINE' | 'HYBRID',
    venue: '',
    city: '',
    country: '',
    onlineUrl: '',
    registerUrl: '',
    telegramChannel: '',
    language: '',
    isFree: true,
    ticketPrice: '',
    categoryId: '',
    organizerId: '',
    bannerImageId: '',
    seoTitle: '',
    seoDescription: '',
    status: 'DRAFT' as BackendEventDetail['status'],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [bannerImage, setBannerImage] = useState<MediaAsset | null>(null);
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    apiClient
      .get<Category[]>('taxonomy/categories', { query: { kind: 'EVENT' }, auth: false })
      .then(setCategories)
      .catch(() => setCategories([]));
    apiClient
      .getPaginated<Organizer>('organizers', { query: { perPage: 100 }, auth: false })
      .then(({ items }) => setOrganizers(items))
      .catch(() => setOrganizers([]));
  }, []);

  useEffect(() => {
    apiClient
      .get<BackendEventDetail>(`events/${eventId}`)
      .then(event => {
        setFormData({
          name: event.name,
          slug: event.slug,
          summary: event.summary,
          content: event.content,
          startsAt: toLocalInput(event.startsAt),
          endsAt: toLocalInput(event.endsAt),
          timezone: event.timezone || 'UTC',
          mode: event.mode,
          venue: event.venue ?? '',
          city: event.city ?? '',
          country: event.country ?? '',
          onlineUrl: event.onlineUrl ?? '',
          registerUrl: event.registerUrl ?? '',
          telegramChannel: event.telegramChannel ?? '',
          language: event.language ?? '',
          isFree: event.isFree,
          ticketPrice: event.ticketPrice ?? '',
          categoryId: event.category?.id ?? '',
          organizerId: event.organizer?.id ?? '',
          bannerImageId: event.bannerImage?.id ?? '',
          seoTitle: event.seoTitle ?? '',
          seoDescription: event.seoDescription ?? '',
          status: event.status,
        });
        setBannerImage(event.bannerImage);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [eventId]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'events');
      const asset = await apiClient.upload<MediaAsset>('media', form);
      setBannerImage(asset);
      setFormData(prev => ({ ...prev, bannerImageId: asset.id }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(status: 'draft' | 'published') {
    setSaving(status);
    try {
      await apiClient.patch(`events/${eventId}`, {
        name: formData.name,
        slug: formData.slug || undefined,
        summary: formData.summary,
        content: formData.content,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        timezone: formData.timezone || undefined,
        mode: formData.mode,
        venue: formData.venue || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        onlineUrl: formData.onlineUrl || undefined,
        registerUrl: formData.registerUrl || undefined,
        telegramChannel: formData.telegramChannel || undefined,
        language: formData.language || undefined,
        isFree: formData.isFree,
        ticketPrice: formData.isFree ? undefined : formData.ticketPrice || undefined,
        status: status === 'published' ? 'PUBLISHED' : 'DRAFT',
        categoryId: formData.categoryId || undefined,
        organizerId: formData.organizerId || undefined,
        bannerImageId: formData.bannerImageId || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      });
      toast.success(status === 'published' ? 'Event published' : 'Draft saved');
      onNavigate('admin/events');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save event'));
    } finally {
      setSaving(null);
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
        Couldn&apos;t load this event.
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
        <AdminHeader title="Edit Event" onMenuClick={() => setIsMobileSidebarOpen(true)} />

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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Event Name *</label>
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

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description & Agenda *</label>
                  <ContentToolbar
                    textareaRef={contentRef}
                    value={formData.content}
                    onChange={content => setFormData(prev => ({ ...prev, content }))}
                  />
                  <textarea
                    ref={contentRef}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Date, Time & Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Starts At *</label>
                      <input
                        type="datetime-local"
                        value={formData.startsAt}
                        onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Ends At</label>
                      <input
                        type="datetime-local"
                        value={formData.endsAt}
                        onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                      <input
                        type="text"
                        value={formData.timezone}
                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Mode</label>
                      <select
                        value={formData.mode}
                        onChange={e => setFormData({ ...formData, mode: e.target.value as typeof formData.mode })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="OFFLINE">In-person</option>
                        <option value="ONLINE">Online</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    </div>
                    {formData.mode !== 'ONLINE' && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Venue</label>
                          <input
                            type="text"
                            value={formData.venue}
                            onChange={e => setFormData({ ...formData, venue: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">City</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={e => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Country</label>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={e => setFormData({ ...formData, country: e.target.value })}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {formData.mode !== 'OFFLINE' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Online URL</label>
                        <input
                          type="text"
                          value={formData.onlineUrl}
                          onChange={e => setFormData({ ...formData, onlineUrl: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Registration URL</label>
                      <input
                        type="text"
                        value={formData.registerUrl}
                        onChange={e => setFormData({ ...formData, registerUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Telegram Channel</label>
                      <input
                        type="text"
                        value={formData.telegramChannel}
                        onChange={e => setFormData({ ...formData, telegramChannel: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Language</label>
                      <input
                        type="text"
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Organizer</label>
                  <select
                    value={formData.organizerId}
                    onChange={e => setFormData({ ...formData, organizerId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select organizer...</option>
                    {organizers.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Ticket</label>
                  <label className="flex items-center gap-2 mb-3 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={e => setFormData({ ...formData, isFree: e.target.checked })}
                    />
                    Free to attend
                  </label>
                  {!formData.isFree && (
                    <input
                      type="text"
                      value={formData.ticketPrice}
                      onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })}
                      placeholder="e.g. $50 or 0.05 ETH"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  )}
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
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
                  {bannerImage ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bannerImage.url}
                        alt={bannerImage.altText ?? ''}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setBannerImage(null);
                          setFormData(prev => ({ ...prev, bannerImageId: '' }));
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
