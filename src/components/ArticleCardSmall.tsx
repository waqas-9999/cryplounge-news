'use client';

import Link from 'next/link';
interface ArticleCardSmallProps {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  articleSlug: string;
  /** @deprecated Navigation is handled by the card's own <Link>. Kept so existing call sites still compile. */
  onNavigate?: (page: string) => void;
}

export function ArticleCardSmall({ category, categorySlug, time, title, articleSlug }: ArticleCardSmallProps) {
  // A real URL, so the card is a crawlable <a> rather than a click handler.
  const href = `/news/${categorySlug}/${articleSlug}`;

  return (
    <Link
      href={href}
      className="block bg-gray-50 dark:bg-[#202225] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-white/[0.08] transition-colors hover:border-gray-200 dark:hover:border-yellow-500/30 cursor-pointer group"
    >
      <div className="mb-2 md:mb-3">
        <span className="text-blue-600 dark:text-yellow-400 text-xs md:text-sm">{category}</span>
        <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">{time}</span>
      </div>
      
      <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors">
        {title}
      </h3>
    </Link>
  );
}
