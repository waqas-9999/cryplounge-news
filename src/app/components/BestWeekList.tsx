import { useNavigate } from 'react-router-dom';
import { Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArticleBadge } from './ArticleBadge';
import { PromotionArticle } from '../utils/promotions';

interface BestWeekListProps {
  articles: PromotionArticle[];
  maxVisible?: number;
  showScores?: boolean;
}

export function BestWeekList({ articles, maxVisible = 5, showScores = false }: BestWeekListProps) {
  const navigate = useNavigate();
  const displayArticles = articles.slice(0, maxVisible);

  if (displayArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-[#A0A0A5]">
        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No best of week articles selected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayArticles.map((article, idx) => (
        <article
          key={`best-week-${article.id}-${idx}`}
          onClick={() => navigate(`/news/${article.categorySlug}/${article.slug}`)}
          className="group cursor-pointer flex gap-4 items-start p-4 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
            {idx + 1}
          </div>
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={article.thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <ArticleBadge type="BEST WEEK" score={showScores ? article.score : undefined} />
            </div>
            <div className="mb-2">
              <span className="text-[#EFB81A] text-xs">{article.category}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs ml-2">{article.time}</span>
            </div>
            <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug group-hover:text-[#EFB81A] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </div>
        </article>
      ))}
    </div>
  );
}
