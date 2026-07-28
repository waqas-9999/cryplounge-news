'use client';

import { useState } from 'react';
import { ArrowRight, BookOpen, Code, Layers, ExternalLink, GraduationCap, Search, Filter, Coins, Network, Image, Radio, Building, Gamepad2, Database, Wallet, Link, HandCoins, TrendingUp, Users, Globe, Brain, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { CourseProgressCard } from '@/components/CourseProgressCard';
import { getCoursesByEcosystem, ecosystemCategories } from '@/data/learnData';
import { RelatedLearnSection } from '@/components/RelatedLearnSection';
import { getRelatedEcosystemCourses, getRelatedCrypLearnCourses } from '@/data/crossPromotionData';
import { useEcosystemBanners } from '@/contexts/EcosystemBannersContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface EcosystemLearnPageProps {
  ecosystem: string;
  images: {
    vrImage: string;
    businessmanImage: string;
    solanaImage: string;
    phoneImage: string;
    speakerImage: string;
    documentImage: string;
    asianBusinessmanImage: string;
  };
  onNavigate: (page: string) => void;
}

export function EcosystemLearnPage({ ecosystem, images, onNavigate }: EcosystemLearnPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage } = images;
  const { getBannerByEcosystem } = useEcosystemBanners();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Get banner for this ecosystem
  const ecosystemBanner = getBannerByEcosystem(ecosystem);

  const ecosystemNames: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'solana': 'Solana',
    'bnb-chain': 'BNB Chain',
    'bitcoin': 'Bitcoin',
    'avalanche': 'Avalanche'
  };

  const ecosystemDescriptions: Record<string, string> = {
    'ethereum': 'The world\'s leading smart contract platform and decentralized application ecosystem',
    'polygon': 'Layer 2 scaling solution providing faster and cheaper transactions for Ethereum',
    'solana': 'High-performance blockchain with ultra-fast transaction speeds and low fees',
    'bnb-chain': 'Binance\'s blockchain ecosystem powering DeFi, NFTs, and Web3 applications',
    'bitcoin': 'The original cryptocurrency and most secure blockchain network',
    'avalanche': 'Highly scalable, eco-friendly platform for enterprise and DeFi applications'
  };

  const ecosystemColors: Record<string, string> = {
    'ethereum': 'from-indigo-500 to-indigo-600',
    'polygon': 'from-purple-500 to-purple-600',
    'solana': 'from-green-500 to-green-600',
    'bnb-chain': 'from-yellow-500 to-yellow-600',
    'bitcoin': 'from-orange-500 to-orange-600',
    'avalanche': 'from-red-500 to-red-600'
  };

  // Icon mapping for ecosystem categories
  const categoryIcons: Record<string, any> = {
    'Coins': Coins,
    'ArrowLeftRight': TrendingUp,
    'Network': Network,
    'Image': Image,
    'Radio': Radio,
    'Building': Building,
    'Gamepad2': Gamepad2,
    'Database': Database,
    'Wallet': Wallet,
    'Link': Link,
    'HandCoins': HandCoins,
    'TrendingUp': TrendingUp,
    'Users': Users,
    'Globe': Globe,
    'Brain': Brain,
    'HardDrive': HardDrive,
  };

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Get courses for this ecosystem
  const allEcosystemCourses = getCoursesByEcosystem(
    ecosystemNames[ecosystem] as any
  );

  // Filter courses
  const ecosystemCourses = allEcosystemCourses.filter(course => {
    const difficultyMatch = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    const searchMatch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return difficultyMatch && searchMatch;
  });

  const quickLinks = [
    {
      icon: BookOpen,
      title: 'Overview',
      description: `Learn about ${ecosystemNames[ecosystem]}'s architecture, consensus, and key features`,
      color: 'from-blue-500 to-blue-600',
      onClick: () => onNavigate(`learn/${ecosystem}/overview`),
    },
    {
      icon: Code,
      title: 'Tutorials',
      description: 'Step-by-step guides for developers and users',
      color: 'from-purple-500 to-purple-600',
      onClick: () => onNavigate(`learn/${ecosystem}/tutorials`),
    },
    {
      icon: Layers,
      title: 'Projects',
      description: `Explore popular dApps and protocols built on ${ecosystemNames[ecosystem]}`,
      color: 'from-green-500 to-green-600',
      onClick: () => {},
    },
  ];

  const resources = [
    { title: 'Official Documentation', url: '#' },
    { title: 'Developer Portal', url: '#' },
    { title: 'Community Forum', url: '#' },
    { title: 'GitHub Repository', url: '#' },
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
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
            <BreadcrumbPage>{ecosystemNames[ecosystem]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Banner or Gradient Background */}
        {ecosystemBanner ? (
          <>
            {/* Custom Banner Image */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src={ecosystemBanner.bannerUrl}
                alt={`${ecosystemNames[ecosystem]} banner`}
                className={`w-full h-full object-cover object-${ecosystemBanner.bannerPosition}`}
              />
              {/* Dark overlay for text readability */}
              <div 
                className="absolute inset-0 bg-black transition-opacity"
                style={{ opacity: ecosystemBanner.overlayOpacity / 100 }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Fallback Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-yellow-950/20" />
            {/* Gradient decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${ecosystemColors[ecosystem]} opacity-20 rounded-full blur-3xl`}></div>
          </>
        )}
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#EFB81A] text-black px-4 py-2 rounded-full text-sm mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>Ecosystem Learn</span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl mb-4 ${ecosystemBanner ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
            {ecosystemNames[ecosystem]}
          </h1>
          
          <p className={`text-lg max-w-3xl mb-6 ${ecosystemBanner ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
            {ecosystemDescriptions[ecosystem]}
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-[#EFB81A] hover:bg-[#EFB81A]/90 text-black rounded-xl transition-all hover:shadow-lg">
              Start Learning
            </button>
            <button className={`px-6 py-3 rounded-xl hover:shadow-lg transition-all ${
              ecosystemBanner 
                ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20' 
                : 'bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
            }`}>
              View All Courses
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <button
              key={index}
              onClick={link.onClick}
              className="group bg-white dark:bg-[#1A1A1C] rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-left border border-gray-200 dark:border-gray-800"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-200 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors text-sm">
                {link.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {link.description}
              </p>
              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Ecosystem Categories Filter */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">Browse by Category</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Explore {ecosystemNames[ecosystem]} projects and protocols</p>
          </div>
        </div>
        
        {/* Horizontal Filter Bar */}
        <div className="relative -mx-4 sm:-mx-6 md:-mx-8">
          <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#0A0A0B] dark:via-[#121214] dark:to-[#0A0A0B] border-y border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
              <div className="space-y-3">
                {/* Main Horizontal Bar */}
                <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                  {ecosystemCategories.slice(0, 7).map((category, index) => {
                    const Icon = categoryIcons[category.icon] || BookOpen;
                    return (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.03 * index }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // Navigate to category page
                          onNavigate(`learn/${ecosystem}/${category.id}`);
                        }}
                        className="group relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] hover:shadow-md hover:bg-[#EFB81A]/5 dark:hover:bg-[#EFB81A]/10"
                        aria-label={`View ${category.name} courses`}
                      >
                        <span 
                          className="flex items-center justify-center w-5 h-5 rounded transition-transform group-hover:scale-110"
                        >
                          <Icon className="w-4 h-4 text-[#EFB81A]" />
                        </span>
                        <span>{category.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#EFB81A] transition-colors group-hover:translate-x-0.5" />
                      </motion.button>
                    );
                  })}
                  
                  {/* More/Less Toggle Button */}
                  {ecosystemCategories.length > 7 && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.03 * 8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="group relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm bg-[#EFB81A] text-black shadow-md shadow-[#EFB81A]/25 hover:shadow-lg hover:shadow-[#EFB81A]/30"
                      aria-label={showAllCategories ? 'Show less categories' : `Show ${ecosystemCategories.length - 7} more categories`}
                    >
                      <motion.span
                        animate={{ rotate: showAllCategories ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center w-5 h-5"
                      >
                        <span className="text-base">▼</span>
                      </motion.span>
                      <span>
                        {showAllCategories ? 'Less' : `More (+${ecosystemCategories.length - 7})`}
                      </span>
                    </motion.button>
                  )}
                </div>

                {/* Dropdown Grid - Additional Categories */}
                {ecosystemCategories.length > 7 && (
                  <motion.div
                    initial={false}
                    animate={{
                      height: showAllCategories ? 'auto' : 0,
                      opacity: showAllCategories ? 1 : 0,
                    }}
                    transition={{
                      height: { duration: 0.3, ease: 'easeInOut' },
                      opacity: { duration: 0.2, delay: showAllCategories ? 0.1 : 0 }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-3">
                      <div className="flex flex-wrap gap-2">
                        {ecosystemCategories.slice(7).map((category, index) => {
                          const Icon = categoryIcons[category.icon] || BookOpen;
                          return (
                            <motion.button
                              key={category.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: showAllCategories ? 1 : 0, y: showAllCategories ? 0 : -10 }}
                              transition={{ duration: 0.3, delay: showAllCategories ? 0.05 * index : 0 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                // Navigate to category page
                                onNavigate(`learn/${ecosystem}/${category.id}`);
                              }}
                              className="group relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] hover:shadow-md hover:bg-[#EFB81A]/5 dark:hover:bg-[#EFB81A]/10"
                              aria-label={`View ${category.name} courses`}
                            >
                              <span 
                                className="flex items-center justify-center w-5 h-5 rounded transition-transform group-hover:scale-110"
                              >
                                <Icon className="w-4 h-4 text-[#EFB81A]" />
                              </span>
                              <span>{category.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#EFB81A] transition-colors group-hover:translate-x-0.5" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
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
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">{ecosystemNames[ecosystem]} Courses</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{ecosystemCourses.length} courses available</p>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1C] border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors pr-10"
              aria-label="Search courses"
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
              aria-label={`Filter by ${difficulty} difficulty`}
            >
              {difficulty}
            </button>
          ))}
          {selectedDifficulty !== 'All' && (
            <button
              onClick={() => {
                setSelectedDifficulty('All');
              }}
              className="px-5 py-2.5 rounded-xl text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Courses Grid */}
        {ecosystemCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: 0.05 * (index % 6) }}
              >
                <CourseProgressCard 
                  course={course}
                  onClick={() => {
                    // Navigate to course detail page
                    if (course.ecosystemCategory) {
                      onNavigate(`learn/${ecosystem}/${course.ecosystemCategory.toLowerCase()}/${course.id}`);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
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

      {/* Related Learn Section - Cross Promotion */}
      <RelatedLearnSection
        courses={getRelatedEcosystemCourses(ecosystem, true)}
        title={`Explore More Blockchain Ecosystems`}
        onNavigate={onNavigate}
      />

      {/* Official Resources */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <ExternalLink className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          <h2 className="text-gray-800 dark:text-gray-200">Official Resources</h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore official documentation, developer tools, and community resources for {ecosystemNames[ecosystem]}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              className="group bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800 dark:text-gray-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {resource.title}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Learning Paths CTA */}
      <div className="bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-yellow-950/20 rounded-3xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-800">
        <GraduationCap className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
        <h2 className="text-gray-800 dark:text-gray-200 mb-3">
          Want to become a {ecosystemNames[ecosystem]} expert?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Follow our structured learning paths to master {ecosystemNames[ecosystem]} development, from beginner to advanced topics.
        </p>
        
        <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl transition-all hover:shadow-xl">
          View Learning Paths
        </button>
      </div>
    </main>
  );
}
