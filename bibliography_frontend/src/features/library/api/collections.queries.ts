import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Collection } from '@/common/types';
import { CollectionListSchema } from '@bibliography/shared';

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
      const parsed = CollectionListSchema.parse(data);
      // Filter out deleted collections - they should only appear in trash view
      return parsed.filter(collection => !collection.deleted);
    },
    staleTime: QUERY_STALE_TIME_MS
  });
}
