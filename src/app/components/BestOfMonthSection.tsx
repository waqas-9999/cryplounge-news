import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

interface Article {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  image: string;
  articleSlug: string;
}

interface BestOfMonthSectionProps {
  title?: string;
  featuredArticle: Article;
  sideArticles: Article[];
  onNavigate?: (page: string) => void;
}

export function BestOfMonthSection({ title = "BEST OF THE MONTH", featuredArticle, sideArticles, onNavigate }: BestOfMonthSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
          <span className="text-yellow-900 dark:text-yellow-300 text-xs md:text-sm">{title}</span>
        </div>
        <button className="text-xs md:text-sm text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
          View more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Featured Article - Large */}
        <div 
          onClick={() => onNavigate && onNavigate(`news/${featuredArticle.categorySlug}/${featuredArticle.articleSlug}`)}
          className="lg:col-span-2 bg-white dark:bg-[#1E1E20] rounded-2xl md:rounded-3xl overflow-hidden relative border border-gray-100 dark:border-white/[0.08] transition-colors cursor-pointer hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 group"
        >
          <div className="relative h-[300px] md:h-[400px]">
            <ImageWithFallback 
              src={featuredArticle.image}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
              <div className="mb-2 md:mb-3">
                <span className="text-xs md:text-sm">{featuredArticle.category}</span>
                <span className="text-xs md:text-sm ml-2 opacity-70">{featuredArticle.time}</span>
              </div>
              
              <h2 className="text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 leading-tight">
                {featuredArticle.title}
              </h2>
              
              <button className="flex items-center gap-2 text-white text-sm md:text-base">
                Read article
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Side Articles Grid */}
        <div className="space-y-3 md:space-y-4">
          {sideArticles.map((article, idx) => (
            <div 
              key={idx} 
              onClick={() => onNavigate && onNavigate(`news/${article.categorySlug}/${article.articleSlug}`)}
              className="flex gap-3 md:gap-4 items-start bg-white dark:bg-[#1E1E20] rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-white/[0.08] transition-all hover:shadow-lg dark:hover:shadow-yellow-500/10 dark:hover:border-yellow-500/30 cursor-pointer group"
            >
              <div className="flex-1">
                <div className="mb-1 md:mb-2">
                  <span className="text-blue-600 dark:text-yellow-400 text-xs md:text-sm">{article.category}</span>
                  <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{article.time}</span>
                </div>
                <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors">
                  {article.title}
                </h4>
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}