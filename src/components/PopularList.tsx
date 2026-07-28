'use client';

import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArticleBadge } from './ArticleBadge';
import { PromotionArticle } from '../utils/promotions';

interface PopularListProps {
  articles: PromotionArticle[];
  maxVisible?: number;
  showScores?: boolean;
}

export function PopularList({ articles, maxVisible = 6, showScores = false }: PopularListProps) {
  const router = useRouter();
  const displayArticles = articles.slice(0, maxVisible);

  if (displayArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-[#A0A0A5]">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No popular articles at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayArticles.map((article, idx) => (
        <article
          key={`popular-${article.id}-${idx}`}
          onClick={() => router.push(`/news/${article.categorySlug}/${article.slug}`)}
          className="group cursor-pointer flex gap-4 items-start"
        >
          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={article.thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <ArticleBadge type="POPULAR" score={showScores ? article.score : undefined} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="text-[#EFB81A] text-xs">{article.category}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs ml-2">{article.time}</span>
            </div>
            <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug group-hover:text-[#EFB81A] transition-colors line-clamp-3">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-gray-600 dark:text-[#A0A0A5] text-sm mt-2 line-clamp-2">
                {article.summary}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
