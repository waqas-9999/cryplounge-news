'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { CourseProgressCard } from './CourseProgressCard';
import { courses } from '../data/learnData';

interface LatestLearnSectionProps {
  onNavigate?: (page: string) => void;
}

export function LatestLearnSection({ onNavigate }: LatestLearnSectionProps) {
  // Get the 4 newest courses or featured courses
  const latestCourses = courses
    .filter(course => course.isNew || course.isFeatured)
    .slice(0, 4);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h2 className="text-gray-800 dark:text-gray-200">Latest Learn</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
              New courses to expand your knowledge
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate?.('learn')}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1"
        >
          View all courses <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {latestCourses.map((course) => (
          <div key={course.id} className="flex-shrink-0 w-[280px] snap-start">
            <CourseProgressCard 
              course={course}
              onClick={() => onNavigate?.('learn')}
            />
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <div className="flex justify-end gap-2 mt-6">
        <button 
          onClick={() => handleScroll('left')}
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button 
          onClick={() => handleScroll('right')}
          className="w-10 h-10 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
      </div>
    </div>
  );
}
