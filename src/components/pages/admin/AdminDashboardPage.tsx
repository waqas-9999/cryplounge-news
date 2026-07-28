'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  FileText, 
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CustomDatePicker } from '@/components/admin/CustomDatePicker';
import { QuickActionsPanel } from '@/components/admin/QuickActionsPanel';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { ContentPipeline } from '@/components/admin/ContentPipeline';
import { SystemAlerts } from '@/components/admin/SystemAlerts';
import { 
  getOverviewStats, 
  getContentPipeline, 
  getCategoryPerformance,
  getTopArticles,
  getTopCountries,
  getUserBreakdown,
  getTrafficSources,
  getContentHealth,
  getSystemAlerts,
  getRecentActivity,
  getEngagementDetails
} from '@/utils/dashboardData';
import { useState, useMemo } from 'react';

interface AdminDashboardPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboardPage({ currentPage, onNavigate, onLogout }: AdminDashboardPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('7days');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59'
  });

  const handleCustomDateApply = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    setCustomDateRange({ startDate, startTime, endDate, endTime });
    setDateFilter('custom');
  };

  const getDateRangeLabel = () => {
    if (dateFilter === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      const start = new Date(customDateRange.startDate);
      const end = new Date(customDateRange.endDate);
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return 'Custom';
  };

  // Get data from utility functions with proper date filtering
  const customStart = customDateRange.startDate ? new Date(customDateRange.startDate) : undefined;
  const customEnd = customDateRange.endDate ? new Date(customDateRange.endDate) : undefined;

  const overviewStats = useMemo(() => getOverviewStats(dateFilter, customStart, customEnd), [dateFilter, customStart, customEnd]);
  const contentPipeline = useMemo(() => getContentPipeline(), []);
  const categoryPerformance = useMemo(() => getCategoryPerformance(), []);
  const topArticles = useMemo(() => getTopArticles(10), []);
  const topCountries = useMemo(() => getTopCountries(), []);
  const userBreakdown = useMemo(() => getUserBreakdown(overviewStats.totalUsers), [overviewStats.totalUsers]);
  const trafficSources = useMemo(() => getTrafficSources(), []);
  const contentHealth = useMemo(() => getContentHealth(), []);
  const systemAlerts = useMemo(() => getSystemAlerts(), []);
  const recentActivity = useMemo(() => getRecentActivity(), []);
  const engagementDetails = useMemo(() => getEngagementDetails(), []);

  const stats = [
    {
      label: 'Total Page Views',
      value: overviewStats.totalViews.toLocaleString(),
      change: `${overviewStats.viewsChange}%`,
      trend: overviewStats.viewsTrend,
      icon: Eye,
      color: 'yellow'
    },
    {
      label: 'Active Users',
      value: overviewStats.totalUsers.toLocaleString(),
      change: `${overviewStats.usersChange}%`,
      trend: overviewStats.usersTrend,
      icon: Users,
      color: 'green'
    },
    {
      label: 'Total Content',
      value: overviewStats.totalContent.toString(),
      change: `${overviewStats.contentChange}%`,
      trend: overviewStats.contentTrend,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Engagement Rate',
      value: `${overviewStats.engagementRate}%`,
      change: `${overviewStats.engagementChange}%`,
      trend: overviewStats.engagementTrend,
      icon: MousePointer,
      color: 'purple'
    }
  ];

  const userStats = [
    { label: 'Desktop Users', value: userBreakdown.desktop.toLocaleString(), icon: Monitor },
    { label: 'Mobile Users', value: userBreakdown.mobile.toLocaleString(), icon: Smartphone },
    { label: 'Dark Mode', value: `${Math.round((userBreakdown.darkMode / overviewStats.totalUsers) * 100)}%`, icon: Moon },
    { label: 'Light Mode', value: `${Math.round((userBreakdown.lightMode / overviewStats.totalUsers) * 100)}%`, icon: Sun }
  ];

  const handleQuickAction = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'create-article': 'admin/news/create',
      'create-event': 'admin/events/create',
      'create-tutorial': 'admin/learn/create',
      'manage-users': 'admin/users',
    };
    if (actionMap[action]) {
      onNavigate(actionMap[action]);
    }
  };

  const handleAlertClick = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'moderation-queue': 'admin/news/moderation',
      'referral-system': 'admin/referral-system',
      'scheduled-posts': 'admin/news',
    };
    if (actionMap[action]) {
      onNavigate(actionMap[action]);
    }
  };

  const handleActivityClick = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'news-list': 'admin/news',
      'events-list': 'admin/events',
      'learn-list': 'admin/learn',
    };
    if (actionMap[action]) {
      onNavigate(actionMap[action]);
    }
  };

  const handleArticleClick = (articleId: string) => {
    onNavigate(`admin/news/edit/${articleId}`);
  };

  const handleCategoryClick = (category: string) => {
    onNavigate('admin/news');
  };

  const handleMetricCardClick = (section: string) => {
    const sectionMap: { [key: string]: string } = {
      learn: 'admin/learn',
      events: 'admin/events',
      xp: 'admin/xp-system',
      referrals: 'admin/referral-system',
    };
    if (sectionMap[section]) {
      onNavigate(sectionMap[section]);
    }
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
          title="Dashboard"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Date Filter */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Time Range:</span>
            <div className="flex flex-wrap gap-2">
              {['Today', '7days', '30days', 'custom'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    if (filter === 'custom') {
                      setShowCustomPicker(true);
                    } else {
                      setDateFilter(filter);
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    dateFilter === filter
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter === 'Today' ? 'Today' : filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : getDateRangeLabel()}
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

          {/* System Alerts */}
          {systemAlerts.length > 0 && (
            <div className="mb-6">
              <SystemAlerts alerts={systemAlerts} onAlertClick={handleAlertClick} />
            </div>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs md:text-sm ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
                    <span className="hidden sm:inline">{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Engagement Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Comments</span>
              </div>
              <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100">{engagementDetails.comments.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Shares</span>
              </div>
              <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100">{engagementDetails.shares.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Avg Time</span>
              </div>
              <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100">{engagementDetails.avgTimeOnSite}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Bounce</span>
              </div>
              <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100">{engagementDetails.bounceRate}</p>
            </div>
          </div>

          {/* Quick Actions & Content Pipeline Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <QuickActionsPanel onAction={handleQuickAction} />
            <div className="lg:col-span-2">
              <ContentPipeline 
                published={contentPipeline.published}
                pending={contentPipeline.pending}
                scheduled={contentPipeline.scheduled}
                drafts={contentPipeline.drafts}
                total={contentPipeline.total}
              />
            </div>
          </div>

          {/* Traffic Sources & Content Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Traffic Sources */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {trafficSources.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{source.source}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.visitors.toLocaleString()}</span>
                        <span className={`text-xs flex items-center gap-1 ${
                          source.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {source.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {source.change}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Health */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Content Quality</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Quality Score</span>
                  <span className="text-xl text-gray-900 dark:text-gray-100">{contentHealth.avgQuality}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Excellent (90+)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Good (75-89)</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{contentHealth.distribution.good}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Fair (60-74)</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{contentHealth.distribution.fair}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Poor (&lt;60)</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{contentHealth.distribution.poor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance & Top Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Category Performance */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">News Category Performance</h3>
              <div className="space-y-3 md:space-y-4">
                {categoryPerformance.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    aria-label={`View ${cat.name} category details - ${cat.articles} articles with ${cat.views.toLocaleString()} views`}
                    className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{cat.views.toLocaleString()} views</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{cat.articles} articles</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                        style={{ width: `${cat.engagement}%` }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Top Countries</h3>
              <div className="space-y-3 md:space-y-4">
                {topCountries.map((country) => (
                  <div key={country.name} className="flex items-center gap-3 md:gap-4">
                    <span className="text-xl md:text-2xl">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">{country.name}</span>
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{country.users.toLocaleString()} ({country.percentage}%)</span>
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
          </div>

          {/* Top Articles & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Top Articles */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Top Performing Articles</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Title</th>
                        <th className="text-right py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Views</th>
                        <th className="text-right py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">CTR</th>
                        <th className="text-right py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topArticles.map((article) => (
                        <tr 
                          key={article.id} 
                          onClick={() => handleArticleClick(article.id)}
                          className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          role="button"
                          tabIndex={0}
                          aria-label={`View article: ${article.title}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleArticleClick(article.id);
                            }
                          }}
                        >
                          <td className="py-3 px-4 text-xs md:text-sm text-gray-700 dark:text-gray-300 max-w-[200px] md:max-w-none truncate">{article.title}</td>
                          <td className="py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">{article.views.toLocaleString()}</td>
                          <td className="py-3 px-4 text-xs md:text-sm text-green-600 dark:text-green-400 text-right whitespace-nowrap">{article.ctr}%</td>
                          <td className="py-3 px-4 text-xs md:text-sm text-blue-600 dark:text-blue-400 text-right whitespace-nowrap">{article.engagement.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={recentActivity} onActivityClick={handleActivityClick} />
          </div>

          {/* User Breakdown */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4 md:mb-6">User Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {userStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{stat.value}</p>
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