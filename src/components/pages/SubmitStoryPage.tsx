'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Upload, X, Check, User, Briefcase, Globe, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { API_ORIGIN, apiClient, errorMessage } from '@/lib/api-client';

interface SubmitStoryPageProps {
  onNavigate: (page: string) => void;
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

export function SubmitStoryPage({ onNavigate }: SubmitStoryPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    region: '',
    bio: '',
    excerpt: '',
    website: '',
    x: '',
    linkedin: '',
    github: '',
    submittedByName: '',
    submittedByEmail: '',
  });

  const [photo, setPhoto] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const regions = [
    'Global', 'North America', 'Europe', 'Asia', 'Latin America',
    'Middle East', 'Africa', 'Oceania'
  ];

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo size must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const asset = await apiClient.upload<MediaAsset>('founders/submit/photo', form, { auth: false });
      setPhoto(asset);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.role ||
      !formData.bio ||
      !formData.excerpt ||
      !formData.submittedByName ||
      !formData.submittedByEmail
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        'founders/submit',
        {
          name: formData.name,
          role: formData.role,
          company: formData.company || undefined,
          bio: formData.bio,
          excerpt: formData.excerpt,
          photoId: photo?.id || undefined,
          website: formData.website || undefined,
          x: formData.x || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          region: formData.region || undefined,
          submittedByName: formData.submittedByName,
          submittedByEmail: formData.submittedByEmail,
        },
        { auth: false }
      );
      toast.success('Your story has been submitted successfully! Our team will review it shortly.');
      onNavigate('founders');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to submit your story'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('founders')} className="cursor-pointer">Yellow Page</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Submit Your Story</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('founders')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors"
          aria-label="Go back to Yellow Page"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Yellow Page
        </button>

        {/* Header */}
        <div>
          <div className="inline-block px-4 py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-3">
            <span className="text-black dark:text-[#EFB81A] text-sm">SUBMIT YOUR STORY</span>
          </div>
          <h1 className="text-gray-800 dark:text-gray-100 mb-3">Share Your Journey</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Tell the community about your experience building in Web3. Your story could inspire the next generation of innovators. Our team reviews every submission before it goes live.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8">
            <label className="block mb-4">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Profile Photo
              </span>

              {!photo ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center py-12 cursor-pointer hover:border-[#EFB81A] transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-[#EFB81A] mb-4 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={absoluteUrl(photo.url)}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-2xl border-4 border-[#EFB81A]"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>
          </div>

          {/* Personal Information */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#EFB81A]" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Satoshi Nakamoto"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Role/Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Founder & CEO"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Project / Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="The project or company you built"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Region
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="">Select Region</option>
                  {regions.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#EFB81A]" />
              Social Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Twitter/X
                </label>
                <input
                  type="url"
                  name="x"
                  value={formData.x}
                  onChange={handleInputChange}
                  placeholder="https://x.com/username"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#EFB81A]" />
              Your Story
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Short Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="A brief summary of your journey (1-2 sentences)"
                  rows={2}
                  maxLength={600}
                  className={`${inputClass} resize-none`}
                  required
                />
                <p className="text-sm text-gray-400 mt-2">{formData.excerpt.length}/600 characters</p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Full Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about your journey, challenges, achievements, and vision for the future..."
                  rows={8}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
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
                <input
                  type="text"
                  name="submittedByName"
                  value={formData.submittedByName}
                  onChange={handleInputChange}
                  placeholder="Satoshi Nakamoto"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="submittedByEmail"
                  value={formData.submittedByEmail}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => onNavigate('founders')}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit your story"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Story
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-[#F9D96A] dark:bg-[#EFB81A]/10 border border-[#EFB81A]/30 rounded-xl p-6">
          <h4 className="text-black dark:text-[#EFB81A] mb-2">What happens next?</h4>
          <ul className="space-y-2 text-gray-800 dark:text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Our team will review your submission within 48 hours
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              We may reach out to your email for additional information or photos
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Once approved, your story will be featured on CrypLounge Yellow Page
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
