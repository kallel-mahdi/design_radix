import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Reference } from '@/common/types';
import { ReferenceListSchema, ReferenceSchema } from '@bibliography/shared';

export interface ReferencesQueryParams {
  collectionId?: string;
  tags?: string[];
  search?: string;
  deleted?: boolean;
  limit?: number;
  offset?: number;
}

export const referenceKeys = {
  all: ['references'] as const,
  lists: () => [...referenceKeys.all, 'list'] as const,
  list: (filters: ReferencesQueryParams = {}) => [...referenceKeys.lists(), filters] as const,
  details: () => [...referenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...referenceKeys.details(), id] as const
};

// Shared query function for both hooks
const fetchReferences = async (params?: ReferencesQueryParams): Promise<Reference[]> => {
  const queryParams = new URLSearchParams();
  if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
  if (params?.tags) queryParams.append('tags', params.tags.join(','));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.deleted !== undefined) queryParams.append('deleted', String(params.deleted));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.offset) queryParams.append('offset', String(params.offset));

  const response = await apiClient.get<Reference[]>(`/references?${queryParams}`);
  return ReferenceListSchema.parse(response);
};

export function useReferencesQuery(params?: ReferencesQueryParams) {
  return useQuery({
    queryKey: referenceKeys.list(params || {}),
    queryFn: () => fetchReferences(params),
    staleTime: QUERY_STALE_TIME_MS
  });
}

/**
 * Suspense-enabled version of useReferencesQuery
 * Use with <Suspense> boundary for cleaner loading states
 */
export function useSuspenseReferencesQuery(params?: ReferencesQueryParams) {
  return useSuspenseQuery({
    queryKey: referenceKeys.list(params || {}),
    queryFn: () => fetchReferences(params),
    staleTime: QUERY_STALE_TIME_MS
  });
}

export function useReferenceQuery(id: string | undefined, enabled = true) {
  return useQuery({
    // Use generic detail key when id is undefined to avoid creating ['references','detail',undefined] cache entries
    queryKey: id ? referenceKeys.detail(id) : referenceKeys.details(),
    queryFn: async (): Promise<Reference> => {
      if (!id) throw new Error('Reference ID is required');
      const response = await apiClient.get<Reference>(`/references/${id}`);
      return ReferenceSchema.parse(response);
    },
    enabled: enabled && !!id,
    staleTime: QUERY_STALE_TIME_MS
  });
}
