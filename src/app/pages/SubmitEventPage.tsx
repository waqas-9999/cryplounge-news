import { useState } from 'react';
import { ArrowLeft, Upload, X, Check, Calendar, MapPin, Globe, Image as ImageIcon, Users, DollarSign, Link as LinkIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';
import { toast } from 'sonner';

interface SubmitEventPageProps {
  onNavigate: (page: string) => void;
}

export function SubmitEventPage({ onNavigate }: SubmitEventPageProps) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    format: '',
    category: '',
    ecosystem: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: '',
    venue: '',
    city: '',
    country: '',
    virtualLink: '',
    description: '',
    shortDescription: '',
    agenda: '',
    speakers: '',
    organizer: '',
    organizerWebsite: '',
    organizerEmail: '',
    organizerTwitter: '',
    pricing: '',
    registrationLink: '',
    capacity: '',
    tags: '',
  });

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    'Conference', 'Workshop', 'Meetup', 'Hackathon', 'Webinar',
    'Summit', 'Demo Day', 'Networking', 'Launch Event', 'AMA'
  ];

  const formats = ['In-Person', 'Virtual', 'Hybrid'];

  const categories = [
    'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer 1', 'Layer 2',
    'DEX', 'Protocol', 'DAO', 'Metaverse', 'AI', 'DePIN', 'RWA', 'Trading'
  ];

  const ecosystems = [
    'Ethereum', 'Solana', 'Polygon', 'BNB Chain', 'Avalanche',
    'Bitcoin', 'Cosmos', 'Polkadot', 'Arbitrum', 'Optimism', 
    'Multi-Chain', 'Other'
  ];

  const timezones = [
    'UTC', 'EST (UTC-5)', 'PST (UTC-8)', 'GMT (UTC+0)', 
    'CET (UTC+1)', 'IST (UTC+5:30)', 'JST (UTC+9)', 'AEST (UTC+10)'
  ];

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Banner size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerPreview(null);
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
    if (!formData.eventName || !formData.eventType || !formData.format || !formData.startDate || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!bannerPreview) {
      toast.error('Please upload an event banner');
      return;
    }

    if (formData.format !== 'Virtual' && (!formData.city || !formData.country)) {
      toast.error('Please provide location details for in-person/hybrid events');
      return;
    }

    if (formData.format !== 'In-Person' && !formData.virtualLink) {
      toast.error('Please provide a virtual event link for virtual/hybrid events');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your event has been submitted successfully! Our team will review it shortly.');
      onNavigate('events');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Breadcrumb */}
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
              <BreadcrumbPage>Submit Event</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('events')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors"
          aria-label="Go back to events"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        {/* Header */}
        <div>
          <div className="inline-block px-4 py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-3">
            <span className="text-black dark:text-[#EFB81A] text-sm">SUBMIT YOUR EVENT</span>
          </div>
          <h1 className="text-gray-800 dark:text-gray-100 mb-3">List Your Event on CrypLounge</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Reach thousands of blockchain enthusiasts, developers, and investors. Fill out the form below to list your event.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Banner */}
          <div className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8">
            <label className="block mb-4">
              <span className="text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#EFB81A]" />
                Event Banner <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Recommended size: 1920x1080px or 16:9 ratio</p>

              {!bannerPreview ? (
                <div className="flex flex-col items-center justify-center py-12 cursor-pointer hover:border-[#EFB81A] transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Event banner preview"
                    className="w-full h-auto rounded-xl border-4 border-[#EFB81A]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </label>
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EFB81A]" />
              Event Details
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="e.g., Ethereum DevCon 2025"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                    required
                  >
                    <option value="">Select Type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Format <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                    required
                  >
                    <option value="">Select Format</option>
                    {formats.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
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
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="A brief description of your event (1-2 sentences)"
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">{formData.shortDescription.length}/200 characters</p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about your event, what attendees can expect, key highlights..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EFB81A]" />
              Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                >
                  <option value="">Select Timezone</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#EFB81A]" />
              Location
            </h3>

            <div className="space-y-6">
              {formData.format !== 'Virtual' && (
                <>
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">
                      Venue Name {formData.format !== 'Virtual' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="e.g., Convention Center, Hotel Ballroom"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                      required={formData.format !== 'Virtual'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-gray-700 dark:text-gray-300">
                        City {formData.format !== 'Virtual' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., San Francisco"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                        required={formData.format !== 'Virtual'}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700 dark:text-gray-300">
                        Country {formData.format !== 'Virtual' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="e.g., United States"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                        required={formData.format !== 'Virtual'}
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.format !== 'In-Person' && (
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Virtual Event Link {formData.format !== 'In-Person' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="url"
                    name="virtualLink"
                    value={formData.virtualLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                    required={formData.format !== 'In-Person'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#EFB81A]" />
              Additional Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Agenda / Schedule
                </label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  placeholder="Event schedule, sessions, workshops, etc."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Featured Speakers
                </label>
                <textarea
                  name="speakers"
                  value={formData.speakers}
                  onChange={handleInputChange}
                  placeholder="List keynote speakers, panelists, workshop leaders..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Expected Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Pricing
                  </label>
                  <input
                    type="text"
                    name="pricing"
                    value={formData.pricing}
                    onChange={handleInputChange}
                    placeholder="Free, $50, $100-$500, etc."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., blockchain, DeFi, networking, developers"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Organizer Information */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#EFB81A]" />
              Organizer Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Organizer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="Company or individual name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <input
                    type="url"
                    name="organizerWebsite"
                    value={formData.organizerWebsite}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                  Twitter/X Handle
                </label>
                <input
                  type="text"
                  name="organizerTwitter"
                  value={formData.organizerTwitter}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#EFB81A]" />
              Registration
            </h3>

            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Registration / Tickets Link
              </label>
              <input
                type="url"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleInputChange}
                placeholder="https://eventbrite.com/... or https://lu.ma/..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-gray-100 focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
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

        {/* Info Box */}
        <div className="bg-[#F9D96A] dark:bg-[#EFB81A]/10 border border-[#EFB81A]/30 rounded-xl p-6">
          <h4 className="text-black dark:text-[#EFB81A] mb-2">What happens next?</h4>
          <ul className="space-y-2 text-gray-800 dark:text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Our team will review your event submission within 24-48 hours
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              We may contact you for additional details or clarifications
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              Once approved, your event will be featured on CrypLounge Events
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              You'll receive a confirmation email with a link to your event page
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
