import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Search state for filter management
 */
interface SearchState {
  // Filter values
  query: string;
  authors: string[];
  yearStart: number | undefined;
  yearEnd: number | undefined;
  venues: string[];
  tags: string[];

  // Pagination
  page: number;
  pageSize: number;

  // Actions
  setQuery: (query: string) => void;
  toggleAuthor: (author: string) => void;
  toggleVenue: (venue: string) => void;
  toggleTag: (tag: string) => void;
  setYearRange: (start: number | undefined, end: number | undefined) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

/**
 * Search store - manages search filters and pagination
 *
 * Pattern: Same Zustand pattern as library.store.ts
 */
export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      // Initial state
      query: '',
      authors: [],
      yearStart: undefined,
      yearEnd: undefined,
      venues: [],
      tags: [],
      page: 1,
      pageSize: 50,

      // Actions
      setQuery: (query) => set({ query, page: 1 }, false, 'setQuery'),

      toggleAuthor: (author) =>
        set(
          (state) => ({
            authors: state.authors.includes(author)
              ? state.authors.filter((a) => a !== author)
              : [...state.authors, author],
            page: 1,
          }),
          false,
          'toggleAuthor'
        ),

      toggleVenue: (venue) =>
        set(
          (state) => ({
            venues: state.venues.includes(venue)
              ? state.venues.filter((v) => v !== venue)
              : [...state.venues, venue],
            page: 1,
          }),
          false,
          'toggleVenue'
        ),

      toggleTag: (tag) =>
        set(
          (state) => ({
            tags: state.tags.includes(tag)
              ? state.tags.filter((t) => t !== tag)
              : [...state.tags, tag],
            page: 1,
          }),
          false,
          'toggleTag'
        ),

      setYearRange: (start, end) =>
        set({ yearStart: start, yearEnd: end, page: 1 }, false, 'setYearRange'),

      setPage: (page) => set({ page }, false, 'setPage'),

      clearFilters: () =>
        set(
          {
            query: '',
            authors: [],
            yearStart: undefined,
            yearEnd: undefined,
            venues: [],
            tags: [],
            page: 1,
          },
          false,
          'clearFilters'
        ),
    }),
    { name: 'search-store' }
  )
);
