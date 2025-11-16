import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { QUERY_STALE_TIME_MS } from '@/common/constants';
import type { Tag } from '@/common/types';
import { TagListSchema } from '@bibliography/shared';

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
