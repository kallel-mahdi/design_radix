import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { apiClient } from '@/common/api/client';
import {
  useReferencesQuery,
  referenceKeys,
} from '../references.queries';
import {
  useCreateReferenceMutation,
  useUpdateReferenceMutation,
  useDeleteReferenceMutation,
  useRestoreReferenceMutation,
} from '../references.mutations';
import { useUIStore } from '@/store/ui.store';
import type { Reference } from '@/common/types';

// Mock the API client
vi.mock('@/common/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockReference: Reference = {
  _id: 'ref-123',
  userId: 'user-123',
  type: 'article',
  title: 'Test Article',
  authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
  year: 2024,
  venue: 'Test Conference',
  doi: '10.1234/test',
  isbn: null,
  url: null,
  abstract: null,
  citationKey: 'doe2024test',
  tags: [],
  collectionIds: [],
  hasPdf: false,
  pdf: null,
  sourceRaw: { provider: 'doi', payload: {} },
  deleted: false,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Reference Query Keys', () => {
  it('should generate correct query keys', () => {
    expect(referenceKeys.all).toEqual(['references']);
    expect(referenceKeys.lists()).toEqual(['references', 'list']);
    expect(referenceKeys.list({ collectionId: 'col-1' })).toEqual([
      'references',
      'list',
      { collectionId: 'col-1' },
    ]);
    expect(referenceKeys.details()).toEqual(['references', 'detail']);
    expect(referenceKeys.detail('ref-123')).toEqual(['references', 'detail', 'ref-123']);
  });
});

describe('useReferencesQuery', () => {
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

  it('should fetch references without filters', async () => {
    const mockData = [mockReference];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(() => useReferencesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/references?');
    expect(result.current.data).toEqual(mockData);
  });

  it('should fetch references with collection filter', async () => {
    const mockData = [mockReference];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(
      () => useReferencesQuery({ collectionId: 'col-123' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArg = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(callArg).toContain('collectionId=col-123');
  });

  it('should fetch references with tags filter', async () => {
    const mockData = [mockReference];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(
      () => useReferencesQuery({ tags: ['ml', 'nlp'] }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArg = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(callArg).toContain('tags=ml%2Cnlp');
  });

  it('should fetch references with deleted filter', async () => {
    const mockData = [mockReference];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(
      () => useReferencesQuery({ deleted: true }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArg = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(callArg).toContain('deleted=true');
  });

  it('should fetch references with pagination', async () => {
    const mockData = [mockReference];
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useReferencesQuery({ limit: 20, offset: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArg = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(callArg).toContain('limit=20');
    expect(callArg).toContain('offset=10');
  });
});

describe('useCreateReferenceMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Reset UI store toasts
    useUIStore.setState({ toasts: [] });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create a reference', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockReference as any);

    const { result } = renderHook(() => useCreateReferenceMutation(), { wrapper });

    result.current.mutate({
      type: 'article',
      title: 'Test Article',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/references', {
      type: 'article',
      title: 'Test Article',
    });
  });

  it('should show success toast on create', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockReference as any);

    const { result } = renderHook(() => useCreateReferenceMutation(), { wrapper });

    result.current.mutate({
      type: 'article',
      title: 'Test Article',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Reference created successfully');
    expect(toasts[0].type).toBe('success');
  });

  it('should invalidate queries on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockReference as any);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateReferenceMutation(), { wrapper });

    result.current.mutate({
      type: 'article',
      title: 'Test Article',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: referenceKeys.lists(),
    });
  });
});

describe('useUpdateReferenceMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    useUIStore.setState({ toasts: [] });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should update a reference', async () => {
    const updatedRef = { ...mockReference, title: 'Updated Title' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedRef as any);

    const { result } = renderHook(() => useUpdateReferenceMutation(), { wrapper });

    result.current.mutate({
      id: 'ref-123',
      data: { title: 'Updated Title' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/references/ref-123', { title: 'Updated Title' });
  });

  it('should show success toast on update', async () => {
    const updatedRef = { ...mockReference, title: 'Updated Title' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce(updatedRef as any);

    const { result } = renderHook(() => useUpdateReferenceMutation(), { wrapper });

    result.current.mutate({
      id: 'ref-123',
      data: { title: 'Updated Title' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Reference updated successfully');
  });
});

describe('useDeleteReferenceMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    useUIStore.setState({ toasts: [] });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should delete a reference', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(null as any);

    const { result } = renderHook(() => useDeleteReferenceMutation(), { wrapper });

    result.current.mutate('ref-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith('/references/ref-123');
  });

  it('should show success toast on delete', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(null as any);

    const { result } = renderHook(() => useDeleteReferenceMutation(), { wrapper });

    result.current.mutate('ref-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Reference moved to trash');
  });
});

describe('useRestoreReferenceMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    useUIStore.setState({ toasts: [] });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should restore a reference', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(null as any);

    const { result } = renderHook(() => useRestoreReferenceMutation(), { wrapper });

    result.current.mutate('ref-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/references/ref-123/restore');
  });

  it('should show success toast on restore', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(null as any);

    const { result } = renderHook(() => useRestoreReferenceMutation(), { wrapper });

    result.current.mutate('ref-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Reference restored successfully');
  });
});
