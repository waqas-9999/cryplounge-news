import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArticleBadge } from './ArticleBadge';
import { PromotionArticle } from '../utils/promotions';

interface TrendingListProps {
  articles: PromotionArticle[];
  maxVisible?: number;
  showScores?: boolean;
}

export function TrendingList({ articles, maxVisible = 6, showScores = false }: TrendingListProps) {
  const navigate = useNavigate();
  const displayArticles = articles.slice(0, maxVisible);

  if (displayArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-[#A0A0A5]">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No trending articles at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayArticles.map((article, idx) => (
        <article
          key={`trending-${article.id}-${idx}`}
          onClick={() => navigate(`/news/${article.categorySlug}/${article.slug}`)}
          className="group cursor-pointer"
        >
          <div className="relative rounded-xl overflow-hidden mb-3 h-44">
            <ImageWithFallback
              src={article.thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <ArticleBadge type="TRENDING" score={showScores ? article.score : undefined} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="mb-2">
            <span className="text-[#EFB81A] text-xs">{article.category}</span>
            <span className="text-gray-400 dark:text-[#A0A0A5] text-xs ml-2">{article.time}</span>
          </div>
          <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug group-hover:text-[#EFB81A] transition-colors line-clamp-2">
            {article.title}
          </h3>
        </article>
      ))}
    </div>
  );
}
