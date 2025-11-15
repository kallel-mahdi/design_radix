import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Reference, UpdateReferenceInput, CreateReferenceInput } from '@/common/types';
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

export function useReferencesQuery(params?: ReferencesQueryParams) {
  return useQuery({
    queryKey: referenceKeys.list(params || {}),
    queryFn: async (): Promise<Reference[]> => {
      const queryParams = new URLSearchParams();
      if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
      if (params?.tags) queryParams.append('tags', params.tags.join(','));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.deleted !== undefined) queryParams.append('deleted', String(params.deleted));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));

      const data = await apiClient.get<Reference[]>(`/references?${queryParams}`);
      return ReferenceListSchema.parse(data);
    },
    staleTime: QUERY_STALE_TIME_MS
  });
}

export function useCreateReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReferenceInput): Promise<Reference> => {
      const response = await apiClient.post<Reference>('/references', data);
      return ReferenceSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference created successfully',
        type: 'success',
      });
    },
  });
}

export function useUpdateReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReferenceInput }): Promise<Reference> => {
      const response = await apiClient.patch<Reference>(`/references/${id}`, data);
      return ReferenceSchema.parse(response);
    },
    onSuccess: (updatedRef) => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referenceKeys.detail(updatedRef._id) });
      useUIStore.getState().addToast({
        message: 'Reference updated successfully',
        type: 'success',
      });
    },
  });
}

export function useDeleteReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/references/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference moved to trash',
        type: 'success',
      });
    },
  });
}

export function useRestoreReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.patch(`/references/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference restored successfully',
        type: 'success',
      });
    },
  });
}
