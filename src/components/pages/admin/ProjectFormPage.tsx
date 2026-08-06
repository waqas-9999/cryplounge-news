'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SlugField } from '@/components/admin/SlugField';
import { apiClient, errorMessage } from '@/lib/api-client';
import { slugify } from '@/lib/slug';
import { toast } from 'sonner';
import { Save, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProjectFormPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  /** Present when editing an existing project; absent when creating one. */
  projectId?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface MediaAsset {
  id: string;
  url: string;
  altText: string | null;
}

interface BackendProjectDetail {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  about: string;
  keyFeatures: string[];
  categoryId: string | null;
  blockchain: string;
  supportedNetworks: string[];
  nativeToken: string | null;
  launchYear: number | null;
  status: 'PENDING' | 'LIVE' | 'BETA' | 'TESTNET' | 'DEPRECATED';
  verified: boolean;
  openSource: boolean;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  logo: string;
  accent: string;
  logoImage: MediaAsset | null;
  coverImage: MediaAsset | null;
  website: string | null;
  x: string | null;
  github: string | null;
  discord: string | null;
  telegram: string | null;
  linkedin: string | null;
  youtube: string | null;
  medium: string | null;
  blog: string | null;
  docs: string | null;
  whitepaper: string | null;
  explorer: string | null;
  api: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400';

const emptyForm = {
  name: '',
  slug: '',
  tagline: '',
  about: '',
  keyFeatures: '',
  categoryId: '',
  blockchain: '',
  supportedNetworks: '',
  nativeToken: '',
  launchYear: '',
  status: 'LIVE' as BackendProjectDetail['status'],
  verified: false,
  openSource: false,
  featured: false,
  trending: false,
  editorsPick: false,
  logo: '',
  accent: '#EFB81A',
  logoImageId: '',
  coverImageId: '',
  website: '',
  x: '',
  github: '',
  discord: '',
  telegram: '',
  linkedin: '',
  youtube: '',
  medium: '',
  blog: '',
  docs: '',
  whitepaper: '',
  explorer: '',
  api: '',
  seoTitle: '',
  seoDescription: '',
};

export function ProjectFormPage({ currentPage, onNavigate, onLogout, projectId }: ProjectFormPageProps) {
  const isEdit = Boolean(projectId);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(isEdit ? 'loading' : 'ready');
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logoImage, setLogoImage] = useState<MediaAsset | null>(null);
  const [coverImage, setCoverImage] = useState<MediaAsset | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slugTouched) return;
    setFormData(prev => ({ ...prev, slug: slugify(prev.name) }));
  }, [formData.name, slugTouched]);

  useEffect(() => {
    apiClient
      .get<Category[]>('taxonomy/categories', { query: { kind: 'PROJECT' } })
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    apiClient
      .get<BackendProjectDetail>(`projects/${projectId}`)
      .then(project => {
        setFormData({
          name: project.name,
          slug: project.slug,
          tagline: project.tagline,
          about: project.about,
          keyFeatures: project.keyFeatures.join(', '),
          categoryId: project.categoryId ?? '',
          blockchain: project.blockchain,
          supportedNetworks: project.supportedNetworks.join(', '),
          nativeToken: project.nativeToken ?? '',
          launchYear: project.launchYear ? String(project.launchYear) : '',
          status: project.status,
          verified: project.verified,
          openSource: project.openSource,
          featured: project.featured,
          trending: project.trending,
          editorsPick: project.editorsPick,
          logo: project.logo,
          accent: project.accent,
          logoImageId: project.logoImage?.id ?? '',
          coverImageId: project.coverImage?.id ?? '',
          website: project.website ?? '',
          x: project.x ?? '',
          github: project.github ?? '',
          discord: project.discord ?? '',
          telegram: project.telegram ?? '',
          linkedin: project.linkedin ?? '',
          youtube: project.youtube ?? '',
          medium: project.medium ?? '',
          blog: project.blog ?? '',
          docs: project.docs ?? '',
          whitepaper: project.whitepaper ?? '',
          explorer: project.explorer ?? '',
          api: project.api ?? '',
          seoTitle: project.seoTitle ?? '',
          seoDescription: project.seoDescription ?? '',
        });
        setLogoImage(project.logoImage);
        setCoverImage(project.coverImage);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [projectId]);

  async function handleUpload(
    file: File,
    field: 'logoImageId' | 'coverImageId',
    setAsset: (asset: MediaAsset | null) => void,
    setUploading: (value: boolean) => void
  ) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'projects');
      const asset = await apiClient.upload<MediaAsset>('media', form);
      setAsset(asset);
      setFormData(prev => ({ ...prev, [field]: asset.id }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.tagline.trim() || !formData.about.trim()) {
      toast.error('Name, tagline and about are required');
      return;
    }
    if (!formData.blockchain.trim()) {
      toast.error('Primary blockchain is required');
      return;
    }
    if (!formData.logo.trim()) {
      toast.error('A logo mark (emoji) is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        tagline: formData.tagline,
        about: formData.about,
        keyFeatures: formData.keyFeatures.split(',').map(v => v.trim()).filter(Boolean),
        categoryId: formData.categoryId || undefined,
        blockchain: formData.blockchain,
        supportedNetworks: formData.supportedNetworks.split(',').map(v => v.trim()).filter(Boolean),
        nativeToken: formData.nativeToken || undefined,
        launchYear: formData.launchYear ? Number(formData.launchYear) : undefined,
        status: formData.status,
        verified: formData.verified,
        openSource: formData.openSource,
        featured: formData.featured,
        trending: formData.trending,
        editorsPick: formData.editorsPick,
        logo: formData.logo,
        accent: formData.accent || undefined,
        logoImageId: formData.logoImageId || undefined,
        coverImageId: formData.coverImageId || undefined,
        website: formData.website || undefined,
        x: formData.x || undefined,
        github: formData.github || undefined,
        discord: formData.discord || undefined,
        telegram: formData.telegram || undefined,
        linkedin: formData.linkedin || undefined,
        youtube: formData.youtube || undefined,
        medium: formData.medium || undefined,
        blog: formData.blog || undefined,
        docs: formData.docs || undefined,
        whitepaper: formData.whitepaper || undefined,
        explorer: formData.explorer || undefined,
        api: formData.api || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      };

      if (isEdit) {
        await apiClient.patch(`projects/${projectId}`, payload);
        toast.success('Project updated');
      } else {
        const created = await apiClient.post<{ id: string; slug: string }>('projects', payload);
        if (formData.slug && created.slug !== formData.slug) {
          toast.info(`"${formData.slug}" was already in use — saved as "${created.slug}"`);
        }
        toast.success('Project created');
        onNavigate(`admin/projects/edit/${created.id}`);
        return;
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save project'));
    } finally {
      setSaving(false);
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
        Couldn&apos;t load this project.
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
        <AdminHeader title={isEdit ? 'Edit Project' : 'Create Project'} onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex gap-3 justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Uniswap"
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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Tagline *</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="One line shown on cards"
                    maxLength={200}
                    className={inputClass}
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">About *</label>
                  <textarea
                    value={formData.about}
                    onChange={e => setFormData({ ...formData, about: e.target.value })}
                    placeholder="What the project does and who it's for..."
                    rows={8}
                    className={`${inputClass} font-mono text-sm`}
                  />
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Chain & Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Primary Blockchain *</label>
                      <input
                        type="text"
                        value={formData.blockchain}
                        onChange={e => setFormData({ ...formData, blockchain: e.target.value })}
                        placeholder="ethereum"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Native Token</label>
                      <input
                        type="text"
                        value={formData.nativeToken}
                        onChange={e => setFormData({ ...formData, nativeToken: e.target.value })}
                        placeholder="UNI"
                        maxLength={20}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Supported Networks</label>
                      <input
                        type="text"
                        value={formData.supportedNetworks}
                        onChange={e => setFormData({ ...formData, supportedNetworks: e.target.value })}
                        placeholder="ethereum, base, arbitrum"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Comma separated</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Key Features</label>
                      <input
                        type="text"
                        value={formData.keyFeatures}
                        onChange={e => setFormData({ ...formData, keyFeatures: e.target.value })}
                        placeholder="Concentrated liquidity, Permissionless listing"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Comma separated</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Launch Year</label>
                      <input
                        type="number"
                        value={formData.launchYear}
                        onChange={e => setFormData({ ...formData, launchYear: e.target.value })}
                        min={2008}
                        max={2100}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as BackendProjectDetail['status'] })}
                        className={inputClass}
                      >
                        {formData.status === 'PENDING' && <option value="PENDING">Pending Review</option>}
                        <option value="LIVE">Live</option>
                        <option value="BETA">Beta</option>
                        <option value="TESTNET">Testnet</option>
                        <option value="DEPRECATED">Deprecated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      ['website', 'Website'],
                      ['x', 'X (Twitter)'],
                      ['github', 'GitHub'],
                      ['discord', 'Discord'],
                      ['telegram', 'Telegram'],
                      ['linkedin', 'LinkedIn'],
                      ['youtube', 'YouTube'],
                      ['medium', 'Medium'],
                      ['blog', 'Blog'],
                      ['docs', 'Docs'],
                      ['whitepaper', 'Whitepaper'],
                      ['explorer', 'Explorer'],
                      ['api', 'API'],
                    ] as const).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                        <input
                          type="text"
                          value={formData[field]}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    ))}
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
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                        rows={2}
                        maxLength={400}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">Homepage Placement</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      Featured Projects
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.trending}
                        onChange={e => setFormData({ ...formData, trending: e.target.checked })}
                      />
                      Trending Projects
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.editorsPick}
                        onChange={e => setFormData({ ...formData, editorsPick: e.target.checked })}
                      />
                      Editor&apos;s Picks
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={e => setFormData({ ...formData, verified: e.target.checked })}
                      />
                      Verified (official project)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.openSource}
                        onChange={e => setFormData({ ...formData, openSource: e.target.checked })}
                      />
                      Open Source
                    </label>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className={inputClass}
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Logo Mark *</label>
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="🦄"
                        maxLength={8}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Accent Colour</label>
                      <input
                        type="color"
                        value={formData.accent}
                        onChange={e => setFormData({ ...formData, accent: e.target.value })}
                        className="w-full h-[42px] px-2 py-1 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Logo Image</label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'logoImageId', setLogoImage, setUploadingLogo);
                    }}
                    className="hidden"
                  />
                  {logoImage ? (
                    <div className="relative w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoImage.url}
                        alt={logoImage.altText ?? ''}
                        className="w-24 h-24 object-contain rounded-lg bg-gray-50 dark:bg-black/40"
                      />
                      <button
                        onClick={() => {
                          setLogoImage(null);
                          setFormData(prev => ({ ...prev, logoImageId: '' }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-xs flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'coverImageId', setCoverImage, setUploadingCover);
                    }}
                    className="hidden"
                  />
                  {coverImage ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage.url}
                        alt={coverImage.altText ?? ''}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setCoverImage(null);
                          setFormData(prev => ({ ...prev, coverImageId: '' }));
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
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
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
