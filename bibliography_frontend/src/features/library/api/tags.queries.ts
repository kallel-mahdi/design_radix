import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Tag, CreateTagInput, UpdateTagInput } from '@/common/types';
import { TagListSchema, TagSchema } from '@bibliography/shared';

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => [...tagKeys.lists()] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const
};

export function useTagsQuery() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: async (): Promise<Tag[]> => {
      const data = await apiClient.get<Tag[]>('/tags');
      return TagListSchema.parse(data);
    },
    staleTime: QUERY_STALE_TIME_MS
  });
}

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
  });
}

export function useRenameTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }): Promise<Tag> => {
      const response = await apiClient.patch<Tag>(`/tags/${oldName}`, {
        name: newName,
      });
      return TagSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag renamed successfully',
        type: 'success',
      });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      useUIStore.getState().addToast({
        message: 'Tag deleted successfully',
        type: 'success',
      });
    },
  });
}
