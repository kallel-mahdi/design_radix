/**
 * React Query (TanStack Query) Configuration
 *
 * Global defaults for all queries and mutations.
 * These can be overridden per-query if needed.
 */

import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME_MS, QUERY_GC_TIME_MS, QUERY_RETRY_COUNT } from '../constants';

/**
 * Default Query Client Configuration
 *
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime: 10 minutes - unused data is garbage collected after 10 minutes
 * - retry: 1 - only retry failed requests once (not 3 times)
 * - refetchOnWindowFocus: false - don't refetch when user returns to tab
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      retry: QUERY_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // Don't retry mutations (they modify data)
    },
  },
};

/**
 * Create a new QueryClient instance with optimized defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
