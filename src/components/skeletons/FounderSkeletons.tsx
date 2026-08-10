import { Skeleton } from '@/components/ui/skeleton';

/** Matches the founder story card grid used on `/founders` ("aspect-[16/10]" image + title + tags). */
export function FounderCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800"
      aria-hidden="true"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function FounderGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      aria-busy="true"
      aria-label="Loading founder stories"
    >
      {Array.from({ length: count }).map((_, i) => (
        <FounderCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches the featured-founder hero block: image left, bio/quote right. */
export function FounderHeroSkeleton() {
  return (
    <div
      className="bg-[#F9D96A] dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl overflow-hidden border-2 border-[#EFB81A] dark:border-[#EFB81A]/40"
      aria-hidden="true"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Skeleton className="aspect-[4/3] lg:aspect-auto lg:h-full w-full rounded-none" />
        <div className="p-6 md:p-8 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

/** Full `/founders` listing skeleton. */
export function FoundersPageSkeleton() {
  return (
    <main
      className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12"
      aria-busy="true"
      aria-label="Loading founders"
    >
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-96 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <FounderHeroSkeleton />

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <FounderGridSkeleton count={6} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </main>
  );
}

/** Matches `FounderDetailPage`'s layout: image, title, body, sidebar. */
export function FounderDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F10]" aria-busy="true" aria-label="Loading founder story">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 md:h-10 w-full" />
              <Skeleton className="h-8 md:h-10 w-2/3" />
            </div>
            <Skeleton className="w-full aspect-video rounded-2xl" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
