import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@/common/types';
import { CollectionListSchema, CollectionSchema } from '@bibliography/shared';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: () => [...collectionKeys.lists()] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const
};

export function useCollectionsQuery() {
  return useQuery({
    queryKey: collectionKeys.list(),
    queryFn: async (): Promise<Collection[]> => {
      const data = await apiClient.get<Collection[]>('/collections');
      return CollectionListSchema.parse(data);
    },
    staleTime: QUERY_STALE_TIME_MS
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCollectionInput): Promise<Collection> => {
      const response = await apiClient.post<Collection>('/collections', data);
      return CollectionSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Collection created successfully',
        type: 'success',
      });
    },
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCollectionInput }): Promise<Collection> => {
      const response = await apiClient.patch<Collection>(`/collections/${id}`, data);
      return CollectionSchema.parse(response);
    },
    onSuccess: (updatedCollection) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(updatedCollection._id) });
      useUIStore.getState().addToast({
        message: 'Collection updated successfully',
        type: 'success',
      });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Collection deleted successfully',
        type: 'success',
      });
    },
  });
}

export function useRestoreCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.patch(`/collections/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Collection restored successfully',
        type: 'success',
      });
    },
  });
}
