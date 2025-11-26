import { IReference } from '../models/Reference';

/**
 * Search filters from frontend
 */
export interface SearchFilters {
  query?: string;
  authors?: string[];      // AND logic - all must match
  yearStart?: number;
  yearEnd?: number;
  venues?: string[];       // OR logic - any can match
  tags?: string[];         // AND logic - all must match
}

/**
 * Facet item with value and count
 */
export interface FacetItem {
  value: string | number;
  count: number;
}

/**
 * Search facets for filtering UI
 */
export interface SearchFacets {
  years: FacetItem[];
  venues: FacetItem[];
  authors: FacetItem[];
  tags: FacetItem[];
}

/**
 * Search result with references and facets
 */
export interface SearchResult {
  references: IReference[];
  total: number;
  facets: SearchFacets;
}

/**
 * Search service interface
 */
export interface ISearchService {
  search(
    userId: string,
    filters: SearchFilters,
    page?: number,
    pageSize?: number
  ): Promise<SearchResult>;
}
