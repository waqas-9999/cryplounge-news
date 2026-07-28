'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CustomDatePicker } from '@/components/admin/CustomDatePicker';
import { 
  ArrowLeft,
  Eye, 
  Clock, 
  MousePointer,
  Share2,
  Heart,
  MessageCircle,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';

interface NewsDetailAnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  articleId?: string;
}

export function NewsDetailAnalyticsPage({ currentPage, onNavigate, onLogout, articleId }: NewsDetailAnalyticsPageProps) {
  const [dateRange, setDateRange] = useState('7days');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59'
  });

  const handleCustomDateApply = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    setCustomDateRange({ startDate, startTime, endDate, endTime });
    setDateRange('custom');
  };

  const getDateRangeLabel = () => {
    if (dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      const start = new Date(customDateRange.startDate);
      const end = new Date(customDateRange.endDate);
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return 'Custom';
  };

  // Article info
  const article = {
    title: 'Bitcoin ETF Approval Impact on Market Dynamics',
    slug: 'bitcoin-etf-approval-impact',
    category: 'Bitcoin',
    author: 'AI',
    publishedDate: '2024-11-13',
    publishedTime: '14:30',
    status: 'published',
    url: '/news/bitcoin/bitcoin-etf-approval-impact'
  };

  // Key metrics
  const keyMetrics = [
    {
      label: 'Total Views',
      value: '45,678',
      change: '+18.2%',
      trend: 'up',
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Avg. Read Time',
      value: '6.2 min',
      change: '+0.8 min',
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    {
      label: 'Engagement Rate',
      value: '89%',
      change: '+12.5%',
      trend: 'up',
      icon: MousePointer,
      color: 'yellow'
    },
    {
      label: 'Share Rate',
      value: '15.3%',
      change: '+3.2%',
      trend: 'up',
      icon: Share2,
      color: 'purple'
    }
  ];

  // Detailed stats
  const detailedStats = [
    { label: 'Unique Visitors', value: '38,942' },
    { label: 'Page Views', value: '45,678' },
    { label: 'Avg. Time on Page', value: '6m 12s' },
    { label: 'Bounce Rate', value: '28%' },
    { label: 'Total Shares', value: '1,234' },
    { label: 'Comments', value: '89' },
    { label: 'Saves/Bookmarks', value: '2,341' },
    { label: 'Click-through Rate', value: '8.9%' }
  ];

  // Traffic sources
  const trafficSources = [
    { source: 'Direct', visits: 18234, percentage: 40, color: 'bg-blue-500' },
    { source: 'Social Media', visits: 13701, percentage: 30, color: 'bg-purple-500' },
    { source: 'Search Engines', visits: 9135, percentage: 20, color: 'bg-green-500' },
    { source: 'Referral', visits: 4567, percentage: 10, color: 'bg-yellow-500' }
  ];

  // Device breakdown
  const deviceStats = [
    { device: 'Mobile', icon: Smartphone, visitors: 29234, percentage: 64 },
    { device: 'Desktop', icon: Monitor, visitors: 12802, percentage: 28 },
    { device: 'Tablet', icon: Smartphone, visitors: 3642, percentage: 8 }
  ];

  // Top countries
  const topCountries = [
    { country: 'United States', flag: '🇺🇸', views: 14567, percentage: 32 },
    { country: 'United Kingdom', flag: '🇬🇧', views: 9123, percentage: 20 },
    { country: 'Germany', flag: '🇩🇪', views: 6390, percentage: 14 },
    { country: 'Canada', flag: '🇨🇦', views: 4567, percentage: 10 },
    { country: 'Australia', flag: '🇦🇺', views: 3642, percentage: 8 }
  ];

  // Scroll depth analysis
  const scrollDepthData = [
    { depth: '0-25%', percentage: 100, readers: 45678 },
    { depth: '25-50%', percentage: 92, readers: 42023 },
    { depth: '50-75%', percentage: 78, readers: 35628 },
    { depth: '75-100%', percentage: 64, readers: 29234 }
  ];

  // Hourly traffic pattern
  const hourlyTraffic = [
    { hour: '00:00', views: 234 },
    { hour: '03:00', views: 156 },
    { hour: '06:00', views: 412 },
    { hour: '09:00', views: 1234 },
    { hour: '12:00', views: 2341 },
    { hour: '15:00', views: 3456 },
    { hour: '18:00', views: 4567 },
    { hour: '21:00', views: 2987 }
  ];

  // Reader engagement actions
  const engagementActions = [
    { action: 'Shares', count: 1234, breakdown: { Twitter: 543, Facebook: 321, LinkedIn: 234, Other: 136 } },
    { action: 'Comments', count: 89, breakdown: { Approved: 76, Pending: 8, Spam: 5 } },
    { action: 'Saves', count: 2341, breakdown: { Bookmarked: 1876, Added_to_List: 465 } },
    { action: 'Likes', count: 3456, breakdown: { Total: 3456 } }
  ];

  // Related articles clicked
  const relatedClicks = [
    { title: 'Ethereum 2.0 Staking Complete Guide', clicks: 234, ctr: 7.8 },
    { title: 'DeFi Security Best Practices 2024', clicks: 189, ctr: 6.3 },
    { title: 'NFT Market Recovery Analysis Q1', clicks: 156, ctr: 5.2 }
  ];

  // Exit pages
  const exitBehavior = [
    { behavior: 'Read to End', percentage: 64, count: 29234 },
    { behavior: 'Clicked Related Article', percentage: 18, count: 8221 },
    { behavior: 'Shared Article', percentage: 8, count: 3654 },
    { behavior: 'Early Exit', percentage: 10, count: 4567 }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Article Analytics" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Back Button & Article Info */}
          <div className="mb-6">
            <button
              onClick={() => onNavigate('admin/news/analytics')}
              className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analytics
            </button>

            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-2">{article.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {article.publishedDate} at {article.publishedTime}
                    </span>
                    <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {article.category}
                    </span>
                    <span className="inline-block px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                      {article.status}
                    </span>
                    <span>By {article.author}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate(`admin/news/edit/${articleId || '1'}`)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 text-sm"
                  >
                    Edit Article
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
            <div className="flex gap-2">
              {['Today', '7days', '30days', 'All Time', 'custom'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    if (filter === 'custom') {
                      setShowCustomPicker(true);
                    } else {
                      setDateRange(filter);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateRange === filter
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : filter === 'custom' ? getDateRangeLabel() : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker Modal */}
          <CustomDatePicker
            isOpen={showCustomPicker}
            onClose={() => setShowCustomPicker(false)}
            onApply={handleCustomDateApply}
            currentStart={customDateRange.startDate}
            currentEnd={customDateRange.endDate}
            currentStartTime={customDateRange.startTime}
            currentEndTime={customDateRange.endTime}
          />

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{metric.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {detailedStats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-xl text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Traffic & Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Traffic Sources */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {trafficSources.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{source.source}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.visits.toLocaleString()}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{source.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${source.color}`} style={{ width: `${source.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Device Distribution</h3>
              <div className="space-y-4">
                {deviceStats.map((device) => (
                  <div key={device.device}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <device.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{device.device}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{device.visitors.toLocaleString()}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{device.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${device.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic & Scroll Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Countries */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Top Countries</h3>
              <div className="space-y-4">
                {topCountries.map((country) => (
                  <div key={country.country} className="flex items-center gap-4">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{country.country}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{country.views.toLocaleString()}</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{country.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${country.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Depth */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Scroll Depth Analysis</h3>
              <div className="space-y-4">
                {scrollDepthData.map((item) => (
                  <div key={item.depth}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.depth}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.readers.toLocaleString()} readers</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-yellow-400" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>64%</strong> of readers completed the entire article
                </p>
              </div>
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
            <h3 className="text-gray-900 dark:text-gray-100 mb-6">Reader Engagement Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {engagementActions.map((item) => (
                <div key={item.action}>
                  <div className="flex items-center gap-2 mb-3">
                    {item.action === 'Shares' && <Share2 className="w-5 h-5 text-purple-500" />}
                    {item.action === 'Comments' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                    {item.action === 'Saves' && <Heart className="w-5 h-5 text-red-500" />}
                    {item.action === 'Likes' && <Heart className="w-5 h-5 text-pink-500" />}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.action}</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100 mb-3">{item.count.toLocaleString()}</p>
                  <div className="space-y-1">
                    {Object.entries(item.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{key.replace('_', ' ')}</span>
                        <span className="text-gray-900 dark:text-gray-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Articles & Exit Behavior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Related Articles Clicked */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Related Articles Clicked</h3>
              <div className="space-y-4">
                {relatedClicks.map((article, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{article.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{article.clicks} clicks</span>
                      <span className="text-green-600 dark:text-green-400">{article.ctr}% CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Behavior */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Exit Behavior</h3>
              <div className="space-y-4">
                {exitBehavior.map((item) => (
                  <div key={item.behavior}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.behavior}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Traffic Pattern */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-gray-100 mb-6">Hourly Traffic Pattern</h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {hourlyTraffic.map((hour) => {
                const maxViews = Math.max(...hourlyTraffic.map(h => h.views));
                const height = (hour.views / maxViews) * 100;
                return (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full group">
                      <div 
                        className="w-full bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      ></div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {hour.views.toLocaleString()} views
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{hour.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
