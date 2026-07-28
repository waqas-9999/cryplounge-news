'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  FileDown, 
  Download, 
  FileText, 
  Newspaper,
  TrendingUp,
  Database,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { DataExportService, ExportFormat } from '@/utils/dataExport';
import { toast } from 'sonner';

interface ReportsExportPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type ReportType = 
  | 'news-all' 
  | 'news-single' 
  | 'analytics-global';

export function ReportsExportPage({ currentPage, onNavigate, onLogout }: ReportsExportPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');

  const handleExport = async (reportType: ReportType) => {
    setIsExporting(true);

    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (reportType) {
        case 'news-all':
          // Get all news from mock data
          const allNews = JSON.parse(localStorage.getItem('news_articles') || '[]');
          DataExportService.exportNews(allNews, selectedFormat);
          toast.success('All news articles exported successfully!');
          break;

        case 'news-single':
          if (!selectedItemId) {
            toast.error('Please enter an Article ID');
            return;
          }
          const newsArticles = JSON.parse(localStorage.getItem('news_articles') || '[]');
          const singleNews = newsArticles.filter((n: any) => n.id === selectedItemId);
          DataExportService.exportNews(singleNews, selectedFormat);
          toast.success('News article exported successfully!');
          break;

        case 'analytics-global':
          // Generate comprehensive analytics report
          const analyticsData = generateGlobalAnalytics();
          DataExportService.exportData(analyticsData, {
            filename: `global-analytics-${DataExportService.getTimestamp()}`,
            format: selectedFormat
          });
          toast.success('Global analytics exported successfully!');
          break;

        default:
          toast.error('Unknown report type');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const generateGlobalAnalytics = () => {
    // Gather all analytics data
    const news = JSON.parse(localStorage.getItem('news_articles') || '[]');

    return [{
      'Report Type': 'Global Analytics',
      'Generated At': new Date().toLocaleString(),
      'Total News Articles': news.length,
      'Published Articles': news.filter((n: any) => n.status === 'published').length,
      'Draft Articles': news.filter((n: any) => n.status === 'draft').length,
      'Finance Articles': news.filter((n: any) => n.category === 'Finance').length,
      'Technology Articles': news.filter((n: any) => n.category === 'Technology').length,
      'Geopolitics Articles': news.filter((n: any) => n.category === 'Geopolitics').length,
      'Business Articles': news.filter((n: any) => n.category === 'Business').length,
      'Total Views': news.reduce((sum: number, n: any) => sum + (n.views || 0), 0),
    }];
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
          title="Reports & Data Export"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-[#FFD200] to-[#F1EFA5] rounded-xl shadow-lg">
                <FileDown className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white">Reports & Data Export</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download comprehensive reports in Excel, CSV, or JSON format</p>
              </div>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md mb-6">
            <h3 className="text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#FFD200]" />
              <span>Export Format</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedFormat('xlsx')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  selectedFormat === 'xlsx'
                    ? 'bg-gradient-to-r from-[#FFD200] to-[#F1EFA5] border-[#FFD200] text-black'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#FFD200]'
                }`}
              >
                {selectedFormat === 'xlsx' && <CheckCircle2 className="w-4 h-4" />}
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm">Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  selectedFormat === 'csv'
                    ? 'bg-gradient-to-r from-[#FFD200] to-[#F1EFA5] border-[#FFD200] text-black'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#FFD200]'
                }`}
              >
                {selectedFormat === 'csv' && <CheckCircle2 className="w-4 h-4" />}
                <FileText className="w-4 h-4" />
                <span className="text-sm">CSV (.csv)</span>
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  selectedFormat === 'json'
                    ? 'bg-gradient-to-r from-[#FFD200] to-[#F1EFA5] border-[#FFD200] text-black'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#FFD200]'
                }`}
              >
                {selectedFormat === 'json' && <CheckCircle2 className="w-4 h-4" />}
                <Database className="w-4 h-4" />
                <span className="text-sm">JSON (.json)</span>
              </button>
            </div>
          </div>

          {/* Quick Export Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* News Reports */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg text-gray-900 dark:text-white">News Article Reports</h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('news-all')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all border border-gray-200 dark:border-gray-800 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="text-sm text-gray-900 dark:text-gray-100">All News Articles</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Complete article database with analytics</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#FFD200]" />
                </button>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Single Article Report</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      placeholder="Enter Article ID"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#FFD200]"
                    />
                    <button
                      onClick={() => handleExport('news-single')}
                      disabled={isExporting || !selectedItemId}
                      className="px-4 py-2 bg-gradient-to-r from-[#FFD200] to-[#F1EFA5] hover:from-[#F1EFA5] hover:to-[#FFD200] text-black rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-gradient-to-br from-[#FFD200]/10 to-[#F1EFA5]/10 dark:from-[#FFD200]/5 dark:to-[#F1EFA5]/5 rounded-xl border border-[#FFD200]/20 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-[#FFD200] to-[#F1EFA5] rounded-lg">
                  <TrendingUp className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 dark:text-white">Global Analytics Report</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive platform analytics and statistics</p>
                </div>
              </div>
              
              <button
                onClick={() => handleExport('analytics-global')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#FFD200] to-[#F1EFA5] hover:from-[#F1EFA5] hover:to-[#FFD200] text-black rounded-lg shadow-md shadow-[#FFD200]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Global Analytics Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Export Information</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  All reports include article metadata, analytics data, categories, and publication status. 
                  Select your preferred format above and click the download button to export.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
