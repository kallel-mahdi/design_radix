/**
 * ReferenceTable Component - Session 8
 *
 * Production-ready table with TanStack Table + virtualization.
 * Handles 500+ references with:
 * - 8 columns: Select | Title | Authors | Year | Venue | Tags | Files | DOI
 * - Multi-select: checkbox, Cmd/Ctrl+Click, Shift+Click range
 * - Client-side sorting via getSortedRowModel()
 * - Row virtualization via @tanstack/react-virtual
 * - Keyboard navigation (arrows, enter, space)
 * - Zotero-style UX (max 3 authors + "et al.", colored tag pills)
 *
 * Patterns copied from editor_frontend:
 * - Zustand store integration
 * - Tailwind CSS styling
 * - Accessibility (ARIA labels)
 *
 * Deviations from Zotero:
 * - React + TanStack Table (not XUL tree)
 * - Client-side sorting initially (not SQLite)
 * - Virtualization in MVP (Zotero added later)
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLibraryStore } from '../store/library.store';
import { useUIStore } from '@/store/ui.store';
import type { Reference } from '@/common/types';
import { Tag } from '@/components/ui/Tag';
import {
  PaperClipIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ReferenceTableProps {
  references: Reference[];
}

/**
 * Format authors for display: max 3 authors + "et al."
 * Copied from Zotero pattern (zotero/chrome/content/zotero/itemTree.js)
 *
 * Examples:
 * - 1 author: "Smith, J."
 * - 2 authors: "Smith, J., Jones, M."
 * - 3 authors: "Smith, J., Jones, M., Brown, L."
 * - 4+ authors: "Smith, J., Jones, M., Brown, L., et al."
 */
