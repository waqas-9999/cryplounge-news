'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Calendar, MapPin, User, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { API_ORIGIN, apiClient, errorMessage } from '@/lib/api-client';

interface SubmitEventPageProps {
  onNavigate: (page: string) => void;
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
  url: string;
}

function absoluteUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all';

export function SubmitEventPage({ onNavigate }: SubmitEventPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    content: '',
    startsAt: '',
    endsAt: '',
    mode: 'OFFLINE' as 'OFFLINE' | 'ONLINE' | 'HYBRID',
    venue: '',
    city: '',
    country: '',
    onlineUrl: '',
    registerUrl: '',
    telegramChannel: '',
    isFree: true,
    ticketPrice: '',
    categoryId: '',
    organizerId: '',
    bannerImageId: '',
    submittedByName: '',
    submittedByEmail: '',
  });

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

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const asset = await apiClient.upload<MediaAsset>('events/submit/banner', form, { auth: false });
      setBannerImage(asset);
      setFormData(prev => ({ ...prev, bannerImageId: asset.id }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.summary ||
      !formData.content ||
      !formData.startsAt ||
      !formData.submittedByName ||
      !formData.submittedByEmail
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.mode !== 'ONLINE' && (!formData.city || !formData.venue)) {
      toast.error('Please provide a venue and city for in-person events');
      return;
    }

    if (formData.mode !== 'OFFLINE' && !formData.onlineUrl) {
      toast.error('Please provide an online link for virtual events');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        'events/submit',
        {
          name: formData.name,
          summary: formData.summary,
          content: formData.content,
          startsAt: new Date(formData.startsAt).toISOString(),
          endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
          mode: formData.mode,
          venue: formData.venue || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          onlineUrl: formData.onlineUrl || undefined,
          registerUrl: formData.registerUrl || undefined,
          telegramChannel: formData.telegramChannel || undefined,
          isFree: formData.isFree,
          ticketPrice: formData.isFree ? undefined : formData.ticketPrice || undefined,
          categoryId: formData.categoryId || undefined,
          organizerId: formData.organizerId || undefined,
          bannerImageId: formData.bannerImageId || undefined,
          submittedByName: formData.submittedByName,
          submittedByEmail: formData.submittedByEmail,
        },
        { auth: false }
      );
      toast.success("Your event has been submitted! Our team will review it shortly.");
      onNavigate('events');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to submit event'));
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
              <BreadcrumbLink onClick={() => onNavigate('events')} className="cursor-pointer">Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Submit Your Event</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <button
          onClick={() => onNavigate('events')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors"
          aria-label="Go back to Events"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div>
          <div className="inline-block px-4 py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-3">
            <span className="text-black dark:text-[#EFB81A] text-sm">SUBMIT YOUR EVENT</span>
          </div>
          <h1 className="text-gray-800 dark:text-gray-100 mb-3">Host Your Event on CrypLounge</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            List your blockchain or crypto event and reach thousands of potential attendees. Our
            team reviews every submission before it goes live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8">
            <label className="block mb-4">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Event Banner
              </span>

              {!bannerImage ? (
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
                <div className="relative w-full">
                  <img
                    src={absoluteUrl(bannerImage.url)}
                    alt="Banner preview"
                    className="w-full h-auto max-h-96 object-contain rounded-2xl border-4 border-[#EFB81A] bg-gray-50 dark:bg-black/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerImage(null);
                      setFormData(prev => ({ ...prev, bannerImageId: '' }));
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove banner image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EFB81A]" />
              Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ETH Global Summit" className={inputClass} required />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Short Summary <span className="text-red-500">*</span>
                </label>
                <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="A brief description of your event (1-2 sentences)" rows={2} maxLength={300} className={`${inputClass} resize-none`} required />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Full Description & Agenda <span className="text-red-500">*</span>
                </label>
                <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Describe your event, agenda, speakers, and what attendees can expect..." rows={6} className={`${inputClass} resize-none`} required />
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
                  Organizer
                </label>
                <select name="organizerId" value={formData.organizerId} onChange={handleChange} className={inputClass}>
                  <option value="">Self (you or your team)</option>
                  {organizers.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Format <span className="text-red-500">*</span>
                </label>
                <select name="mode" value={formData.mode} onChange={handleChange} className={inputClass}>
                  <option value="OFFLINE">In-person</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Starts <span className="text-red-500">*</span>
                </label>
                <input type="datetime-local" name="startsAt" value={formData.startsAt} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Ends
                </label>
                <input type="datetime-local" name="endsAt" value={formData.endsAt} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#EFB81A]" />
              Location & Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.mode !== 'ONLINE' && (
                <>
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Convention Center" className={inputClass} />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Dubai" className={inputClass} />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="UAE" className={inputClass} />
                  </div>
                </>
              )}

              {formData.mode !== 'OFFLINE' && (
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Online Link <span className="text-red-500">*</span>
                  </label>
                  <input type="url" name="onlineUrl" value={formData.onlineUrl} onChange={handleChange} placeholder="https://zoom.us/..." className={inputClass} />
                </div>
              )}

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Registration Link
                </label>
                <input type="url" name="registerUrl" value={formData.registerUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Telegram Channel
                </label>
                <input type="url" name="telegramChannel" value={formData.telegramChannel} onChange={handleChange} placeholder="https://t.me/..." className={inputClass} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4 accent-[#EFB81A]" />
                <label htmlFor="isFree" className="text-gray-700 dark:text-gray-300">This event is free to attend</label>
              </div>

              {!formData.isFree && (
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Ticket Price
                  </label>
                  <input type="text" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} placeholder="$50 or 0.05 ETH" className={inputClass} />
                </div>
              )}
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
              onClick={() => onNavigate('events')}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit your event"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Event
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
              Once approved, your event will appear on the CrypLounge Events page
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
