import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { referenceKeys } from './references.queries';
import type { Reference } from '@/common/types';

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
