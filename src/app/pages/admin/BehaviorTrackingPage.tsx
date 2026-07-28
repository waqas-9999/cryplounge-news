import { useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Activity, MousePointer, Eye, Clock, FileText, TrendingUp } from 'lucide-react';

interface BehaviorTrackingPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function BehaviorTrackingPage({ currentPage, onNavigate, onLogout }: BehaviorTrackingPageProps) {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedSection, setSelectedSection] = useState('all');

  const behaviorStats = [
    {
      label: 'Page Views',
      value: '145,234',
      change: '+12.3%',
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Unique Visitors',
      value: '42,567',
      change: '+8.7%',
      icon: Users,
      color: 'green'
    },
    {
      label: 'Avg. Time on Site',
      value: '6m 45s',
      change: '+15.2%',
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Bounce Rate',
      value: '32.4%',
      change: '-4.2%',
      icon: Activity,
      color: 'purple'
    }
  ];

  const topPages = [
    { page: 'Home', views: 45234, avgTime: '5m 23s', bounceRate: '28%' },
    { page: 'News / Bitcoin Price Surge', views: 38567, avgTime: '8m 12s', bounceRate: '22%' },
    { page: 'Learn / DeFi Basics', views: 32145, avgTime: '12m 45s', bounceRate: '18%' },
    { page: 'Market / Trending Tokens', views: 28934, avgTime: '6m 34s', bounceRate: '31%' },
    { page: 'Events / Web3 Summit', views: 24567, avgTime: '7m 21s', bounceRate: '25%' }
  ];

  const userJourney = [
    { step: 'Landing Page', users: 10000, dropoff: 0 },
    { step: 'Browse Content', users: 8500, dropoff: 15 },
    { step: 'Read Article', users: 6800, dropoff: 20 },
    { step: 'Signup Prompt', users: 5100, dropoff: 25 },
    { step: 'Account Created', users: 3400, dropoff: 33 },
    { step: 'First Interaction', users: 2720, dropoff: 20 }
  ];

  const contentEngagement = [
    { category: 'News', reads: 156789, shares: 8934, comments: 2341, avgReadTime: '4m 23s' },
    { category: 'Learn', reads: 98456, shares: 5432, comments: 1876, avgReadTime: '9m 12s' },
    { category: 'Market', reads: 87234, shares: 4321, comments: 987, avgReadTime: '3m 45s' },
    { category: 'Events', reads: 54321, shares: 2987, comments: 1234, avgReadTime: '5m 34s' },
    { category: 'Founders', reads: 43210, shares: 2156, comments: 876, avgReadTime: '7m 21s' }
  ];

  const clickHeatmap = [
    { element: 'Main Navigation', clicks: 45678 },
    { element: 'Featured Articles', clicks: 38934 },
    { element: 'Trending Section', clicks: 32145 },
    { element: 'Learn CTA', clicks: 28567 },
    { element: 'Market Data', clicks: 24321 },
    { element: 'Footer Links', clicks: 18934 }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="Behavior Tracking" 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Filters */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-1">User Behavior Tracking</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyze user interactions and engagement patterns</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
              >
                <option value="all">All Sections</option>
                <option value="news">News</option>
                <option value="learn">Learn</option>
                <option value="market">Market</option>
                <option value="events">Events</option>
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Behavior Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {behaviorStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Pages */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#EFB81A]" />
                <h3 className="text-lg text-gray-900 dark:text-gray-100">Top Pages</h3>
              </div>
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-[#0F0F10] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{page.page}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{page.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>⏱️ {page.avgTime}</span>
                      <span>📊 {page.bounceRate} bounce</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Journey */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-[#EFB81A]" />
                <h3 className="text-lg text-gray-900 dark:text-gray-100">User Journey Funnel</h3>
              </div>
              <div className="space-y-3">
                {userJourney.map((step, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{step.step}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {step.users.toLocaleString()} users
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#EFB81A] h-2 rounded-full transition-all"
                        style={{ width: `${(step.users / 10000) * 100}%` }}
                      ></div>
                      {step.dropoff > 0 && (
                        <span className="absolute -right-12 top-0 text-xs text-red-600 dark:text-red-400">
                          -{step.dropoff}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Engagement */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-[#EFB81A]" />
              <h3 className="text-lg text-gray-900 dark:text-gray-100">Content Engagement by Category</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Category</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Reads</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Shares</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Comments</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Avg. Read Time</th>
                  </tr>
                </thead>
                <tbody>
                  {contentEngagement.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{item.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{item.reads.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{item.shares.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{item.comments.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{item.avgReadTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Click Heatmap */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MousePointer className="w-5 h-5 text-[#EFB81A]" />
              <h3 className="text-lg text-gray-900 dark:text-gray-100">Click Heatmap</h3>
            </div>
            <div className="space-y-3">
              {clickHeatmap.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{item.element}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.clicks.toLocaleString()} clicks</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] h-2 rounded-full transition-all"
                      style={{ width: `${(item.clicks / 50000) * 100}%` }}
                    ></div>
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

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
