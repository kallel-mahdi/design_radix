import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { tagKeys } from './tags.queries';
import { referenceKeys } from './references.queries';
import type { Tag, CreateTagInput, UpdateTagInput } from '@/common/types';
import { TagSchema } from '@bibliography/shared';

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTagInput): Promise<Tag> => {
      const response = await apiClient.post<Tag>('/tags', data);
      return TagSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag created successfully',
        type: 'success',
      });
    },
    onError: (error: ApiError) => {
      if (error.code === 'VALIDATION_ERROR') return;

      useUIStore.getState().addToast({
        message: error.message || 'Failed to create tag',
        type: 'error',
      });
    },
  });
}

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTagInput }): Promise<Tag> => {
      const response = await apiClient.patch<Tag>(`/tags/${id}`, data);
      return TagSchema.parse(response);
    },
    onSuccess: (updatedTag) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(updatedTag._id) });
      useUIStore.getState().addToast({
        message: 'Tag updated successfully',
        type: 'success',
      });
    },
    onError: (error: ApiError) => {
      if (error.code === 'VALIDATION_ERROR') return;

      useUIStore.getState().addToast({
        message: error.message || 'Failed to update tag',
        type: 'error',
      });
    },
  });
}

export function useSetTagColorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      color,
      position,
    }: {
      name: string;
      color: string | null;
      position: number | null;
    }): Promise<Tag> => {
      const response = await apiClient.patch<Tag>(`/tags/${name}/color`, {
        color,
        position,
      });
      return TagSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag color updated successfully',
        type: 'success',
      });
    },
    onError: (error: ApiError) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to update tag color',
        type: 'error',
      });
    },
  });
}

export function useRenameTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }): Promise<Tag> => {
      const response = await apiClient.patch<Tag>(`/tags/${oldName}/rename`, {
        newName,
      });
      return TagSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // Also invalidate references since backend renames tag in all references
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag renamed successfully',
        type: 'success',
      });
    },
    onError: (error: ApiError) => {
      if (error.code === 'VALIDATION_ERROR') return;

      useUIStore.getState().addToast({
        message: error.message || 'Failed to rename tag',
        type: 'error',
      });
    },
  });
}

/**
 * Delete tag by ID.
 * Note: Uses ObjectId (_id) instead of tag name for RESTful consistency.
 * Backend route: DELETE /api/bibliography/tags/:id
 */
export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // Also invalidate references since backend removes this tag from all references
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag deleted successfully',
        type: 'success',
      });
    },
    onError: (error: ApiError) => {
      useUIStore.getState().addToast({
        message: error.message || 'Failed to delete tag',
        type: 'error',
      });
    },
  });
}