function formatAuthors(authors: Reference['authors']): string {
  if (!authors || authors.length === 0) return 'Unknown';

  const formatAuthor = (author: typeof authors[0] | undefined) => {
    if (!author) return 'Unknown';
    const { family, given, full } = author;
    if (family && given) {
      return `${family}, ${given.charAt(0)}.`;
    }
    if (family) {
      return family;
    }
    return full || 'Unknown';
  };

  if (authors.length === 1) {
    return formatAuthor(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatAuthor(authors[0])}, ${formatAuthor(authors[1])}`;
  }

  if (authors.length === 3) {
    return `${formatAuthor(authors[0])}, ${formatAuthor(authors[1])}, ${formatAuthor(authors[2])}`;
  }

  // 4+ authors: show first 3 + "et al."
  return `${formatAuthor(authors[0])}, ${formatAuthor(authors[1])}, ${formatAuthor(authors[2])}, et al.`;
}

export function ReferenceTable({ references }: ReferenceTableProps) {
  // Zustand store state
  const selectedReferenceIds = useLibraryStore((state) => state.selectedReferenceIds);
  const selectReference = useLibraryStore((state) => state.selectReference);
  const deselectReference = useLibraryStore((state) => state.deselectReference);
  const selectAll = useLibraryStore((state) => state.selectAll);
  const clearSelection = useLibraryStore((state) => state.clearSelection);
  const setActiveReference = useLibraryStore((state) => state.setActiveReference);
  const setEditReference = useLibraryStore((state) => state.setEditReference);
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);
  const setSorting = useLibraryStore((state) => state.setSorting);
  const { openModal } = useUIStore();

  // Local state for shift-click range selection
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);

  // Virtualization container ref
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // TanStack Table sorting state (controlled by Zustand)
  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder]
  );

  // Define columns
  const columns = useMemo<ColumnDef<Reference>[]>(
    () => [
      // Column 1: Select checkbox
      {
        id: 'select',
        header: () => {
          const allSelected = references.every(ref => selectedReferenceIds.has(ref._id));
          const someSelected = references.some(ref => selectedReferenceIds.has(ref._id)) && !allSelected;

          return (
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={() => {
                if (allSelected) {
                  clearSelection();
                } else {
                  selectAll(references.map(r => r._id));
                }
              }}
              className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent focus:ring-offset-0 cursor-pointer"
              aria-label="Select all references"
            />
          );
        },
        cell: ({ row }) => {
          const isSelected = selectedReferenceIds.has(row.original._id);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  deselectReference(row.original._id);
                } else {
                  selectReference(row.original._id);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent focus:ring-offset-0 cursor-pointer"
              aria-label={`Select ${row.original.title}`}
            />
          );
        },
        size: 48,
        enableSorting: false,
      },
      // Column 2: Title
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => (
          <span className="font-semibold text-app-text-primary">
            {getValue() as string}
          </span>
        ),
        size: 300,
        enableSorting: true,
      },
      // Column 3: Authors
      {
        id: 'authors',
        accessorFn: (row) => formatAuthors(row.authors),
        header: 'Authors',
        cell: ({ getValue }) => (
          <span className="text-app-text-secondary">
            {getValue() as string}
          </span>
        ),
        size: 200,
        enableSorting: true,
      },
      // Column 4: Year
      {
        accessorKey: 'year',
        header: 'Year',
        cell: ({ getValue }) => (
          <span className="text-app-text-secondary">
            {getValue() ? String(getValue()) : 'N/A'}
          </span>
        ),
        size: 80,
        enableSorting: true,
      },
      // Column 5: Venue
      {
        accessorKey: 'venue',
        header: 'Venue',
        cell: ({ getValue }) => (
          <span className="text-app-text-secondary">
            {getValue() ? String(getValue()) : 'N/A'}
          </span>
        ),
        size: 200,
        enableSorting: true,
      },
      // Column 6: Tags (colored pills, max 3 + "+N more")
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ getValue }) => {
          const tags = getValue() as string[];
          if (!tags || tags.length === 0) {
            return <span className="text-xs text-app-text-muted">No tags</span>;
          }

          const visibleTags = tags.slice(0, 3);
          const remainingCount = tags.length - 3;

          return (
            <div className="flex gap-1 flex-wrap items-center">
              {visibleTags.map((tag) => (
                <Tag key={tag} label={tag} size="sm" />
              ))}
              {remainingCount > 0 && (
                <span className="text-xs text-app-text-muted">
                  +{remainingCount} more
                </span>
              )}
            </div>
          );
        },
        size: 200,
        enableSorting: false,
      },
      // Column 7: Files (paperclip icon if hasPdf)
      {
        accessorKey: 'hasPdf',
        header: 'Files',
        cell: ({ getValue }) => {
          const hasPdf = getValue() as boolean;
          return hasPdf ? (
            <PaperClipIcon
              className="h-4 w-4 text-app-text-secondary"
              aria-label="Has PDF attachment"
            />
          ) : null;
        },
        size: 60,
        enableSorting: false,
      },
      // Column 8: DOI (clickable link)
      {
        accessorKey: 'doi',
        header: 'DOI',
        cell: ({ getValue }) => {
          const doi = getValue() as string | null;
          if (!doi) return <span className="text-app-text-muted">—</span>;

          return (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-app-accent hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {doi.length > 20 ? `${doi.substring(0, 20)}...` : doi}
            </a>
          );
        },
        size: 150,
        enableSorting: false,
      },
    ],
    [references, selectedReferenceIds, selectReference, deselectReference, selectAll, clearSelection]
  );

  // TanStack Table instance
  const table = useReactTable({
    data: references,
    columns,
    getRowId: (row) => row._id, // Use reference ID as row ID (fixes sorting issues)
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      if (newSorting.length > 0 && newSorting[0]) {
        const { id, desc } = newSorting[0];
        setSorting(id as any, desc ? 'desc' : 'asc');
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: false, // We handle selection manually via Zustand store
    enableSortingRemoval: false, // Toggle between asc/desc only (no unsorted state)
  });

  // Virtualization
  const { rows } = table.getRowModel();
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  /**
   * Shift+Click range selection algorithm
   * Copied from WebSearch: "React multi-select table shift click range selection pattern"
   *
   * Handles both directions (top-to-bottom and bottom-to-top)
   * Works with sorted rows array (selects based on visible order)
   */
  const handleShiftClickRange = useCallback(
    (currentIndex: number, sortedRows: any[]) => {
      const currentRow = sortedRows[currentIndex];
      if (!currentRow) return;

      if (lastSelectedIndex === null) {
        selectReference(currentRow.original._id);
        setLastSelectedIndex(currentIndex);
        return;
      }

      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);

      // Collect all IDs in range
      const rangeIds: string[] = [];
      for (let i = start; i <= end; i++) {
        const row = sortedRows[i];
        if (row) {
          rangeIds.push(row.original._id);
        }
      }

      // Batch update: clear and select all at once to avoid interference from onRowSelectionChange
      clearSelection();
      rangeIds.forEach(id => selectReference(id));
    },
    [lastSelectedIndex, selectReference, clearSelection]
  );

  /**
   * Row click handler - multi-select modes:
   * - Normal click: single selection + open details
   * - Cmd/Ctrl+Click: toggle individual
   * - Shift+Click: range selection
   *
   * Zotero pattern: zotero/chrome/content/zotero/itemTree.js
   *
   * @param index - Index in the sorted rows array (not original references array)
   * @param sortedRows - The sorted rows from table.getRowModel()
   */
  const handleRowClick = useCallback(
    (index: number, event: React.MouseEvent, sortedRows: any[]) => {
      const row = sortedRows[index];
      if (!row) return;
      const refId = row.original._id;

      if (event.shiftKey) {
        // Shift+Click: range selection
        event.preventDefault();
        handleShiftClickRange(index, sortedRows);
      } else if (event.metaKey || event.ctrlKey) {
        // Cmd/Ctrl+Click: toggle individual
        if (selectedReferenceIds.has(refId)) {
          deselectReference(refId);
        } else {
          selectReference(refId);
          setLastSelectedIndex(index);
        }
      } else {
        // Normal click: single selection + open details
        const isCurrentlySelected = selectedReferenceIds.has(refId);
        const isOnlySelection = selectedReferenceIds.size === 1 && isCurrentlySelected;

        if (isOnlySelection) {
          // Clicking the only selected item: deselect and clear active
          clearSelection();
          setActiveReference(null);
        } else {
          // Select only this item and show details
          clearSelection();
          selectReference(refId);
          setActiveReference(refId);
          setLastSelectedIndex(index);
        }
      }

      setFocusedRowIndex(index);
    },
    [references, selectedReferenceIds, deselectReference, selectReference, clearSelection, setActiveReference, handleShiftClickRange]
  );

  /**
   * Double-click handler: open ReferenceModal in edit mode
   */
  const handleRowDoubleClick = useCallback(
    (refId: string) => {
      setEditReference(refId);
      openModal('reference-modal');
    },
    [setEditReference, openModal]
  );

  /**
   * Keyboard navigation
   * - Arrow Up/Down: navigate rows
   * - Enter: open details pane
   * - Space: toggle selection
   * - Cmd/Ctrl+A: select all
   *
   * Zotero pattern: zotero/chrome/content/zotero/itemTree.js keyboard shortcuts
   * Works with sorted rows array (navigates based on visible order)
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (rows.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = Math.min(focusedRowIndex + 1, rows.length - 1);
        setFocusedRowIndex(nextIndex);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = Math.max(focusedRowIndex - 1, 0);
        setFocusedRowIndex(prevIndex);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const row = rows[focusedRowIndex];
        if (row) {
          setActiveReference(row.original._id);
        }
      } else if (event.key === ' ') {
        event.preventDefault();
        const row = rows[focusedRowIndex];
        if (row) {
          const refId = row.original._id;
          if (selectedReferenceIds.has(refId)) {
            deselectReference(refId);
          } else {
            selectReference(refId);
          }
        }
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        event.preventDefault();
        selectAll(rows.map(r => r.original._id));
      }
    },
    [rows, focusedRowIndex, selectedReferenceIds, setActiveReference, deselectReference, selectReference, selectAll]
  );

  // Empty state
  if (references.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-app-text-muted">
        No references found
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto h-full"
      role="table"
      aria-label="Reference list"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-app-surface z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-app-border">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    role="columnheader"
                    data-testid={canSort ? `column-header-${header.id}` : undefined}
                    style={{ width: header.getSize() }}
                    className={`px-3 py-3 text-left text-sm font-medium text-app-text-primary ${
                      canSort ? 'cursor-pointer select-none hover:bg-app-surface-hover' : ''
                    }`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && sorted && (
                        <span className="text-app-accent">
                          {sorted === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody style={{ height: `${totalSize}px` }} className="relative">
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;

            const isSelected = selectedReferenceIds.has(row.original._id);
            const isFocused = focusedRowIndex === virtualRow.index;

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`border-b border-app-border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-app-accent/5 border-l-4 border-l-app-accent'
                    : 'hover:bg-app-bg-hover'
                } ${isFocused ? 'ring-2 ring-app-accent ring-inset' : ''}`}
                onClick={(e) => handleRowClick(virtualRow.index, e, rows)}
                onDoubleClick={() => handleRowDoubleClick(row.original._id)}
                aria-selected={isSelected}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="px-3 py-3 text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
