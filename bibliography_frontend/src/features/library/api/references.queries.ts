import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '@/common/api/client';

export interface Reference {
  _id: string;
  userId: string;
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other';
  title: string;
  authors: Array<{ given: string; family: string; full: string }>;
  year: number | null;
  venue: string | null;
  doi: string | null;
  isbn: string | null;
  url: string | null;
  abstract: string | null;
  tags: string[];
  collectionIds: string[];
  citationKey: string;
  hasPdf: boolean;
  pdf?: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  };
  sourceRaw: {
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual';
    payload: any;
  };
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const referenceKeys = {
  all: ['references'] as const,
  lists: () => [...referenceKeys.all, 'list'] as const,
  list: (filters: any) => [...referenceKeys.lists(), filters] as const,
  details: () => [...referenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...referenceKeys.details(), id] as const
};

export function useReferencesQuery(params?: {
  collectionId?: string;
  tags?: string[];
  deleted?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: referenceKeys.list(params || {}),
    queryFn: async (): Promise<Reference[]> => {
      const queryParams = new URLSearchParams();
      if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
      if (params?.tags) queryParams.append('tags', params.tags.join(','));
      if (params?.deleted !== undefined) queryParams.append('deleted', String(params.deleted));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));

      const response = await apiClient.get<ApiResponse<Reference[]>>(`/references?${queryParams}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any): Promise<Reference> => {
      const response = await apiClient.post<ApiResponse<Reference>>('/references', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
    }
  });
}
