/**
 * React Query (TanStack Query) Configuration
 *
 * Global defaults for all queries and mutations.
 * These can be overridden per-query if needed.
 */

import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME_MS, QUERY_GC_TIME_MS, QUERY_RETRY_COUNT, QUERY_RETRY_DELAY_MS } from '../constants';

/**
 * Determine if an error is retryable (handles startup race condition)
 *
 * Only retry on network errors (connection refused, timeouts).
 * Don't retry on:
 * - HTTP 4xx errors (client errors, auth, validation)
 * - HTTP 5xx errors (server errors that aren't transient)
 */
function isRetryableError(error: unknown): boolean {
  // Check if it's an API error with HTTP status code
  if (error instanceof Object && 'code' in error) {
    const apiError = error as any;
    // Retry only on network errors and timeouts
    return apiError.code === 'NETWORK_ERROR' || apiError.code === 'TIMEOUT' || apiError.code === 'SERVER_STARTING';
  }
  return false;
}

/**
 * Exponential backoff retry delay
 *
 * Sequence: 500ms -> 1000ms -> 2000ms
 * Total retry window: ~3.5 seconds (covers typical backend startup time of 2-5s)
 *
 * @param attemptIndex - 0-based retry attempt number (0 = first retry)
 * @returns Delay in milliseconds
 */
function getRetryDelay(attemptIndex: number): number {
  return Math.min(QUERY_RETRY_DELAY_MS * Math.pow(2, attemptIndex), 5000);
}

/**
 * Default Query Client Configuration
 *
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime: 10 minutes - unused data is garbage collected after 10 minutes
 * - retry: Smart retry function - retries 3 times on network errors with exponential backoff
 * - retryDelay: Exponential backoff (500ms, 1s, 2s)
 * - refetchOnWindowFocus: false - don't refetch when user returns to tab
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      retry: (failureCount, error) => {
        // Only retry network-related errors, up to QUERY_RETRY_COUNT times
        return failureCount < QUERY_RETRY_COUNT && isRetryableError(error);
      },
      retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
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
