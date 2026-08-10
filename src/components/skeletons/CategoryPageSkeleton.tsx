import { Skeleton } from '@/components/ui/skeleton';
import { FeaturedArticleSkeleton, LatestNewsRowSkeleton, NewsGridSkeleton } from './NewsCardSkeleton';

/**
 * Matches `CategoryNewsPage` / `AllNewsView`'s layout: a back button, a
 * featured article + "latest" list two-column block, and a trailing grid of
 * "more articles" cards. Used both as the `/news` and `/news/[category]`
 * route-level `loading.tsx`, and as the in-page pagination fallback.
 */
export function CategoryPageSkeleton() {
  return (
    <main
      className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12"
      aria-busy="true"
      aria-label="Loading news"
    >
      <Skeleton className="h-9 w-32" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <FeaturedArticleSkeleton />

          <div>
            <Skeleton className="h-6 w-40 mb-4 md:mb-6" />
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <LatestNewsRowSkeleton />
                  {i < 4 && <div className="h-px bg-gray-100 dark:bg-white/[0.08] mt-3 md:mt-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <Skeleton className="h-40 w-full rounded-xl md:rounded-2xl" />
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-48 mb-4 md:mb-6" />
        <NewsGridSkeleton count={8} />
      </div>
    </main>
  );
}
