'use client';

import Link from 'next/link';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecommendedCardProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  image: string;
  articleSlug: string;
  variant?: 'large' | 'small';
  /** @deprecated Navigation is handled by the card's own <Link>. */
  onNavigate?: (page: string) => void;
}

export function RecommendedCard({ category, categorySlug, time, title, image, articleSlug, variant = 'small' }: RecommendedCardProps) {
  // A real URL, so both variants render a crawlable <a>.
  const href = `/news/${categorySlug}/${articleSlug}`;

  if (variant === 'large') {
    return (
      <Link
        href={href}
        className="block rounded-2xl md:rounded-3xl overflow-hidden relative h-[150px] md:h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
      >
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/60 to-transparent"></div>
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
          <div className="mb-1 md:mb-2">
            <span className="text-xs md:text-sm opacity-90">{category}</span>
            <span className="text-xs md:text-sm ml-2 opacity-70">{time}</span>
          </div>
          <h3 className="text-white leading-snug text-sm md:text-base">
            {title}
          </h3>
        </div>
      </Link>
    );
  }
  
  return (
    <Link
      href={href}
      className="flex gap-3 md:gap-4 items-center hover:opacity-80 transition-opacity cursor-pointer group"
    >
      <div className="flex-1">
        <div className="mb-1 md:mb-2">
          <span className="text-blue-600 dark:text-yellow-400 text-xs md:text-sm">{category}</span>
          <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
        </div>
        <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-xs md:text-sm group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors">
          {title}
        </h4>
      </div>
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
}
