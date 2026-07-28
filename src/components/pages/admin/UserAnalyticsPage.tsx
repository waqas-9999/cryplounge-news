'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Users, TrendingUp, UserPlus, UserMinus, Clock, Eye } from 'lucide-react';

interface UserAnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function UserAnalyticsPage({ currentPage, onNavigate, onLogout }: UserAnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState('7days');

  const stats = [
    {
      label: 'Total Users',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Users (30d)',
      value: '8,234',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'New Signups',
      value: '1,234',
      change: '+15.3%',
      trend: 'up',
      icon: UserPlus,
      color: 'yellow'
    },
    {
      label: 'Churn Rate',
      value: '2.4%',
      change: '-0.5%',
      trend: 'down',
      icon: UserMinus,
      color: 'red'
    },
    {
      label: 'Avg. Session Time',
      value: '8m 32s',
      change: '+1.2%',
      trend: 'up',
      icon: Clock,
      color: 'purple'
    },
    {
      label: 'Daily Active Users',
      value: '4,567',
      change: '+6.8%',
      trend: 'up',
      icon: Eye,
      color: 'indigo'
    }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 8500 },
    { month: 'Feb', users: 9200 },
    { month: 'Mar', users: 9800 },
    { month: 'Apr', users: 10500 },
    { month: 'May', users: 11200 },
    { month: 'Jun', users: 12543 }
  ];

  const topCountries = [
    { country: 'United States', users: 4521, percentage: 36 },
    { country: 'United Kingdom', users: 2134, percentage: 17 },
    { country: 'Canada', users: 1876, percentage: 15 },
    { country: 'Germany', users: 1543, percentage: 12 },
    { country: 'Australia', users: 1234, percentage: 10 },
    { country: 'Others', users: 1235, percentage: 10 }
  ];

  const userSegments = [
    { segment: 'Free Users', count: 8234, percentage: 65.6 },
    { segment: 'Premium Users', count: 3456, percentage: 27.5 },
    { segment: 'Enterprise', count: 853, percentage: 6.9 }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          title="User Analytics" 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Time Range Filter */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-1">User Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor user growth and engagement metrics</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Growth Chart */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-4">User Growth</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {userGrowthData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[#EFB81A] rounded-t-lg transition-all hover:bg-[#d9a617]" 
                         style={{ height: `${(data.users / 13000) * 100}%` }}>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Segments */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-4">User Segments</h3>
              <div className="space-y-4">
                {userSegments.map((segment, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{segment.segment}</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{segment.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#EFB81A] h-2 rounded-full transition-all"
                        style={{ width: `${segment.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Top Countries</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Country</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Users</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Percentage</th>
                    <th className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {topCountries.map((country, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{country.country}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{country.users.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 text-right">{country.percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-[#EFB81A] h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
