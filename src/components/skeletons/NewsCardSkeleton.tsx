import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors `TrendingCard`'s dimensions: aspect-[4/3] image, category/time line, title, tags. */
export function NewsCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-4 md:p-5 space-y-2 md:space-y-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

/** Responsive grid of `NewsCardSkeleton` — matches the "More Articles" grid (1/2/4 cols). */
export function NewsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      aria-busy="true"
      aria-label="Loading articles"
    >
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Mirrors `LatestNewsCard`'s dimensions: text left, thumbnail right. */
export function LatestNewsRowSkeleton() {
  return (
    <div className="flex gap-3 md:gap-4 items-start" aria-hidden="true">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl flex-shrink-0" />
    </div>
  );
}

/** Mirrors the hero/featured-article block used atop category and article-listing pages. */
export function FeaturedArticleSkeleton() {
  return (
    <div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800"
      aria-hidden="true"
    >
      <div className="mb-3 md:mb-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-3 mb-4 md:mb-6">
        <Skeleton className="h-8 md:h-10 w-full" />
        <Skeleton className="h-8 md:h-10 w-3/4" />
      </div>
      <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <Skeleton className="h-9 w-32 mb-6 md:mb-8" />
      <Skeleton className="w-full h-48 md:h-64 rounded-xl md:rounded-2xl" />
    </div>
  );
}
