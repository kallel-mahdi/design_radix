/**
 * Reference Table Skeleton
 *
 * Loading placeholder for ReferenceTable
 */

import { Skeleton } from '@/components/ui/Skeleton';

interface ReferenceTableSkeletonProps {
  rows?: number;
}

export function ReferenceTableSkeleton({ rows = 10 }: ReferenceTableSkeletonProps) {
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-app-border bg-app-surface">
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Title</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Authors</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Year</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Type</th>
            <th className="px-3 py-3 text-left text-sm font-medium text-app-text-primary">Tags</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-app-border"
            >
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-full max-w-md" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
