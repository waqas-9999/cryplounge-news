'use client';

import { Search, ArrowRight, Filter, BookOpen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { CourseProgressCard } from '@/components/CourseProgressCard';
import { crypLearnCategories, getCrypLearnCourses, userStats } from '@/data/learnData';
import type { Course } from '@/data/learnData';
import { CrypLearnHeroAnimation } from '@/components/CrypLearnHeroAnimation';
import { mockTutorials } from '@/data/mockTutorials';
import { useLearnCategories } from '@/contexts/LearnCategoriesContext';
import { RelatedLearnSection } from '@/components/RelatedLearnSection';
import { getRelatedEcosystemCourses } from '@/data/crossPromotionData';

interface CrypLearnPageProps {
  onNavigate: (page: string) => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'BookOpen': BookOpen,
  'Coins': BookOpen,
  'Image': BookOpen,
  'Network': BookOpen,
  'TrendingUp': BookOpen,
  'Code': BookOpen,
  'Shield': BookOpen,
  'Globe': BookOpen,
};

export function CrypLearnPage({ onNavigate }: CrypLearnPageProps) {
  const { getActiveCategories } = useLearnCategories();
  const learnCategories = getActiveCategories();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  
  // Get CrypLounge Learn tutorials (type = 'cryplounge')
  const crypTutorials = mockTutorials
    .filter(tutorial => tutorial.type === 'cryplounge' && tutorial.status === 'published');
  
  // Convert tutorials to Course format for compatibility
  const crypCourses = crypTutorials.map(tutorial => ({
    id: tutorial.id,
    title: tutorial.title,
    description: tutorial.summary,
    // Tutorial.category is a free-form string; Course.category is a closed
    // union. The seed data only uses valid values, so narrow it here.
    category: tutorial.category as Course['category'],
    difficulty: tutorial.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
    duration: `${tutorial.duration} min`,
    xpReward: tutorial.xpReward,
    progress: 0,
    thumbnail: tutorial.thumbnail,
    tags: tutorial.tags,
    lessonsCount: Math.ceil(tutorial.duration / 10),
    enrolledCount: Math.floor(Math.random() * 3000) + 1000, // Random enrolled count between 1000-4000
    rating: 4.5 + (Math.random() * 0.4), // Random rating between 4.5-4.9
    reviewsCount: Math.floor(Math.random() * 500) + 100, // Random review count
    instructor: 'CrypLounge Team',
    isCompleted: false,
    learnType: 'crypto' as const,
    slug: tutorial.slug,
    enrollXP: 50, // XP for enrollment
    xpPerLesson: 10 // XP per lesson
  }));

  // Filter courses
  const filteredCourses = crypCourses.filter(course => {
    const categoryMatch = selectedCategory === 'All' || course.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    const searchMatch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12"
    >
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('learn')} className="cursor-pointer">Learn</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cryp Learn</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        {/* Animated Learning Elements */}
        <CrypLearnHeroAnimation />
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/30 dark:bg-yellow-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-full text-sm mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cryp Learn - Global Blockchain Education</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl text-gray-900 dark:text-gray-100 mb-4"
          >
            Master Crypto <span className="text-yellow-600 dark:text-yellow-400">Fundamentals</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mb-6"
          >
            Learn universal blockchain concepts, DeFi protocols, NFTs, trading strategies, and smart contract development that apply across all ecosystems.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">24+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Courses</div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">8</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Categories</div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">15K+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Students</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Learning Stats */}
      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">Browse by Category</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Explore courses organized by topic</p>
          </div>
        </div>
        
        {/* Horizontal Filter Bar */}
        <div className="relative -mx-4 sm:-mx-6 md:-mx-8">
          <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#0A0A0B] dark:via-[#121214] dark:to-[#0A0A0B] border-y border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                {/* All Categories Button */}
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory('All')}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm ${
                    selectedCategory === 'All'
                      ? 'bg-[#EFB81A] text-black shadow-md shadow-[#EFB81A]/25'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] hover:shadow-md'
                  }`}
                >
                  {selectedCategory === 'All' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="text-base"
                    >
                      ✓
                    </motion.span>
                  )}
                  <span>All Topics</span>
                  <span className={`text-xs ${selectedCategory === 'All' ? 'text-black/70' : 'text-gray-500 dark:text-gray-400'}`}>
                    {crypCourses.length}
                  </span>
                </motion.button>
                
                {learnCategories.map((category, index) => {
                  const tutorialCount = crypCourses.filter(c => c.category === category.name).length;
                  if (tutorialCount === 0) return null;
                  
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.03 * (index + 1) }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`group relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm ${
                        selectedCategory === category.name
                          ? 'bg-[#EFB81A] text-black shadow-md shadow-[#EFB81A]/25'
                          : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] hover:shadow-md'
                      }`}
                    >
                      {selectedCategory === category.name && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="text-base"
                        >
                          ✓
                        </motion.span>
                      )}
                      <span className="text-base">{category.icon}</span>
                      <span>{category.name}</span>
                      <span className={`text-xs ${selectedCategory === category.name ? 'text-black/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tutorialCount}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-[#0A0A0B] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-[#0A0A0B] to-transparent pointer-events-none" />
        </div>
        
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        id="courses-section"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">All Cryp Courses</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{filteredCourses.length} courses available</p>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1C] border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-500" />
          </div>
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Difficulty:</span>
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent dark:border-gray-700'
              }`}
            >
              {difficulty}
            </button>
          ))}
          {(selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="px-5 py-2.5 rounded-xl text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            // Convert category to URL-friendly slug
            const categorySlug = course.category.toLowerCase().replace(/\s+/g, '-');
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: 0.05 * (index % 6) }}
              >
                <CourseProgressCard 
                  course={course}
                  onClick={() => onNavigate(`learn/crypto/${categorySlug}/${course.id}`)}
                />
              </motion.div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
            <p className="text-gray-700 dark:text-gray-300">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </motion.div>

      {/* Related Learn Section - Cross Promotion to Ecosystem Learn */}
      <RelatedLearnSection
        courses={getRelatedEcosystemCourses('ethereum', true)}
        title="Explore Ecosystem-Specific Learning"
        onNavigate={onNavigate}
      />

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-yellow-950/20 rounded-3xl p-8 md:p-12 text-center border-2 border-gray-200 dark:border-gray-800"
      >
        <BookOpen className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
        <h2 className="text-gray-900 dark:text-gray-100 mb-3">
          Ready to become a crypto expert?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          Subscribe to our newsletter for new courses, exclusive content, and learning tips delivered to your inbox weekly.
        </p>
        
        <div className="max-w-md mx-auto flex gap-3">
          <input 
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-white dark:bg-[#1A1A1C] border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500"
          />
          <button className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all hover:shadow-xl">
            Subscribe
          </button>
        </div>
      </motion.div>
    </motion.main>
  );
}
