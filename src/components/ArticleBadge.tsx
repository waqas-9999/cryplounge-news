'use client';

import { TrendingUp, Star, Award, Calendar, Clock } from 'lucide-react';

interface ArticleBadgeProps {
  type: 'FEATURED' | 'TRENDING' | 'POPULAR' | 'BEST WEEK' | 'BEST MONTH' | 'LATEST';
  score?: number;
  className?: string; 
}
 
export function ArticleBadge({ type, score, className = '' }: ArticleBadgeProps) {
  const badges = {
    'FEATURED': {
      label: 'FEATURED',
      icon: Star,
      bgClass: 'bg-[#EFB81A]',
      textClass: 'text-black'
    },
    'TRENDING': {
      label: 'TRENDING',
      icon: TrendingUp,
      bgClass: 'bg-orange-500',
      textClass: 'text-white'
    },
    'POPULAR': {
      label: 'POPULAR',
      icon: Star,
      bgClass: 'bg-purple-500',
      textClass: 'text-white'
    },
    'BEST WEEK': {
      label: 'BEST OF WEEK',
      icon: Award,
      bgClass: 'bg-blue-500',
      textClass: 'text-white'
    },
    'BEST MONTH': {
      label: 'BEST OF MONTH',
      icon: Calendar,
      bgClass: 'bg-green-500',
      textClass: 'text-white'
    },
    'LATEST': {
      label: 'LATEST',
      icon: Clock,
      bgClass: 'bg-gray-500',
      textClass: 'text-white'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${badge.bgClass} ${badge.textClass} ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{badge.label}</span>
      {score !== undefined && score > 0 && (
        <span className="ml-1 opacity-90">• {score}</span>
      )}
    </div>
  );
}
