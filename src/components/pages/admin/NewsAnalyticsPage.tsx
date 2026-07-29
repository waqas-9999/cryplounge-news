'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CustomDatePicker } from '@/components/admin/CustomDatePicker';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Clock,
  Users,
  Share2,
  Heart,
  MessageCircle,
  BarChart3
} from 'lucide-react';

interface NewsAnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsAnalyticsPage({ currentPage, onNavigate, onLogout }: NewsAnalyticsPageProps) {
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

  const overallStats = [
    {
      label: 'Total Views',
      value: '2.4M',
      change: '+18.2%',
      trend: 'up',
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Avg. Read Time',
      value: '4.2 min',
      change: '+0.5 min',
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    {
      label: 'Engagement Rate',
      value: '68%',
      change: '+5.2%',
      trend: 'up',
      icon: MousePointer,
      color: 'yellow'
    },
    {
      label: 'Share Rate',
      value: '12.8%',
      change: '-2.1%',
      trend: 'down',
      icon: Share2,
      color: 'purple'
    }
  ];

  const categoryPerformance = [
    { category: 'Market', views: 456789, engagement: 72, avgTime: '4.5 min', ctr: 8.9 },
    { category: 'Technology', views: 398234, engagement: 68, avgTime: '4.2 min', ctr: 7.8 },
    { category: 'Policy', views: 345123, engagement: 75, avgTime: '5.1 min', ctr: 9.2 },
    { category: 'Business', views: 312456, engagement: 70, avgTime: '4.7 min', ctr: 8.1 }
  ];

  const topArticles = [
    {
      title: 'Central Banks Accelerate Digital Currency Development',
      category: 'Market',
      views: 45678,
      engagement: 89,
      avgTime: '6.2 min',
      shares: 1234,
      comments: 89
    },
    {
      title: 'AI Integration in Blockchain Networks',
      category: 'Technology',
      views: 38942,
      engagement: 85,
      avgTime: '7.1 min',
      shares: 982,
      comments: 67
    },
    {
      title: 'G20 Summit Addresses Crypto Regulation Framework',
      category: 'Policy',
      views: 34521,
      engagement: 91,
      avgTime: '8.4 min',
      shares: 1456,
      comments: 112
    },
    {
      title: 'Fortune 500 Companies Adopt Blockchain Solutions',
      category: 'Business',
      views: 29876,
      engagement: 78,
      avgTime: '5.3 min',
      shares: 743,
      comments: 45
    },
    {
      title: 'Institutional Investment in Digital Assets Reaches New High',
      category: 'Market',
      views: 27654,
      engagement: 82,
      avgTime: '6.8 min',
      shares: 891,
      comments: 58
    }
  ];

  const deviceBreakdown = [
    { device: 'Mobile', percentage: 64, users: 156789 },
    { device: 'Desktop', percentage: 28, users: 68456 },
    { device: 'Tablet', percentage: 8, users: 19543 }
  ];

  const topCountries = [
    { country: 'United States', flag: '🇺🇸', views: 456789, percentage: 32 },
    { country: 'United Kingdom', flag: '🇬🇧', views: 289345, percentage: 20 },
    { country: 'Germany', flag: '🇩🇪', views: 198234, percentage: 14 },
    { country: 'Canada', flag: '🇨🇦', views: 145678, percentage: 10 },
    { country: 'Australia', flag: '🇦🇺', views: 112456, percentage: 8 }
  ];

  const engagementMetrics = [
    { metric: 'Scroll Depth', value: '78%', description: 'Avg. page scroll' },
    { metric: 'Bounce Rate', value: '32%', description: 'Single page visits' },
    { metric: 'Return Visitors', value: '45%', description: 'Returning users' },
    { metric: 'Avg. Session', value: '12.4 min', description: 'Time on site' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="News Analytics" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Date Filter */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
            <div className="flex gap-2">
              {['Today', '7days', '30days', '90days', 'custom'].map((filter) => (
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
                  {filter === 'Today' ? 'Today' : filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : filter === '90days' ? 'Last 90 Days' : getDateRangeLabel()}
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

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overallStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Category Performance</h3>
              <div className="space-y-4">
                {categoryPerformance.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>{cat.views.toLocaleString()} views</span>
                        <span>{cat.avgTime}</span>
                        <span className="text-green-600 dark:text-green-400">{cat.ctr}% CTR</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                        style={{ width: `${cat.engagement}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-6">Device Breakdown</h3>
              <div className="space-y-6">
                {deviceBreakdown.map((item) => (
                  <div key={item.device}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.device}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.users.toLocaleString()}</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-4">
                {engagementMetrics.map((metric) => (
                  <div key={metric.metric}>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{metric.value}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{metric.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Articles Table */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100">Top Performing Articles</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Views</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Engagement</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Avg. Time</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shares</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {topArticles.map((article, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => onNavigate(`admin/news/analytics/${idx + 1}`)}
                      className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 hover:text-yellow-600 dark:hover:text-yellow-400">
                        {article.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                          {article.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                          article.engagement >= 85 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {article.engagement}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {article.avgTime}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {article.shares}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {article.comments}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-gray-100 mb-6">Geographic Distribution</h3>
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
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}