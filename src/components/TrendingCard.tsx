'use client';

import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrendingCardProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  tags: string[];
  image: string;
  articleSlug: string;
  variant?: 'large' | 'medium' | 'small';
  onNavigate?: (page: string) => void;
}

export function TrendingCard({ category, categorySlug, time, title, tags, image, articleSlug, variant = 'medium', onNavigate }: TrendingCardProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`news/${categorySlug}/${articleSlug}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 md:p-5">
        <div className="mb-2">
          <span className="text-[#EFB81A] text-xs md:text-sm">{category}</span>
          <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
        </div>
        <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-2 md:mb-3 leading-snug text-sm md:text-base group-hover:text-[#EFB81A] transition-colors">
          {title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-gray-400 dark:text-[#A0A0A5] text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
