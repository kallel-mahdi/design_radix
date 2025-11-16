import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { apiClient } from '@/common/api/client';
import {
  useCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useRestoreCollectionMutation,
  collectionKeys,
} from '../collections.queries';
import { useUIStore } from '@/store/ui.store';
import type { Collection } from '@/common/types';

// Mock the API client
vi.mock('@/common/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCollection: Collection = {
  _id: 'col-123',
  userId: 'user-123',
  name: 'Research Papers',
  parentId: null,
  position: 0,
  color: '#3b82f6',
  deleted: false,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Collection Query Keys', () => {
  it('should generate correct query keys', () => {
    expect(collectionKeys.all).toEqual(['collections']);
    expect(collectionKeys.lists()).toEqual(['collections', 'list']);
    expect(collectionKeys.list()).toEqual(['collections', 'list']);
    expect(collectionKeys.details()).toEqual(['collections', 'detail']);
    expect(collectionKeys.detail('col-123')).toEqual(['collections', 'detail', 'col-123']);
  });
});

describe('useCollectionsQuery', () => {
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

  it('should fetch collections successfully', async () => {
    const mockCollections = [mockCollection];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockCollections);

    const { result } = renderHook(() => useCollectionsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/collections');
    expect(result.current.data).toEqual(mockCollections);
  });

  it('should filter out deleted collections', async () => {
    const mockCollections = [
      mockCollection,
      { ...mockCollection, _id: 'col-deleted', deleted: true },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockCollections);

    const { result } = renderHook(() => useCollectionsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should only return non-deleted collection
    expect(result.current.data).toEqual([mockCollection]);
    expect(result.current.data).toHaveLength(1);
  });

  it('should handle fetch error', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCollectionsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateCollectionMutation', () => {
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

  it('should create collection successfully', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockCollection);

    const { result } = renderHook(() => useCreateCollectionMutation(), { wrapper });

    result.current.mutate({ name: 'Research Papers', color: '#3b82f6' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/collections', {
      name: 'Research Papers',
      color: '#3b82f6',
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Collection created successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockCollection);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateCollectionMutation(), { wrapper });

    result.current.mutate({ name: 'Test Collection' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: collectionKeys.lists() });
  });
});

describe('useUpdateCollectionMutation', () => {
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

  it('should update collection successfully', async () => {
    const updatedCollection = { ...mockCollection, name: 'Updated Collection' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedCollection);

    const { result } = renderHook(() => useUpdateCollectionMutation(), { wrapper });

    result.current.mutate({
      id: 'col-123',
      data: { name: 'Updated Collection' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/collections/col-123', {
      name: 'Updated Collection',
    });
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Collection updated successfully',
      type: 'success',
    });
  });

  it('should invalidate both list and detail queries on success', async () => {
    const updatedCollection = { ...mockCollection, _id: 'col-123' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedCollection);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateCollectionMutation(), { wrapper });

    result.current.mutate({
      id: 'col-123',
      data: { name: 'Updated' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: collectionKeys.lists() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: collectionKeys.detail('col-123') });
  });
});

describe('useDeleteCollectionMutation', () => {
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

  it('should delete collection successfully', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteCollectionMutation(), { wrapper });

    result.current.mutate('col-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith('/collections/col-123');
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Collection deleted successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteCollectionMutation(), { wrapper });

    result.current.mutate('col-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: collectionKeys.lists() });
  });
});

describe('useRestoreCollectionMutation', () => {
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

  it('should restore collection successfully', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRestoreCollectionMutation(), { wrapper });

    result.current.mutate('col-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/collections/col-123/restore');
    expect(addToastSpy).toHaveBeenCalledWith({
      message: 'Collection restored successfully',
      type: 'success',
    });
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(undefined);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRestoreCollectionMutation(), { wrapper });

    result.current.mutate('col-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: collectionKeys.lists() });
  });
});
