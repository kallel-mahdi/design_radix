/**
 * Reference Card Skeleton
 *
 * Loading placeholder for ReferenceCard
 */

import { Skeleton } from '@/components/ui/Skeleton';

export function ReferenceCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4">
      {/* Title skeleton */}
      <Skeleton className="h-5 w-3/4" />

      {/* Authors skeleton */}
      <Skeleton className="h-4 w-1/2" />

      {/* Venue and year skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  );
}
