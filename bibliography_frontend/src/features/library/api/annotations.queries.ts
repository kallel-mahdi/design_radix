/**
 * Annotation Queries - React Query hooks for fetching PDF annotations
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Annotation } from '@/common/types';
import { AnnotationListSchema } from '@bibliography/shared';

export const annotationKeys = {
  all: ['annotations'] as const,
  lists: () => [...annotationKeys.all, 'list'] as const,
  listByReference: (referenceId: string) => [...annotationKeys.lists(), referenceId] as const,
  details: () => [...annotationKeys.all, 'detail'] as const,
  detail: (id: string) => [...annotationKeys.details(), id] as const,
};

/**
 * Fetch all annotations for a reference
 */
export function useAnnotationsQuery(referenceId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: annotationKeys.listByReference(referenceId || ''),
    queryFn: async (): Promise<Annotation[]> => {
      const response = await apiClient.get<Annotation[]>(
        `/references/${referenceId}/annotations`
      );
      return AnnotationListSchema.parse(response);
    },
    enabled: enabled && !!referenceId,
    staleTime: QUERY_STALE_TIME_MS,
  });
}
