'use client';

import { Zap, TrendingUp, Award, Target, Trophy, Flame } from 'lucide-react';
import { useXP } from '../contexts/XPContext';

interface XPWidgetProps {
  variant?: 'compact' | 'full';
  showDetails?: boolean;
}

export function XPWidget({ variant = 'compact', showDetails = true }: XPWidgetProps) {
  const { totalXP, level, currentLevelXP, xpToNextLevel, dailyStreak } = useXP();

  const progressPercentage = (currentLevelXP / xpToNextLevel) * 100;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/70 to-pink-100/70 dark:from-purple-950/30 dark:via-fuchsia-900/20 dark:to-pink-950/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl px-4 py-3 shadow-lg">
        {/* Level Badge */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{level}</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
            <Zap className="w-3 h-3 text-white" fill="white" />
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1 min-w-[140px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Level {level}
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {currentLevelXP}/{xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-white/50 dark:bg-gray-900/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Total XP */}
        <div className="text-center border-l border-white/30 dark:border-white/10 pl-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600">
            {totalXP.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-100/70 via-fuchsia-50/70 to-pink-100/70 dark:from-purple-950/30 dark:via-fuchsia-900/20 dark:to-pink-950/30 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Your Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Keep learning to level up!
          </p>
        </div>
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">{level}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Level {level} Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {currentLevelXP}/{xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-white/60 dark:bg-gray-900/50 rounded-full h-4 overflow-hidden backdrop-blur-sm shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full transition-all duration-1000 shadow-md"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {xpToNextLevel - currentLevelXP} XP until Level {level + 1}
        </p>
      </div>

      {showDetails && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {totalXP.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Level</p>
              <p className="font-bold text-gray-900 dark:text-white">{level}</p>
            </div>
          </div>

          {/* Next Level Card */}
          <div className="bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-purple-100/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{level + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  Next Level Unlocks
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  New achievements and rewards
                </p>
              </div>
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
