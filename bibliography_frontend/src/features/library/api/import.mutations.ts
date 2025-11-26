import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { referenceKeys, type ReferencesQueryParams } from './references.queries';
import type { Reference } from '@/common/types';
import { ReferenceSchema, type ImportDoi } from '@bibliography/shared';

/**
 * BibTeX parsed reference (from backend)
 */
export interface ParsedBibTeXReference {
  title: string;
  authors: Array<{ given?: string; family?: string }>;
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  type: string;
  citationKey: string;
  bibtexRaw: string;
}

/**
 * BibTeX import response
 */
export interface BibtexImportResponse {
  parsed: ParsedBibTeXReference[];
  parseErrors: Array<{ message: string; entry?: string }>;
  created: Reference[];
  createErrors: Array<{ citationKey: string; error: string }>;
}

function matchesReferenceFilters(reference: Reference, filters?: ReferencesQueryParams) {
  if (!filters) {
    return true;
  }

  if (typeof filters.deleted === 'boolean' && reference.deleted !== filters.deleted) {
    return false;
  }

  if (filters.collectionId && !reference.collectionIds.includes(filters.collectionId)) {
    return false;
  }

  if (filters.tags && filters.tags.length > 0) {
    const hasAllTags = filters.tags.every((tag) => reference.tags.includes(tag));
    if (!hasAllTags) {
      return false;
    }
  }

  if (filters.search) {
    const keyword = filters.search.trim().toLowerCase();
    if (keyword.length > 0) {
      const searchable = [
        reference.title,
        reference.venue ?? '',
        reference.doi ?? '',
        reference.authors.map((author) => `${author.given ?? ''} ${author.family ?? ''}`.trim()).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(keyword)) {
        return false;
      }
    }
  }

  if (filters.limit || filters.offset) {
    // Avoid mutating paginated queries optimistically – let the background refetch update them.
    return false;
  }

  return true;
}

function upsertReference(list: Reference[] | undefined, reference: Reference, onDuplicate: () => void) {
  const items = Array.isArray(list) ? [...list] : [];
  const existingIndex = items.findIndex((item) => item._id === reference._id);

  if (existingIndex !== -1) {
    onDuplicate();
    items[existingIndex] = reference;
    return items;
  }

  return [reference, ...items];
}

/**
 * DOI Import Mutation
 *
 * Imports reference metadata from Crossref API via DOI
 * See: docs/sessions/06-plan.md for architecture decisions
 */
export function useImportFromDoiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ImportDoi): Promise<Reference> => {
      const response = await apiClient.post<Reference>('/references/import-doi', input);
      return ReferenceSchema.parse(response);
    },
    onSuccess: (reference) => {
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: referenceKeys.lists() });
      let existedInCache = false;

      listQueries.forEach((query) => {
        const [, , filters] = query.queryKey as ReturnType<typeof referenceKeys.list>;

        if (!matchesReferenceFilters(reference, filters)) {
          return;
        }

        queryClient.setQueryData<Reference[]>(query.queryKey, (current) =>
          upsertReference(current, reference, () => {
            existedInCache = true;
          }),
        );
      });

      queryClient.invalidateQueries({ queryKey: referenceKeys.lists(), refetchType: 'inactive' });

      useUIStore.getState().addToast({
        message: existedInCache
          ? 'Reference already exists in your library.'
          : 'Reference imported from DOI successfully.',
        type: existedInCache ? 'info' : 'success',
      });

      return reference;
    },
    // Note: Error handling done in ImportModal component
    // Component shows specific messages for 404, 429, timeout, etc.
  });
}

/**
 * BibTeX Import Mutation
 *
 * Imports references from BibTeX string or file
 * Returns parsed entries for preview, optionally creates immediately
 */
export function useImportFromBibtexMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { bibtex: string; createImmediately?: boolean }): Promise<BibtexImportResponse> => {
      const response = await apiClient.post<BibtexImportResponse>('/references/import-bibtex', input);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate queries if references were created
      if (response.created.length > 0) {
        queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });

        const errorCount = response.createErrors.length;
        const successCount = response.created.length;

        if (errorCount > 0) {
          useUIStore.getState().addToast({
            message: `Imported ${successCount} reference${successCount !== 1 ? 's' : ''}, ${errorCount} failed.`,
            type: 'warning',
          });
        } else {
          useUIStore.getState().addToast({
            message: `Imported ${successCount} reference${successCount !== 1 ? 's' : ''} from BibTeX.`,
            type: 'success',
          });
        }
      }

      return response;
    },
  });
}

/**
 * BibTeX Export Mutation
 *
 * Exports references to BibTeX format
 * Downloads as .bib file
 *
 * Note: Uses fetch directly because apiClient expects JSON responses,
 * but export endpoint returns plain text.
 */
export function useExportToBibtexMutation() {
  return useMutation({
    mutationFn: async (input?: { referenceIds?: string[]; collectionId?: string }): Promise<string> => {
      const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api/bibliography';

      const response = await fetch(`${API_BASE_URL}/references/export-bibtex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-id', // Dev mode auth
        },
        body: JSON.stringify(input || {}),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return response.text();
    },
    onSuccess: (bibtexContent) => {
      // Create and trigger download
      const blob = new Blob([bibtexContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${new Date().toISOString().split('T')[0]}.bib`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      useUIStore.getState().addToast({
        message: 'References exported to BibTeX',
        type: 'success',
      });
    },
  });
}
