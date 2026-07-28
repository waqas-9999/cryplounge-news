import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArticleBadge } from './ArticleBadge';
import { PromotionArticle } from '../utils/promotions';

interface FeaturedListProps {
  articles: PromotionArticle[];
  maxVisible?: number;
  showScores?: boolean;
}

export function FeaturedList({ articles, maxVisible = 4, showScores = false }: FeaturedListProps) {
  const navigate = useNavigate();
  const displayArticles = articles.slice(0, maxVisible);

  if (displayArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-[#A0A0A5]">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No featured articles at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayArticles.map((article, idx) => (
        <article
          key={`featured-${article.id}-${idx}`}
          onClick={() => navigate(`/news/${article.categorySlug}/${article.slug}`)}
          className="group cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all duration-300 hover:shadow-lg"
        >
          <div className="relative h-56 overflow-hidden">
            <ImageWithFallback
              src={article.thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <ArticleBadge type="FEATURED" score={showScores ? article.featuredPriority : undefined} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white/90 text-xs mb-2">
                {article.category} • {article.time}
              </div>
              <h3 className="text-white group-hover:text-[#EFB81A] transition-colors">
                {article.title}
              </h3>
            </div>
          </div>
          {article.summary && (
            <div className="p-4">
              <p className="text-gray-600 dark:text-[#A0A0A5] text-sm line-clamp-2">
                {article.summary}
              </p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
