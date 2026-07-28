import React from 'react';
import { Skeleton } from './ui/skeleton';

// News Card Skeleton
export function NewsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

// Market Token Row Skeleton
export function TokenRowSkeleton() {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-800">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
    </tr>
  );
}

// Course Card Skeleton
export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Event Card Skeleton
export function EventCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

// Founder Profile Skeleton
export function FounderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Skeleton className="w-full h-56" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton (flexible rows)
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-800">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4 mb-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />
      <div className="flex items-center gap-4 mt-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Grid Skeleton (flexible grid layout)
export function GridSkeleton({ 
  count = 6, 
  SkeletonComponent = NewsCardSkeleton,
  columns = 3 
}: { 
  count?: number; 
  SkeletonComponent?: React.ComponentType;
  columns?: number;
}) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[3]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
