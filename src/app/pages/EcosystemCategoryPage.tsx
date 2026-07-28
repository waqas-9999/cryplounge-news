import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Filter, TrendingUp, Star, Clock, Users } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';
import { CourseProgressCard } from '../components/CourseProgressCard';
import { getCoursesByEcosystem, ecosystemCategories, Course } from '../data/learnData';

interface EcosystemCategoryPageProps {
  ecosystem: string;
  category: string;
  onNavigate: (page: string) => void;
}

export function EcosystemCategoryPage({ ecosystem, category, onNavigate }: EcosystemCategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const ecosystemNames: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'solana': 'Solana',
    'bnb-chain': 'BNB Chain',
    'bitcoin': 'Bitcoin',
    'avalanche': 'Avalanche'
  };

  const categoryInfo = ecosystemCategories.find(cat => cat.id === category);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Get all courses for this ecosystem
  const allCourses = getCoursesByEcosystem(ecosystemNames[ecosystem] as any);

  // Filter by category
  let filteredCourses = allCourses.filter(course => {
    const categoryMatch = course.ecosystemCategory?.toLowerCase() === category.toLowerCase();
    const difficultyMatch = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    const searchMatch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && difficultyMatch && searchMatch;
  });

  // Sort courses
  filteredCourses = filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.enrolledCount - a.enrolledCount;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      {/* Breadcrumb */}
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
            <BreadcrumbLink onClick={() => onNavigate(`learn/${ecosystem}`)} className="cursor-pointer">
              {ecosystemNames[ecosystem]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryInfo?.name || category}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <button
        onClick={() => onNavigate(`learn/${ecosystem}`)}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to {ecosystemNames[ecosystem]}</span>
      </button>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${categoryInfo?.color || 'from-blue-500 to-blue-600'} rounded-3xl p-8 md:p-12 text-white relative overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl mb-4">
            {categoryInfo?.name || category} on {ecosystemNames[ecosystem]}
          </h1>
          <p className="text-lg text-white/90 max-w-3xl mb-6">
            {categoryInfo?.description || `Explore ${category} projects and protocols built on ${ecosystemNames[ecosystem]}`}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>{filteredCourses.length} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{filteredCourses.reduce((acc, course) => acc + course.enrolledCount, 0).toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Learn at your own pace</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
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
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {selectedDifficulty !== 'All' && `${selectedDifficulty} level • `}
              {categoryInfo?.name} on {ecosystemNames[ecosystem]}
            </p>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * (index % 6) }}
              >
                <CourseProgressCard 
                  course={course}
                  onClick={() => onNavigate(`learn/${ecosystem}/${category}/${course.id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1A1C] rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('All');
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Call to Action */}
      {filteredCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-yellow-950/20 rounded-3xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-800"
        >
          <TrendingUp className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-gray-900 dark:text-gray-100 mb-3">
            Ready to master {categoryInfo?.name}?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            Start your learning journey today and join thousands of students already learning {categoryInfo?.name} on {ecosystemNames[ecosystem]}.
          </p>
          <button
            onClick={() => filteredCourses[0] && onNavigate(`learn/${ecosystem}/${category}/${filteredCourses[0].id}`)}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all hover:shadow-xl"
          >
            Start Learning Now
          </button>
        </motion.div>
      )}
    </main>
  );
}
