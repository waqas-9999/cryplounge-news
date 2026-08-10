import { Skeleton } from '@/components/ui/skeleton';

/**
 * Matches `ArticleDetailPage`'s layout: breadcrumb, category/date, title,
 * tags, share row, featured image, body paragraphs, author box, and the
 * right-column sidebar (featured news + more-in-category cards).
 */
export function ArticleDetailSkeleton() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F10]" aria-busy="true" aria-label="Loading article">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <Skeleton className="h-5 w-16 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <article className="lg:col-span-2 space-y-6 md:space-y-8">
            <header className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-8 md:h-12 w-full" />
                <Skeleton className="h-8 md:h-12 w-4/5" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-3.5 w-14" />
                <Skeleton className="h-3.5 w-14" />
                <Skeleton className="h-3.5 w-14" />
              </div>

              <div className="flex items-center gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-lg" />
                ))}
              </div>
            </header>

            <Skeleton className="w-full aspect-video rounded-2xl" />

            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>

            <div className="bg-[#F4F4F4] dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-6 md:space-y-8 pt-16 md:pt-20">
            <div>
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="w-full h-48 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 mb-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
