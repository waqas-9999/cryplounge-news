import { Skeleton } from '@/components/ui/skeleton';
import { NewsCardSkeleton } from './NewsCardSkeleton';

/** A horizontally-scrolling row of cards, mirroring the homepage's "Latest" / "Most Read" / "Market" rails. */
function CardRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 md:gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-64 md:w-72 flex-shrink-0">
          <NewsCardSkeleton />
        </div>
      ))}
    </div>
  );
}

/**
 * Homepage skeleton: hero/featured block plus the horizontally-scrolling
 * "Latest", "Most Read" and "Market" rails. Used as the `/` route-level
 * `loading.tsx` and as `HomePage`'s own fallback while articles load.
 */
export function HomePageSkeleton() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-10 md:space-y-14" aria-busy="true" aria-label="Loading homepage">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="w-full h-64 md:h-96 rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <CardRailSkeleton />
        </div>
      ))}
    </main>
  );
}
