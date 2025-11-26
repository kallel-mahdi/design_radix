import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '../features/search/store/search.store';
import { useSearchQuery } from '../features/search/api/search.queries';
import { FilterPanel } from '../features/search/components/FilterPanel';
import { ReferenceTable } from '../features/library/components/ReferenceTable';
import { ReferenceTableSkeleton } from '../features/library/components/ReferenceTableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useDebouncedValue } from '../common/hooks/useDebouncedValue';

export const Route = createFileRoute('/search')({
  component: SearchPage,
});

/**
 * SearchPage - Advanced search with filters and facets
 *
 * Session 14 implementation following Zotero's pattern:
 * - Left sidebar with faceted filters
 * - Main area with search bar and results
 * - Real-time filtering with debounced search
 */
function SearchPage() {
  const { setActiveView } = useUIStore();

  // Search state
  const {
    query,
    authors,
    venues,
    tags,
    yearStart,
    yearEnd,
    page,
    pageSize,
    setQuery,
    setPage,
    clearFilters,
  } = useSearchStore();

  // Local input state for debouncing
  const [inputValue, setInputValue] = useState(query);
  const debouncedQuery = useDebouncedValue(inputValue, 300);

  // Update store when debounced value changes
  useEffect(() => {
    if (debouncedQuery !== query) {
      setQuery(debouncedQuery);
    }
  }, [debouncedQuery, query, setQuery]);

  // Build filters object
  const filters = {
    query: query || undefined,
    authors: authors.length > 0 ? authors : undefined,
    venues: venues.length > 0 ? venues : undefined,
    tags: tags.length > 0 ? tags : undefined,
    yearStart,
    yearEnd,
  };

  // Search query
  const { data, isLoading, isFetching } = useSearchQuery(filters, page, pageSize);

  useEffect(() => {
    setActiveView('search');
  }, [setActiveView]);

  // Count active filters
  const activeFilterCount =
    authors.length +
    venues.length +
    tags.length +
    (yearStart ? 1 : 0) +
    (yearEnd ? 1 : 0);

  return (
    <div className="flex h-full">
      {/* Filter Panel Sidebar */}
      <FilterPanel facets={data?.facets} className="flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-app-border">
          <h1 className="text-2xl font-bold text-app-text-primary">Search</h1>
          <p className="text-app-text-secondary mt-1">
            Find references across your library
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-app-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-muted" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search titles, authors, abstracts..."
                className="w-full pl-10 pr-10 py-2 border border-app-border rounded-lg bg-app-surface text-app-text-primary placeholder:text-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-accent"
              />
              {inputValue && (
                <button
                  onClick={() => {
                    setInputValue('');
                    setQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text-primary"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-app-text-secondary whitespace-nowrap">
              {isLoading ? (
                'Searching...'
              ) : data ? (
                <>
                  {data.total.toLocaleString()} result{data.total !== 1 ? 's' : ''}
                  {activeFilterCount > 0 && (
                    <span className="ml-2 text-app-accent">
                      ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <ReferenceTableSkeleton rows={10} />
          ) : data?.references && data.references.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <ReferenceTable references={data.references} />
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="px-6 py-3 border-t border-app-border flex items-center justify-between bg-app-surface">
                  <span className="text-sm text-app-text-secondary">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!data.pagination.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={query ? 'No results found' : 'Start searching'}
              description={
                query
                  ? 'Try different keywords or adjust your filters'
                  : 'Enter a search term or use the filters to find references'
              }
              action={
                activeFilterCount > 0
                  ? { label: 'Clear filters', onClick: clearFilters }
                  : undefined
              }
            />
          )}
        </div>
      </div>

      {/* Loading indicator overlay */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-app-surface border border-app-border rounded-lg px-4 py-2 shadow-lg">
          <span className="text-sm text-app-text-secondary">Updating results...</span>
        </div>
      )}
    </div>
  );
}
