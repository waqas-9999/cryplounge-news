'use client';

import { ArrowRight, BookOpen, Layers, Sparkles, GraduationCap, Globe, Code } from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { WelcomeLearnCard } from '@/components/WelcomeLearnCard';
import { XPWidget } from '@/components/XPWidget';
import { userStats, getFeaturedCourses } from '@/data/learnData';
import { CourseProgressCard } from '@/components/CourseProgressCard';
import { LearnHeroAnimation } from '@/components/LearnHeroAnimation';
import { RelatedLearnSection } from '@/components/RelatedLearnSection';
import { getMixedRelatedCourses } from '@/data/crossPromotionData';

interface LearnPageProps {
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

export function LearnPage({ images, onNavigate }: LearnPageProps) {
  const featuredCourses = getFeaturedCourses();

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
            <BreadcrumbPage>Learn</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </motion.div>

      {/* Welcome and Stats Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Welcome Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <WelcomeLearnCard userName="Alex" />
        </div>
        
        {/* XP Widget */}
        <div>
          <XPWidget variant="full" />
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-gradient-to-br from-blue-100/70 via-purple-50/70 to-pink-100/70 dark:from-blue-950/30 dark:via-purple-900/20 dark:to-pink-950/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 overflow-hidden border border-white/20 dark:border-white/5 shadow-xl"
      >
        {/* Animated Learning Elements */}
        <LearnHeroAnimation />
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/30 dark:bg-yellow-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-full text-sm"
            >
              <GraduationCap className="w-4 h-4" />
              <span>CrypLounge Learning Hub</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl text-gray-900 dark:text-gray-100"
            >
              Master Blockchain
              <span className="block text-yellow-600 dark:text-yellow-400">Your Way</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 dark:text-gray-300 text-lg"
            >
              Choose your learning path: Master universal crypto concepts or dive deep into specific blockchain ecosystems.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 pt-4"
            >
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">80+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Courses</div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">25K+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Students</div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <div className="text-2xl text-gray-900 dark:text-gray-100">4.8</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Avg Rating</div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Illustration */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative w-64 h-64"
            >
              {/* Floating Books */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-56 space-y-3"
              >
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-xl transform rotate-1 border-4 border-blue-600 dark:border-blue-800"></div>
                <div className="absolute bottom-12 left-2 w-full h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 rounded-lg shadow-xl transform -rotate-2 border-4 border-yellow-600 dark:border-yellow-800"></div>
                <div className="absolute bottom-24 left-1 w-full h-16 bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-xl transform rotate-3 border-4 border-purple-600 dark:border-purple-800"></div>
              </motion.div>
              
              {/* Sparkles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + i * 30}%`,
                    right: `${10 + i * 20}%`,
                  }}
                ></motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Two Main Paths */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Choose Your Learning Path</h2>
          <p className="text-gray-600 dark:text-gray-400">Select the path that matches your learning goals</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cryp Learn Path */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('learn/crypto')}
            className="group relative bg-gradient-to-br from-yellow-100/70 via-orange-50/70 to-amber-100/70 dark:from-yellow-950/30 dark:via-orange-900/20 dark:to-amber-950/30 backdrop-blur-xl rounded-3xl p-8 text-left border border-white/20 dark:border-white/5 shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Decorative blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 dark:bg-yellow-600/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xs mb-4">
                <Sparkles className="w-3 h-3" />
                <span>Universal Concepts</span>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100 mb-4">
                Cryp Learn
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Master universal blockchain concepts including DeFi, NFTs, protocols, trading, smart contracts, and security that apply across all ecosystems.
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <div className="text-xl text-gray-900 dark:text-gray-100">8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                </div>
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-xl text-gray-900 dark:text-gray-100">24+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <span className="font-medium">Explore Cryp Learn</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Ecosystem Learn Path */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('learn/ecosystem')}
            className="group relative bg-gradient-to-br from-blue-100/70 via-indigo-50/70 to-purple-100/70 dark:from-blue-950/30 dark:via-indigo-900/20 dark:to-purple-950/30 backdrop-blur-xl rounded-3xl p-8 text-left border border-white/20 dark:border-white/5 shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Decorative blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs mb-4">
                <Code className="w-3 h-3" />
                <span>Network Specific</span>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100 mb-4">
                Ecosystem Learn
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Deep dive into specific blockchains like Ethereum, Solana, Polygon, and more. Learn network-specific development, explore dApps, and master each platform.
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <div className="text-xl text-gray-900 dark:text-gray-100">6</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ecosystems</div>
                </div>
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-xl text-gray-900 dark:text-gray-100">60+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <span className="font-medium">Explore Ecosystems</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Featured Courses</h2>
              <p className="text-gray-600 dark:text-gray-400">Handpicked courses to accelerate your learning</p>
            </div>
            <button 
              onClick={() => onNavigate('learn/crypto')}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <CourseProgressCard 
                  course={course}
                  onClick={() => onNavigate('learn/crypto')}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Related Learn Section - Cross Promotion */}
      <RelatedLearnSection
        courses={getMixedRelatedCourses({ learnType: 'crypto' })}
        title="Recommended for You"
        onNavigate={onNavigate}
      />

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-8 md:p-12 text-center border-2 border-gray-200 dark:border-gray-800"
      >
        <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h2 className="text-gray-900 dark:text-gray-100 mb-3">
          Ready to start your blockchain journey?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          Join thousands of students learning blockchain technology. Get weekly insights, exclusive content, and updates delivered to your inbox.
        </p>
        
        <div className="max-w-md mx-auto flex gap-3">
          <input 
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-white dark:bg-[#1A1A1C] border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-400 dark:focus:border-blue-500"
          />
          <button className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:shadow-xl">
            Subscribe
          </button>
        </div>
      </motion.div>
    </motion.main>
  );
}
