import { ArrowRight, Clock, BookOpen, Star, Users, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { RelatedCourse } from '../data/crossPromotionData';

interface RelatedLearnSectionProps {
  courses: RelatedCourse[];
  title?: string;
  onNavigate: (page: string) => void;
}

export function RelatedLearnSection({ 
  courses, 
  title = "Continue Your Learning Journey",
  onNavigate 
}: RelatedLearnSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-[#F9D96A]/5 to-transparent dark:from-[#EFB81A]/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Recommended courses based on your interests
            </p>
          </div>
          <button
            onClick={() => onNavigate('learn')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFB81A] text-black hover:bg-[#F9D96A] transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label="View all courses"
          >
            <span className="text-sm">View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Related Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                if (course.learnType === 'crypto') {
                  onNavigate(`learn/cryp/${course.categorySlug}`);
                } else {
                  onNavigate(`learn/${course.ecosystemSlug}`);
                }
              }}
            >
              <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all duration-300 hover:shadow-xl hover:shadow-[#EFB81A]/10 h-full">
                {/* Course Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-[#EFB81A]/20 to-[#F9D96A]/10 dark:from-[#EFB81A]/10 dark:to-[#F9D96A]/5 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-[#EFB81A]/30 group-hover:text-[#EFB81A]/50 transition-colors" />
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
                      course.difficulty === 'Beginner'
                        ? 'bg-green-500/90 text-white'
                        : course.difficulty === 'Intermediate'
                        ? 'bg-yellow-500/90 text-black'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Learn Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-[#EFB81A] text-black backdrop-blur-sm">
                      {course.learnType === 'crypto' ? 'Cryp Learn' : 'Ecosystem Learn'}
                    </span>
                  </div>

                  {/* XP Badge */}
                  {course.xpReward && (
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        <Award className="w-3 h-3 text-[#EFB81A]" />
                        <span className="text-xs text-gray-900 dark:text-white">
                          +{course.xpReward} XP
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-5">
                  {/* Category & Ecosystem */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#EFB81A]">
                      {course.category}
                    </span>
                    {course.ecosystem && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {course.ecosystem}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#EFB81A] transition-colors text-base">
                    {course.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-3 h-3" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#EFB81A] fill-[#EFB81A]" />
                        <span className="text-gray-900 dark:text-white">
                          {course.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{course.enrolledCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white group-hover:bg-[#EFB81A] group-hover:text-black transition-all duration-200 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (course.learnType === 'crypto') {
                        onNavigate(`learn/cryp/${course.categorySlug}`);
                      } else {
                        onNavigate(`learn/${course.ecosystemSlug}`);
                      }
                    }}
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 md:hidden flex justify-center">
          <button
            onClick={() => onNavigate('learn')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#EFB81A] text-black hover:bg-[#F9D96A] transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label="View all courses"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
