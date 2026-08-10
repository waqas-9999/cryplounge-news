import { Skeleton } from '@/components/ui/skeleton';

/** Matches the ongoing/upcoming/ended event card: aspect-[16/9] banner + badge + title + meta. */
export function EventCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800"
      aria-hidden="true"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      aria-busy="true"
      aria-label="Loading events"
    >
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches the events page hero banner. */
export function EventHeroSkeleton() {
  return (
    <Skeleton
      className="h-[320px] sm:h-[400px] md:h-[500px] w-full rounded-xl sm:rounded-2xl"
      aria-hidden="true"
    />
  );
}

/** Full `/events` listing skeleton: header, filters, hero, and grids. */
export function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <div className="bg-white dark:bg-[#161618] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3">
        <div className="max-w-[1400px] mx-auto">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <main
        className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-12"
        aria-busy="true"
        aria-label="Loading events"
      >
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-96 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        <EventHeroSkeleton />

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <EventGridSkeleton count={3} />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <EventGridSkeleton count={4} />
        </div>
      </main>
    </div>
  );
}

/** Matches `EventDetailPage`'s layout: hero, meta row, body, sidebar. */
export function EventDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F10]" aria-busy="true" aria-label="Loading event">
      <Skeleton className="w-full h-[280px] md:h-[420px] rounded-none" />
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 md:h-10 w-full" />
              <Skeleton className="h-8 md:h-10 w-2/3" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
