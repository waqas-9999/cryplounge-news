'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Layers, Link2, User, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { API_ORIGIN, apiClient, errorMessage } from '@/lib/api-client';

interface SubmitProjectPageProps {
  onNavigate: (page: string) => void;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface MediaAsset {
  id: string;
  url: string;
}

function absoluteUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all';

export function SubmitProjectPage({ onNavigate }: SubmitProjectPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoImage, setLogoImage] = useState<MediaAsset | null>(null);
  const [coverImage, setCoverImage] = useState<MediaAsset | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    about: '',
    categoryId: '',
    blockchain: '',
    supportedNetworks: '',
    nativeToken: '',
    launchYear: '',
    logo: '',
    website: '',
    x: '',
    github: '',
    discord: '',
    telegram: '',
    logoImageId: '',
    coverImageId: '',
    submittedByName: '',
    submittedByEmail: '',
  });

  useEffect(() => {
    apiClient
      .get<Category[]>('taxonomy/categories', { query: { kind: 'PROJECT' }, auth: false })
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleUpload(
    file: File,
    field: 'logoImageId' | 'coverImageId',
    endpoint: 'submit/logo' | 'submit/cover',
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
      const asset = await apiClient.upload<MediaAsset>(`projects/${endpoint}`, form, { auth: false });
      setAsset(asset);
      setFormData(prev => ({ ...prev, [field]: asset.id }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.tagline ||
      !formData.about ||
      !formData.blockchain ||
      !formData.logo ||
      !formData.submittedByName ||
      !formData.submittedByEmail
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        'projects/submit',
        {
          name: formData.name,
          tagline: formData.tagline,
          about: formData.about,
          categoryId: formData.categoryId || undefined,
          blockchain: formData.blockchain,
          supportedNetworks: formData.supportedNetworks
            ? formData.supportedNetworks.split(',').map(v => v.trim()).filter(Boolean)
            : undefined,
          nativeToken: formData.nativeToken || undefined,
          launchYear: formData.launchYear ? Number(formData.launchYear) : undefined,
          logo: formData.logo,
          website: formData.website || undefined,
          x: formData.x || undefined,
          github: formData.github || undefined,
          discord: formData.discord || undefined,
          telegram: formData.telegram || undefined,
          logoImageId: formData.logoImageId || undefined,
          coverImageId: formData.coverImageId || undefined,
          submittedByName: formData.submittedByName,
          submittedByEmail: formData.submittedByEmail,
        },
        { auth: false }
      );
      toast.success('Your project has been submitted! Our team will review it shortly.');
      onNavigate('ecosystem');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to submit project'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('ecosystem')} className="cursor-pointer">Ecosystem</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Submit Your Project</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <button
          onClick={() => onNavigate('ecosystem')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors"
          aria-label="Go back to Ecosystem"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ecosystem
        </button>

        <div>
          <div className="inline-block px-4 py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-3">
            <span className="text-black dark:text-[#EFB81A] text-sm">SUBMIT YOUR PROJECT</span>
          </div>
          <h1 className="text-gray-800 dark:text-gray-100 mb-3">List Your Project in the Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Get your protocol, application or infrastructure listed on the CrypLounge Ecosystem
            directory. Our team reviews every submission before it goes live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 space-y-8">
            <label className="block">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Logo Image
              </span>

              {!logoImage ? (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full flex flex-col items-center justify-center py-10 cursor-pointer hover:border-[#EFB81A] transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-10 h-10 text-[#EFB81A] mb-3 animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                  </p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'logoImageId', 'submit/logo', setLogoImage, setUploadingLogo);
                    }}
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative w-40">
                  <img
                    src={absoluteUrl(logoImage.url)}
                    alt="Logo preview"
                    className="w-40 h-40 object-contain rounded-2xl border-4 border-[#EFB81A] bg-gray-50 dark:bg-black/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoImage(null);
                      setFormData(prev => ({ ...prev, logoImageId: '' }));
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove logo image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>

            <label className="block">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Cover Image (optional)
              </span>

              {!coverImage ? (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="w-full flex flex-col items-center justify-center py-10 cursor-pointer hover:border-[#EFB81A] transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50"
                >
                  {uploadingCover ? (
                    <Loader2 className="w-10 h-10 text-[#EFB81A] mb-3 animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {uploadingCover ? 'Uploading...' : 'Click to upload cover'}
                  </p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'coverImageId', 'submit/cover', setCoverImage, setUploadingCover);
                    }}
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative w-full">
                  <img
                    src={absoluteUrl(coverImage.url)}
                    alt="Cover preview"
                    className="w-full h-auto max-h-72 object-contain rounded-2xl border-4 border-[#EFB81A] bg-gray-50 dark:bg-black/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setFormData(prev => ({ ...prev, coverImageId: '' }));
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove cover image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#EFB81A]" />
              Project Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Uniswap" className={inputClass} required />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Logo Mark (emoji) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="🦄" maxLength={8} className={inputClass} required />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Tagline <span className="text-red-500">*</span>
                </label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="A one-line description shown on cards" maxLength={200} className={inputClass} required />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  About <span className="text-red-500">*</span>
                </label>
                <textarea name="about" value={formData.about} onChange={handleChange} placeholder="What does the project do, and who is it for?" rows={6} className={`${inputClass} resize-none`} required />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={inputClass}>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Primary Blockchain <span className="text-red-500">*</span>
                </label>
                <input type="text" name="blockchain" value={formData.blockchain} onChange={handleChange} placeholder="ethereum" className={inputClass} required />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Supported Networks
                </label>
                <input type="text" name="supportedNetworks" value={formData.supportedNetworks} onChange={handleChange} placeholder="ethereum, base, arbitrum" className={inputClass} />
                <p className="mt-1 text-xs text-gray-400">Comma-separated</p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Native Token
                </label>
                <input type="text" name="nativeToken" value={formData.nativeToken} onChange={handleChange} placeholder="UNI" maxLength={20} className={inputClass} />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Launch Year
                </label>
                <input type="number" name="launchYear" value={formData.launchYear} onChange={handleChange} placeholder="2020" min={2008} max={2100} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#EFB81A]" />
              Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">X (Twitter)</label>
                <input type="url" name="x" value={formData.x} onChange={handleChange} placeholder="https://x.com/..." className={inputClass} />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">GitHub</label>
                <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." className={inputClass} />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Discord</label>
                <input type="url" name="discord" value={formData.discord} onChange={handleChange} placeholder="https://discord.gg/..." className={inputClass} />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Telegram</label>
                <input type="url" name="telegram" value={formData.telegram} onChange={handleChange} placeholder="https://t.me/..." className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#EFB81A]" />
              Your Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="submittedByName" value={formData.submittedByName} onChange={handleChange} placeholder="Satoshi Nakamoto" className={inputClass} required />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input type="email" name="submittedByEmail" value={formData.submittedByEmail} onChange={handleChange} placeholder="you@example.com" className={inputClass} required />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => onNavigate('ecosystem')}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit your project"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Project
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-[#F9D96A] dark:bg-[#EFB81A]/10 border border-[#EFB81A]/30 rounded-xl p-6">
          <h4 className="text-black dark:text-[#EFB81A] mb-2">What happens next?</h4>
          <ul className="space-y-2 text-gray-800 dark:text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Our team will review your submission
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              We may reach out to your email for additional details
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Once approved, your project will appear in the CrypLounge Ecosystem directory
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
