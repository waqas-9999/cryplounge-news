'use client';

import { useState } from 'react';
import { Star, TrendingUp, Award, Calendar, RefreshCw, Sparkles } from 'lucide-react';

interface PromotionStatsProps {
  featuredCount: number;
  trendingCount: number;
  popularCount: number;
  bestWeekCount: number;
  bestMonthCount: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export function PromotionManagerWidget({ 
  featuredCount, 
  trendingCount, 
  popularCount, 
  bestWeekCount, 
  bestMonthCount,
  loading = false,
  onRefresh 
}: PromotionStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing || loading) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const stats = [
    {
      label: 'Featured',
      count: featuredCount,
      icon: Star,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Trending',
      count: trendingCount,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      label: 'Popular',
      count: popularCount,
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      label: 'Best Week',
      count: bestWeekCount,
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Best Month',
      count: bestMonthCount,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  const totalPromotions = featuredCount + trendingCount + popularCount + bestWeekCount + bestMonthCount;

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-1">Promotion Stats</h3>
          <p className="text-sm text-gray-600 dark:text-[#A0A0A5]">
            {totalPromotions} total promotions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh promotion stats"
          title="Refresh stats"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-[#A0A0A5] ${(isRefreshing || loading) ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-xl md:text-2xl text-gray-800 dark:text-[#F3F3F5] mb-1">
                  {stat.count}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-[#A0A0A5]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
