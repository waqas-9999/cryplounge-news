'use client';

import { ArrowRight } from 'lucide-react';

interface HeroArticleProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  tags: string[];
  articleSlug: string;
  image?: string;
  gradientImage?: string;
  onNavigate?: (page: string) => void;
}

export function HeroArticle({ category, categorySlug, time, title, tags, articleSlug, onNavigate }: HeroArticleProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`news/${categorySlug}/${articleSlug}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white dark:bg-[#1E1E20] rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[300px] md:min-h-[400px] flex flex-col justify-between border border-gray-100 dark:border-white/[0.08] transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
    >
      <div className="absolute right-0 top-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px]">
        <div className="w-full h-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-blue-200 dark:from-yellow-400/20 dark:via-yellow-500/15 dark:to-yellow-600/10 rounded-full opacity-40 blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg mb-4 md:mb-6 border border-yellow-200 dark:border-yellow-500/30">
          <span className="text-yellow-900 dark:text-yellow-300 text-xs md:text-sm">FEATURED NEWS</span>
        </div>
        
        <div className="mb-3 md:mb-4">
          <span className="text-blue-600 dark:text-yellow-400 text-xs md:text-sm">{category}</span>
          <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
        </div>
        
        <h1 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 max-w-full md:max-w-[500px] leading-tight">
          {title}
        </h1>
        
        <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">
              #{tag}
            </span>
          ))}
        </div>
        
        <button className="flex items-center gap-2 text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors text-sm md:text-base">
          Read article
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
}
