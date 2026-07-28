'use client';

import { ArrowRight, Layers, Sparkles, TrendingUp, BookOpen, Users, Rocket, Code2, Zap, Network, Image, Wrench, GitCompare, Star, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ecosystemsInfo } from '@/data/learnData';
import { EcosystemLearnHeroAnimation } from '@/components/EcosystemLearnHeroAnimation';
import { 
  ecosystemHubContent, 
  getEnabledStats, 
  getEnabledFeatures, 
  getEnabledLearningPaths, 
  getEnabledTestimonials,
  getEnabledComparisonFeatures 
} from '@/data/ecosystemHubData';

interface EcosystemLearnHubPageProps {
  onNavigate: (page: string) => void;
}

const iconMap: { [key: string]: any } = {
  Layers, Sparkles, TrendingUp, BookOpen, Users, Rocket, 
  Code2, Zap, Network, Image, Wrench, GitCompare
};

const colorClasses: { [key: string]: string } = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-900',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-900',
  green: 'from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-900',
  orange: 'from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-900',
  indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-900',
  pink: 'from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 border-pink-200 dark:border-pink-900',
  yellow: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-900'
};

const iconColorClasses: { [key: string]: string } = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500'
};

const difficultyColors: { [key: string]: string } = {
  'Beginner': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'Intermediate': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Advanced': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
};

export function EcosystemLearnHubPage({ onNavigate }: EcosystemLearnHubPageProps) {
  const stats = getEnabledStats();
  const features = getEnabledFeatures();
  const learningPaths = getEnabledLearningPaths();
  const testimonials = getEnabledTestimonials();
  const comparisonFeatures = getEnabledComparisonFeatures();

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
              <BreadcrumbPage>Ecosystem Learn</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20 rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        {/* Animated Ecosystem Network */}
        <EcosystemLearnHeroAnimation />
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm mb-4"
          >
            {iconMap[ecosystemHubContent.hero.badge.icon] && 
              <Layers className="w-4 h-4" />
            }
            <span>{ecosystemHubContent.hero.badge.text}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl text-gray-900 dark:text-gray-100 mb-4"
          >
            {ecosystemHubContent.hero.title} <span className="text-blue-600 dark:text-blue-400">{ecosystemHubContent.hero.titleHighlight}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mb-6"
          >
            {ecosystemHubContent.hero.description}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-6">
              {stats.map((stat, index) => (
                <div key={stat.id}>
                  {index > 0 && <div className="w-px h-12 bg-gray-300 dark:bg-gray-700 inline-block mr-6"></div>}
                  <div className="inline-block">
                    <div className="text-2xl text-gray-900 dark:text-gray-100">{stat.value}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Ecosystems Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">Choose Your Ecosystem</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Select a blockchain to explore courses and projects</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ecosystemsInfo.map((ecosystem, index) => (
            <motion.button
              key={ecosystem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(`learn/${ecosystem.id}`)}
              className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 text-left overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${ecosystem.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 p-1.5">
                  <img 
                    src={ecosystem.logo} 
                    alt={`${ecosystem.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Content */}
                <h3 className="text-gray-900 dark:text-gray-100 mb-1.5 text-sm">{ecosystem.name}</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{ecosystem.description}</p>
                
                {/* Stats */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div>
                    <div className="text-xs text-gray-900 dark:text-gray-100">{ecosystem.courseCount}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">Courses</div>
                  </div>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
                  <div>
                    <div className="text-xs text-gray-900 dark:text-gray-100">{ecosystem.projectCount}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">Projects</div>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <h2 className="text-gray-900 dark:text-gray-100">What You'll Learn</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Comprehensive blockchain education across all major ecosystems</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Layers;
            const colorClass = colorClasses[feature.color] || colorClasses.blue;
            const iconColorClass = iconColorClasses[feature.color] || iconColorClasses.blue;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`bg-gradient-to-br ${colorClass} rounded-2xl p-8 border`}
              >
                <div className={`w-12 h-12 rounded-xl ${iconColorClass} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Paths */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <h2 className="text-gray-900 dark:text-gray-100">Learning Paths</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Structured journeys to master specific blockchain skills</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => {
            const Icon = iconMap[path.icon] || Code2;
            const colorClass = colorClasses[path.color] || colorClasses.blue;
            const iconColorClass = iconColorClasses[path.color] || iconColorClasses.blue;

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${iconColorClass} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={difficultyColors[path.difficulty]}>
                      {path.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-gray-900 dark:text-gray-100 mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 flex-1">
                    {path.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {path.ecosystems.slice(0, 3).map(eco => {
                      const ecosystemInfo = ecosystemsInfo.find(e => e.id === eco);
                      return ecosystemInfo ? (
                        <Badge key={eco} variant="outline" className="text-xs">
                          {ecosystemInfo.name}
                        </Badge>
                      ) : null;
                    })}
                    {path.ecosystems.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{path.ecosystems.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{path.duration}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Ecosystem Comparison */}
      {comparisonFeatures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h2 className="text-gray-900 dark:text-gray-100">Ecosystem Comparison</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Compare features across different blockchain platforms</p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-900 dark:text-gray-100">Feature</th>
                    {ecosystemsInfo.map(eco => (
                      <th key={eco.id} className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <img src={eco.logo} alt={eco.name} className="w-5 h-5 object-contain" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{eco.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {comparisonFeatures.map(feature => (
                    <tr key={feature.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {feature.feature}
                      </td>
                      {ecosystemsInfo.map(eco => (
                        <td key={eco.id} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {feature.ecosystems[eco.id] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h2 className="text-gray-900 dark:text-gray-100">Student Success Stories</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Hear from developers who mastered blockchain with CrypLounge</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 flex-1 italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">{testimonial.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-yellow-950/20 rounded-3xl p-8 md:p-12 text-center border-2 border-gray-200 dark:border-gray-800"
      >
        <Layers className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h2 className="text-gray-900 dark:text-gray-100 mb-3">
          {ecosystemHubContent.cta.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          {ecosystemHubContent.cta.description}
        </p>
        
        <button 
          onClick={() => onNavigate(ecosystemHubContent.cta.buttonLink)}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:shadow-xl"
          aria-label={ecosystemHubContent.cta.buttonText}
        >
          {ecosystemHubContent.cta.buttonText}
        </button>
      </motion.div>
    </motion.main>
  );
}
