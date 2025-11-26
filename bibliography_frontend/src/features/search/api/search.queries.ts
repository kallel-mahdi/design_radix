import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import type { Reference } from '@/common/types';

/**
 * Search filters
 */
export interface SearchFilters {
  query?: string;
  authors?: string[];
  yearStart?: number;
  yearEnd?: number;
  venues?: string[];
  tags?: string[];
}

/**
 * Facet item with value and count
 */
export interface FacetItem {
  value: string | number;
  count: number;
}

/**
 * Search facets for filter UI
 */
export interface SearchFacets {
  years: FacetItem[];
  venues: FacetItem[];
  authors: FacetItem[];
  tags: FacetItem[];
}

/**
 * Search response from API
 */
export interface SearchResponse {
  references: Reference[];
  total: number;
  facets: SearchFacets;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Query keys for search
 */
export const searchKeys = {
  all: ['search'] as const,
  search: (filters: SearchFilters, page: number, pageSize: number) =>
    [...searchKeys.all, filters, page, pageSize] as const,
};

/**
 * Build query string from filters
 */
function buildQueryString(filters: SearchFilters, page: number, pageSize: number): string {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set('q', filters.query.trim());
  }
  if (filters.authors && filters.authors.length > 0) {
    params.set('authors', filters.authors.join(','));
  }
  if (filters.yearStart) {
    params.set('yearStart', String(filters.yearStart));
  }
  if (filters.yearEnd) {
    params.set('yearEnd', String(filters.yearEnd));
  }
  if (filters.venues && filters.venues.length > 0) {
    params.set('venues', filters.venues.join(','));
  }
  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  return params.toString();
}

/**
 * Search references with filters and facets
 *
 * Uses keepPreviousData for smooth UX when filtering
 */
export function useSearchQuery(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 50,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: searchKeys.search(filters, page, pageSize),
    queryFn: async (): Promise<SearchResponse> => {
      const queryString = buildQueryString(filters, page, pageSize);
      return apiClient.get<SearchResponse>(`/search?${queryString}`);
    },
    enabled,
    placeholderData: keepPreviousData, // Keep previous data while fetching new
    staleTime: 30 * 1000, // 30 seconds
  });
}
