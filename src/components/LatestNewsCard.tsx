'use client';

import { ImageWithFallback } from './figma/ImageWithFallback';

interface LatestNewsCardProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  image: string;
  articleSlug: string;
  onNavigate?: (page: string) => void;
}

export function LatestNewsCard({ category, categorySlug, time, title, image, articleSlug, onNavigate }: LatestNewsCardProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`news/${categorySlug}/${articleSlug}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex gap-3 md:gap-4 items-start hover:opacity-80 transition-opacity cursor-pointer group"
    >
      <div className="flex-1">
        <div className="mb-1 md:mb-2">
          <span className="text-[#EFB81A] text-xs md:text-sm">{category}</span>
          <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
        </div>
        <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-[#EFB81A] transition-colors">
          {title}
        </h4>
      </div>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
