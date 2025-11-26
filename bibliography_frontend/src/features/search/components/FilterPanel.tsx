import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import { useSearchStore } from '../store/search.store';
import type { SearchFacets } from '../api/search.queries';

interface FilterPanelProps {
  facets: SearchFacets | undefined;
  className?: string;
}

/**
 * FilterPanel - Search filters sidebar
 *
 * Displays faceted filters for:
 * - Year range (min/max inputs)
 * - Venues (checkboxes with counts)
 * - Tags (checkboxes with counts)
 * - Authors (checkboxes with counts)
 *
 * Pattern: Matches Zotero's advanced search filter panel
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({ facets, className }) => {
  const {
    authors: selectedAuthors,
    venues: selectedVenues,
    tags: selectedTags,
    yearStart,
    yearEnd,
    toggleAuthor,
    toggleVenue,
    toggleTag,
    setYearRange,
    clearFilters,
  } = useSearchStore();

  const hasActiveFilters =
    selectedAuthors.length > 0 ||
    selectedVenues.length > 0 ||
    selectedTags.length > 0 ||
    yearStart !== undefined ||
    yearEnd !== undefined;

  return (
    <aside className={cn('w-64 bg-app-surface border-r border-app-border flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-app-border">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-app-text-secondary" />
          <h2 className="font-semibold text-app-text-primary">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-app-accent hover:text-app-accent-hover"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable filter sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Year Range */}
        <FilterSection title="Year">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="From"
              value={yearStart || ''}
              onChange={(e) => setYearRange(
                e.target.value ? parseInt(e.target.value, 10) : undefined,
                yearEnd
              )}
              className="w-20 px-2 py-1 text-sm border border-app-border rounded bg-app-surface text-app-text-primary"
              min={1900}
              max={2100}
            />
            <span className="text-app-text-muted">—</span>
            <input
              type="number"
              placeholder="To"
              value={yearEnd || ''}
              onChange={(e) => setYearRange(
                yearStart,
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )}
              className="w-20 px-2 py-1 text-sm border border-app-border rounded bg-app-surface text-app-text-primary"
              min={1900}
              max={2100}
            />
          </div>
          {/* Quick year facets */}
          {facets?.years && facets.years.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {facets.years.slice(0, 5).map((item) => (
                <button
                  key={item.value}
                  onClick={() => setYearRange(Number(item.value), Number(item.value))}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full border transition-colors',
                    yearStart === item.value && yearEnd === item.value
                      ? 'bg-app-accent text-white border-app-accent'
                      : 'border-app-border text-app-text-secondary hover:border-app-accent'
                  )}
                >
                  {item.value} ({item.count})
                </button>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Venues */}
        {facets?.venues && facets.venues.length > 0 && (
          <FilterSection title="Venues">
            <CheckboxList
              items={facets.venues}
              selected={selectedVenues}
              onToggle={toggleVenue}
            />
          </FilterSection>
        )}

        {/* Tags */}
        {facets?.tags && facets.tags.length > 0 && (
          <FilterSection title="Tags">
            <CheckboxList
              items={facets.tags}
              selected={selectedTags}
              onToggle={toggleTag}
            />
          </FilterSection>
        )}

        {/* Authors */}
        {facets?.authors && facets.authors.length > 0 && (
          <FilterSection title="Authors">
            <CheckboxList
              items={facets.authors}
              selected={selectedAuthors}
              onToggle={toggleAuthor}
            />
          </FilterSection>
        )}
      </div>
    </aside>
  );
};

/**
 * Filter section wrapper
 */
interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-medium text-app-text-primary mb-2">{title}</h3>
    {children}
  </div>
);

/**
 * Checkbox list for facet filters
 */
interface CheckboxListProps {
  items: Array<{ value: string | number; count: number }>;
  selected: string[];
  onToggle: (value: string) => void;
}

const CheckboxList: React.FC<CheckboxListProps> = ({ items, selected, onToggle }) => (
  <div className="space-y-1 max-h-40 overflow-y-auto">
    {items.map((item) => {
      const value = String(item.value);
      const isSelected = selected.includes(value);

      return (
        <label
          key={value}
          className={cn(
            'flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors',
            isSelected ? 'bg-app-accent/10' : 'hover:bg-app-bg'
          )}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(value)}
            className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent"
          />
          <span className="flex-1 text-sm text-app-text-primary truncate" title={value}>
            {value}
          </span>
          <span className="text-xs text-app-text-muted">({item.count})</span>
        </label>
      );
    })}
  </div>
);
