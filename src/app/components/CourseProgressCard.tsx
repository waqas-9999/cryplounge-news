import { Star, Users, Clock, BookOpen, Zap, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Course } from '../data/learnData';

interface CourseProgressCardProps {
  course: Course;
  onClick?: () => void;
}

// Soft pastel color scheme matching the reference
const categoryColors = {
  'Blockchain Basics': {
    bg: 'from-blue-100/70 via-blue-50/70 to-cyan-50/70 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-cyan-950/20',
    accent: 'bg-blue-200/50 dark:bg-blue-800/30',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  'DeFi': {
    bg: 'from-green-100/70 via-emerald-50/70 to-teal-50/70 dark:from-green-950/30 dark:via-emerald-900/20 dark:to-teal-950/20',
    accent: 'bg-green-200/50 dark:bg-green-800/30',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
  },
  'NFTs': {
    bg: 'from-purple-100/70 via-fuchsia-50/70 to-pink-50/70 dark:from-purple-950/30 dark:via-fuchsia-900/20 dark:to-pink-950/20',
    accent: 'bg-purple-200/50 dark:bg-purple-800/30',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  'Trading': {
    bg: 'from-emerald-100/70 via-green-50/70 to-lime-50/70 dark:from-emerald-950/30 dark:via-green-900/20 dark:to-lime-950/20',
    accent: 'bg-emerald-200/50 dark:bg-emerald-800/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  'Smart Contracts': {
    bg: 'from-indigo-100/70 via-blue-50/70 to-violet-50/70 dark:from-indigo-950/30 dark:via-blue-900/20 dark:to-violet-950/20',
    accent: 'bg-indigo-200/50 dark:bg-indigo-800/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  'Security': {
    bg: 'from-red-100/70 via-rose-50/70 to-pink-50/70 dark:from-red-950/30 dark:via-rose-900/20 dark:to-pink-950/20',
    accent: 'bg-red-200/50 dark:bg-red-800/30',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
  'Protocols': {
    bg: 'from-cyan-100/70 via-sky-50/70 to-blue-50/70 dark:from-cyan-950/30 dark:via-sky-900/20 dark:to-blue-950/20',
    accent: 'bg-cyan-200/50 dark:bg-cyan-800/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },
  'Web3 Development': {
    bg: 'from-violet-100/70 via-purple-50/70 to-fuchsia-50/70 dark:from-violet-950/30 dark:via-purple-900/20 dark:to-fuchsia-950/20',
    accent: 'bg-violet-200/50 dark:bg-violet-800/30',
    text: 'text-violet-700 dark:text-violet-300',
    icon: 'text-violet-600 dark:text-violet-400',
  },
};

export function CourseProgressCard({ course, onClick }: CourseProgressCardProps) {
  const colors = categoryColors[course.category] || {
    bg: 'from-gray-100/70 via-slate-50/70 to-gray-50/70 dark:from-gray-950/30 dark:via-slate-900/20 dark:to-gray-950/20',
    accent: 'bg-gray-200/50 dark:bg-gray-800/30',
    text: 'text-gray-700 dark:text-gray-300',
    icon: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View course: ${course.title}`}
    >
      {/* Glassmorphism card with soft gradient */}
      <div 
        onClick={onClick}
        className={`relative bg-gradient-to-br ${colors.bg} backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-white/5 cursor-pointer`}
      >
        
        {/* Header with category and rating */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${colors.accent} backdrop-blur-sm`}>
              <BookOpen className={`w-4 h-4 ${colors.icon}`} />
            </div>
            <span className={`text-xs font-semibold ${colors.text}`}>
              {course.category}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{course.rating}</span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {course.instructor}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Lessons & Duration */}
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${colors.accent}`}>
                <BookOpen className={`w-3.5 h-3.5 ${colors.icon}`} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Lessons</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{course.lessonsCount}</p>
          </div>

          {/* XP Reward */}
          {course.xpReward && (
            <div className="bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-yellow-100/80 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-yellow-200/50 dark:bg-yellow-800/30">
                  <Zap className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" fill="currentColor" />
                </div>
                <span className="text-xs text-yellow-700 dark:text-yellow-300">XP Reward</span>
              </div>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">+{course.xpReward}</p>
            </div>
          )}
        </div>

        {/* User Avatars and Enrolled Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, Math.floor(course.enrolledCount / 1000)))].map((_, i) => {
                const avatarColors = [
                  'from-blue-400 to-blue-500',
                  'from-purple-400 to-purple-500',
                  'from-pink-400 to-pink-500',
                ];
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i]} border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md`}
                  >
                    <span className="text-white text-xs font-semibold">{String.fromCharCode(65 + i)}</span>
                  </div>
                );
              })}
              <div className="w-8 h-8 rounded-full bg-gray-200/80 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md">
                <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold">5+</span>
              </div>
            </div>
          </div>

          {/* Arrow Button */}
          <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-800 transition-all shadow-md">
            <ArrowRight className={`w-4 h-4 ${colors.icon} group-hover:translate-x-0.5 transition-transform`} />
          </div>
        </div>

        {/* Bottom XP Breakdown */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/30 dark:border-white/10">
          {course.enrollXP && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-green-200/60 dark:bg-green-800/30 flex items-center justify-center">
                <Award className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-700 dark:text-green-300 font-medium">+{course.enrollXP} XP</span>
            </div>
          )}
          {course.xpPerLesson && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-200/60 dark:bg-blue-800/30 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">+{course.xpPerLesson}/lesson</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
