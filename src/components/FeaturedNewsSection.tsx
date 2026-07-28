'use client';

import { ImageWithFallback } from './figma/ImageWithFallback';

interface SidebarArticle {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  articleSlug: string;
}

interface FeaturedNewsSectionProps {
  mainImage: string;
  mainCategory: string;
  mainCategorySlug: string;
  mainArticleSlug: string;
  mainTitle: string;
  mainTags: string[];
  mainTime: string;
  sidebarArticles: SidebarArticle[];
  onNavigate?: (page: string) => void;
}

export function FeaturedNewsSection({ 
  mainImage, 
  mainCategory,
  mainCategorySlug,
  mainArticleSlug,
  mainTitle,
  mainTags,
  mainTime,
  sidebarArticles,
  onNavigate 
}: FeaturedNewsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
          <span className="text-yellow-900 dark:text-yellow-300 text-xs md:text-sm">BEST OF THE WEEK</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left - Large Image with Content Overlay */}
        <div 
          onClick={() => onNavigate && onNavigate(`news/${mainCategorySlug}/${mainArticleSlug}`)}
          className="lg:col-span-2 bg-white dark:bg-[#1E1E20] rounded-2xl md:rounded-3xl overflow-hidden relative border border-gray-100 dark:border-white/[0.08] transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
        >
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
            <ImageWithFallback 
              src={mainImage}
              alt="Featured news"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
              <div className="mb-2 md:mb-3">
                <span className="text-xs md:text-sm">{mainCategory}</span>
                <span className="text-xs md:text-sm ml-2 opacity-70">{mainTime}</span>
              </div>
              
              <h2 className="text-xl md:text-3xl lg:text-4xl mb-3 md:mb-4 leading-tight">
                {mainTitle}
              </h2>
              
              <div className="flex gap-2 md:gap-3">
                {mainTags.map((tag, idx) => (
                  <span key={idx} className="text-xs md:text-sm opacity-70">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right - Yellow Gradient Sidebar - SAME GRADIENT IN BOTH MODES */}
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl md:rounded-3xl p-5 md:p-6 text-white border border-yellow-300 dark:border-yellow-500/30 transition-colors shadow-lg dark:shadow-yellow-500/10">
          <div className="space-y-4 md:space-y-6">
            {sidebarArticles.map((article, idx) => (
              <div 
                key={idx} 
                onClick={() => onNavigate && onNavigate(`news/${article.categorySlug}/${article.articleSlug}`)}
                className="pb-4 md:pb-6 border-b border-white/20 last:border-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="mb-2 text-xs md:text-sm opacity-90">
                  {article.category} • {article.time}
                </div>
                <h4 className="leading-snug text-sm md:text-base">
                  {article.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
