/**
 * Annotation Mutations - React Query hooks for creating/updating/deleting PDF annotations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { annotationKeys } from './annotations.queries';
import type { Annotation, CreateAnnotationInput, UpdateAnnotationInput } from '@/common/types';
import { AnnotationSchema } from '@bibliography/shared';

/**
 * Create a new annotation
 */
export function useCreateAnnotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referenceId,
      data,
    }: {
      referenceId: string;
      data: CreateAnnotationInput;
    }): Promise<Annotation> => {
      const response = await apiClient.post<Annotation>(
        `/references/${referenceId}/annotations`,
        data
      );
      return AnnotationSchema.parse(response);
    },
    onSuccess: (_, { referenceId }) => {
      queryClient.invalidateQueries({
        queryKey: annotationKeys.listByReference(referenceId),
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to create annotation',
        type: 'error',
      });
    },
  });
}

/**
 * Update an existing annotation
 */
export function useUpdateAnnotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      annotationId,
      data,
    }: {
      annotationId: string;
      referenceId: string;
      data: UpdateAnnotationInput;
    }): Promise<Annotation> => {
      const response = await apiClient.patch<Annotation>(
        `/annotations/${annotationId}`,
        data
      );
      return AnnotationSchema.parse(response);
    },
    onSuccess: (_data, { referenceId }) => {
      queryClient.invalidateQueries({
        queryKey: annotationKeys.listByReference(referenceId),
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to update annotation',
        type: 'error',
      });
    },
  });
}

/**
 * Delete an annotation
 */
export function useDeleteAnnotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      annotationId,
    }: {
      annotationId: string;
      referenceId: string;
    }): Promise<void> => {
      await apiClient.delete(`/annotations/${annotationId}`);
    },
    onSuccess: (_data, { referenceId }) => {
      queryClient.invalidateQueries({
        queryKey: annotationKeys.listByReference(referenceId),
      });
      useUIStore.getState().addToast({
        message: 'Annotation deleted',
        type: 'success',
      });
    },
    onError: (error: any) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to delete annotation',
        type: 'error',
      });
    },
  });
}
