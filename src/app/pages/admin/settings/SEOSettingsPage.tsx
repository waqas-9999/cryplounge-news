import { useState } from 'react';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { Search, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SEOSettingsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function SEOSettingsPage({ currentPage, onNavigate, onLogout }: SEOSettingsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState('CrypLounge - Global Cryptocurrency News Platform');
  const [metaDescription, setMetaDescription] = useState('Stay updated with the latest cryptocurrency news covering finance, technology, geopolitics, and business.');
  const [metaKeywords, setMetaKeywords] = useState('cryptocurrency, crypto news, blockchain, digital currency, CBDC');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleSearchConsole, setGoogleSearchConsole] = useState('');
  const [facebookPixelId, setFacebookPixelId] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('SEO settings saved successfully!');
    }, 1000);
  };

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
          title="SEO Settings"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-6 h-6 text-[#EFB81A]" />
              <h1 className="text-2xl text-gray-900 dark:text-gray-100">SEO & Analytics</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Configure search engine optimization and analytics tracking</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Google Search Console
                  </label>
                  <input
                    type="text"
                    value={googleSearchConsole}
                    onChange={(e) => setGoogleSearchConsole(e.target.value)}
                    placeholder="Verification code"
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={facebookPixelId}
                    onChange={(e) => setFacebookPixelId(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}