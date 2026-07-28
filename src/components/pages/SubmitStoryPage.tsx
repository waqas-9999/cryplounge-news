'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, X, Check, User, Briefcase, Globe, Image as ImageIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

interface SubmitStoryPageProps {
  onNavigate: (page: string) => void;
}

export function SubmitStoryPage({ onNavigate }: SubmitStoryPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: '',
    ecosystem: '',
    region: '',
    story: '',
    excerpt: '',
    website: '',
    twitter: '',
    linkedin: '',
    telegram: '',
    projects: '',
    achievements: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer 1', 'Layer 2',
    'DEX', 'Protocol', 'DAO', 'Metaverse', 'AI', 'DePIN', 'RWA'
  ];

  const ecosystems = [
    'Ethereum', 'Solana', 'Polygon', 'BNB Chain', 'Avalanche', 
    'Bitcoin', 'Cosmos', 'Polkadot', 'Arbitrum', 'Optimism'
  ];

  const regions = [
    'Global', 'North America', 'Europe', 'Asia', 'Latin America', 
    'Middle East', 'Africa', 'Oceania'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.role || !formData.category || !formData.story) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!photoPreview) {
      toast.error('Please upload your photo');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your story has been submitted successfully! Our team will review it shortly.');
      onNavigate('founders');
    }, 2000);
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
            Tell the community about your experience building in Web3. Your story could inspire the next generation of innovators.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8">
            <label className="block mb-4">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Profile Photo <span className="text-red-500">*</span>
              </span>
              
              {!photoPreview ? (
                <div className="flex flex-col items-center justify-center py-12 cursor-pointer hover:border-[#EFB81A] transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-2xl border-4 border-[#EFB81A]"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Primary Ecosystem
                </label>
                <select
                  name="ecosystem"
                  value={formData.ecosystem}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                >
                  <option value="">Select Ecosystem</option>
                  {ecosystems.map((eco) => (
                    <option key={eco} value={eco}>{eco}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Region
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
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
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
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
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">{formData.excerpt.length}/200 characters</p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Full Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  placeholder="Tell us about your journey, challenges, achievements, and vision for the future..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Projects & Companies
                </label>
                <textarea
                  name="projects"
                  value={formData.projects}
                  onChange={handleInputChange}
                  placeholder="List the projects or companies you've founded or contributed to..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Key Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  placeholder="Notable achievements, awards, or milestones..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
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
              We may reach out for additional information or photos
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
