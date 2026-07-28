import { BookOpen, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useXP } from '../contexts/XPContext';

interface WelcomeLearnCardProps {
  userName?: string;
}

export function WelcomeLearnCard({ userName = 'Alex' }: WelcomeLearnCardProps) {
  const { level, totalXP } = useXP();

  return (
    <div className="relative bg-gradient-to-br from-indigo-100/70 via-purple-50/70 to-pink-100/70 dark:from-indigo-950/30 dark:via-purple-900/20 dark:to-pink-950/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-xl overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-pink-300/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* User Greeting */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{userName.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hello {userName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">{totalXP.toLocaleString()} XP</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Level {level}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Your Progress Today
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Unlock knowledge anytime, anywhere with expert-led lessons tailored for your personal growth.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Courses</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">85%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">2.5k</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">XP Earned</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-6 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 px-6 rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
