import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { referenceKeys } from './references.queries';
import { tagKeys } from './tags.queries';
import type { Reference, UpdateReferenceInput, CreateReferenceInput } from '@/common/types';
import { ReferenceSchema } from '@bibliography/shared';

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
    onError: (error: any) => {
      // Skip validation errors - already shown inline by react-hook-form
      if (error.code === 'VALIDATION_ERROR') return;

      useUIStore.getState().addToast({
        message: error.message || 'Failed to create reference',
        type: 'error',
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
      // Also invalidate tags since tag usageCount may have changed
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      // Skip validation errors - already shown inline by react-hook-form
      if (error.code === 'VALIDATION_ERROR') return;

      useUIStore.getState().addToast({
        message: error.message || 'Failed to update reference',
        type: 'error',
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
      // Also invalidate tags since tag usageCount may have changed
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference moved to trash',
        type: 'success',
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to delete reference',
        type: 'error',
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
      // Also invalidate tags since tag usageCount may have changed
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference restored successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to restore reference',
        type: 'error',
      });
    },
  });
}

/**
 * Add a reference to a collection.
 * Adds the collectionId to the reference's collectionIds array.
 */
export function useAddReferenceToCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referenceId,
      collectionId,
      currentCollectionIds,
    }: {
      referenceId: string;
      collectionId: string;
      currentCollectionIds: string[];
    }): Promise<Reference> => {
      // Don't add if already in collection
      if (currentCollectionIds.includes(collectionId)) {
        throw new Error('Reference is already in this collection');
      }

      const response = await apiClient.patch<Reference>(`/references/${referenceId}`, {
        collectionIds: [...currentCollectionIds, collectionId],
      });
      return ReferenceSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Reference added to collection',
        type: 'success',
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to add reference to collection',
        type: 'error',
      });
    },
  });
}
