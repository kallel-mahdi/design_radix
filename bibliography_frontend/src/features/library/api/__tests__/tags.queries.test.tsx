import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { apiClient } from '@/common/api/client';
import {
  useTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useSetTagColorMutation,
  useRenameTagMutation,
  useDeleteTagMutation,
  tagKeys,
} from '../tags.queries';
import { useUIStore } from '@/store/ui.store';
import type { Tag } from '@/common/types';

// Mock the API client
vi.mock('@/common/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTag: Tag = {
  _id: 'tag-123',
  userId: 'user-123',
  name: 'Machine Learning',
  color: '#3b82f6',
  position: 0,
  automatic: false,
  usageCount: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Tag Query Keys', () => {
  it('should generate correct query keys', () => {
    expect(tagKeys.all).toEqual(['tags']);
    expect(tagKeys.lists()).toEqual(['tags', 'list']);
    expect(tagKeys.list()).toEqual(['tags', 'list']);
    expect(tagKeys.details()).toEqual(['tags', 'detail']);
    expect(tagKeys.detail('tag-123')).toEqual(['tags', 'detail', 'tag-123']);
  });
});

describe('useTagsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch tags successfully', async () => {
    const mockTags = [mockTag];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockTags);

    const { result } = renderHook(() => useTagsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/tags');
    expect(result.current.data).toEqual(mockTags);
  });

  it('should handle fetch error', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTagsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateTagMutation', () => {
  let queryClient: QueryClient;
  let addToastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    addToastSpy = vi.fn();
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      addToast: addToastSpy,
    } as any);
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create tag successfully', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockTag);

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper });

    result.current.mutate({ name: 'Machine Learning', color: '#3b82f6' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/tags', {
      name: 'Machine Learning',
      color: '#3b82f6',
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Tag created successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockTag);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper });

    result.current.mutate({ name: 'Test Tag' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tagKeys.lists() });
  });
});

describe('useUpdateTagMutation', () => {
  let queryClient: QueryClient;
  let addToastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    addToastSpy = vi.fn();
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      addToast: addToastSpy,
    } as any);
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should update tag successfully', async () => {
    const updatedTag = { ...mockTag, name: 'Updated Tag' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedTag);

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper });

    result.current.mutate({
      id: 'tag-123',
      data: { name: 'Updated Tag' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/tags/tag-123', {
      name: 'Updated Tag',
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Tag updated successfully',
      type: 'success',
    });
  });

  it('should invalidate both list and detail queries on success', async () => {
    const updatedTag = { ...mockTag, _id: 'tag-123' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedTag);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper });

    result.current.mutate({
      id: 'tag-123',
      data: { name: 'Updated' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tagKeys.lists() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tagKeys.detail('tag-123') });
  });
});

describe('useSetTagColorMutation', () => {
  let queryClient: QueryClient;
  let addToastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    addToastSpy = vi.fn();
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      addToast: addToastSpy,
    } as any);
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should set tag color successfully', async () => {
    const updatedTag = { ...mockTag, color: '#ef4444', position: 1 };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedTag);

    const { result } = renderHook(() => useSetTagColorMutation(), { wrapper });

    result.current.mutate({
      name: 'Machine Learning',
      color: '#ef4444',
      position: 1,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/tags/Machine Learning/color', {
      color: '#ef4444',
      position: 1,
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Tag color updated successfully',
      type: 'success',
    });
  });

  it('should handle null color (remove color)', async () => {
    const updatedTag = { ...mockTag, color: null };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedTag);

    const { result } = renderHook(() => useSetTagColorMutation(), { wrapper });

    result.current.mutate({
      name: 'Machine Learning',
      color: null,
      position: null,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/tags/Machine Learning/color', {
      color: null,
      position: null,
    });
  });
});

describe('useRenameTagMutation', () => {
  let queryClient: QueryClient;
  let addToastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    addToastSpy = vi.fn();
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      addToast: addToastSpy,
    } as any);
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should rename tag successfully', async () => {
    const renamedTag = { ...mockTag, name: 'Deep Learning' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(renamedTag);

    const { result } = renderHook(() => useRenameTagMutation(), { wrapper });

    result.current.mutate({
      oldName: 'Machine Learning',
      newName: 'Deep Learning',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/tags/Machine Learning/rename', {
      newName: 'Deep Learning',
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Tag renamed successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(mockTag);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRenameTagMutation(), { wrapper });

    result.current.mutate({
      oldName: 'Old Name',
      newName: 'New Name',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tagKeys.lists() });
  });
});

describe('useDeleteTagMutation', () => {
  let queryClient: QueryClient;
  let addToastSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    addToastSpy = vi.fn();
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      addToast: addToastSpy,
    } as any);
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should delete tag successfully', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper });

    result.current.mutate('tag-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith('/tags/tag-123');
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Tag deleted successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper });

    result.current.mutate('tag-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tagKeys.lists() });
  });
});
