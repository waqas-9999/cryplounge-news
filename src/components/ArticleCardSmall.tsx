'use client';

interface ArticleCardSmallProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  articleSlug: string;
  onNavigate?: (page: string) => void;
}

export function ArticleCardSmall({ category, categorySlug, time, title, articleSlug, onNavigate }: ArticleCardSmallProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`news/${categorySlug}/${articleSlug}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-gray-50 dark:bg-[#202225] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-white/[0.08] transition-colors hover:border-gray-200 dark:hover:border-yellow-500/30 cursor-pointer group"
    >
      <div className="mb-2 md:mb-3">
        <span className="text-blue-600 dark:text-yellow-400 text-xs md:text-sm">{category}</span>
        <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
      </div>
      
      <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors">
        {title}
      </h3>
    </div>
  );
}
