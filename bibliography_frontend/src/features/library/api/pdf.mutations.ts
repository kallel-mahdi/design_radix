import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { useLibraryStore } from '../store/library.store';
import type { Reference, Author } from '@/common/types';

/**
 * PDF Upload/Delete Mutations (Session 10)
 *
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation on success
 * - Error handling with revert on failure
 *
 * Adapted from references.mutations.ts patterns
 */

interface UploadPdfVariables {
  referenceId: string;
  file: File;
}

/**
 * Backend response data structure for PDF upload
 * This is the type of the "data" field in the ApiResponse envelope
 */
interface PdfData {
  hasPdf: boolean;
  pdf: {
    originalName: string;
    storedPath: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

/**
 * Upload PDF mutation with optimistic update
 *
 * Immediately sets hasPdf: true in cache, then uploads file.
 * Reverts on error.
 */
export function useUploadPdfMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referenceId, file }: UploadPdfVariables): Promise<PdfData> => {
      // Use apiClient.uploadFile() instead of post() to avoid JSON.stringify corrupting FormData
      // uploadFile() properly handles multipart/form-data with correct Content-Type boundary
      const response = await apiClient.uploadFile<PdfData>(
        `/references/${referenceId}/upload-pdf`,
        file
      );

      return response;
    },

    onMutate: async ({ referenceId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['references'] });

      // Snapshot previous value
      const previousReferences = queryClient.getQueryData<Reference[]>(['references', 'list']);
      const previousDetail = queryClient.getQueryData<Reference>(['references', 'detail', referenceId]);

      // Optimistically update list cache
      if (previousReferences) {
        queryClient.setQueryData<Reference[]>(['references', 'list'], (old) =>
          old?.map((ref) =>
            // Defensive check: ensure ref exists before accessing properties
            ref && ref._id === referenceId ? { ...ref, hasPdf: true } : ref
          ).filter(Boolean) as Reference[] // Remove any undefined entries
        );
      }

      // Optimistically update detail cache
      if (previousDetail) {
        queryClient.setQueryData<Reference>(['references', 'detail', referenceId], (old) =>
          old ? { ...old, hasPdf: true } : old
        );
      }

      return { previousReferences, previousDetail };
    },

    onSuccess: (data, { referenceId }) => {
      // Update cache with actual server data
      queryClient.setQueryData<Reference>(['references', 'detail', referenceId], (old) =>
        old
          ? {
              ...old,
              hasPdf: data.hasPdf,
              pdf: data.pdf,
            }
          : old
      );

      // Invalidate to refetch and ensure sync
      queryClient.invalidateQueries({ queryKey: ['references', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['references', 'detail', referenceId] });
    },

    onError: (error, { referenceId }, context) => {
      // Log error for debugging
      console.error('PDF Upload Error:', {
        error,
        referenceId,
        message: error instanceof Error ? error.message : String(error)
      });

      // Revert optimistic update on error
      if (context?.previousReferences) {
        queryClient.setQueryData(['references', 'list'], context.previousReferences);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(['references', 'detail', referenceId], context.previousDetail);
      }
    },
  });
}

/**
 * Delete PDF mutation with optimistic update
 *
 * Immediately sets hasPdf: false in cache, then deletes file.
 * Reverts on error.
 */
export function useDeletePdfMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referenceId: string): Promise<void> => {
      await apiClient.delete(`/references/${referenceId}/pdf`);
    },

    onMutate: async (referenceId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['references'] });

      // Snapshot previous value
      const previousReferences = queryClient.getQueryData<Reference[]>(['references', 'list']);
      const previousDetail = queryClient.getQueryData<Reference>(['references', 'detail', referenceId]);

      // Optimistically update list cache
      if (previousReferences) {
        queryClient.setQueryData<Reference[]>(['references', 'list'], (old) =>
          old?.map((ref) =>
            ref._id === referenceId ? { ...ref, hasPdf: false, pdf: undefined } : ref
          )
        );
      }

      // Optimistically update detail cache
      if (previousDetail) {
        queryClient.setQueryData<Reference>(['references', 'detail', referenceId], (old) =>
          old ? { ...old, hasPdf: false, pdf: undefined } : old
        );
      }

      return { previousReferences, previousDetail };
    },

    onSuccess: (_data, referenceId) => {
      // Invalidate to refetch and ensure sync
      queryClient.invalidateQueries({ queryKey: ['references', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['references', 'detail', referenceId] });
    },

    onError: (_error, referenceId, context) => {
      // Revert optimistic update on error
      if (context?.previousReferences) {
        queryClient.setQueryData(['references', 'list'], context.previousReferences);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(['references', 'detail', referenceId], context.previousDetail);
      }
    },
  });
}

/**
 * PDF Extract Response (Unified Architecture)
 * Returns extracted metadata + PDF info, but does NOT create reference
 */
interface PdfExtractResponse {
  metadata: {
    type: string;
    title: string;
    authors: Author[];
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
    abstract?: string;
  };
  pdfInfo: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
  source: 'crossref' | 'filename-fallback';
}

/**
 * Extract metadata from PDF without creating reference (Unified Architecture)
 *
 * This is the first step in the unified PDF import flow:
 * 1. Upload PDF → extract metadata → return data
 * 2. Caller then creates reference via useCreateReferenceMutation
 *
 * This ensures both manual and PDF flows use the same reference creation path.
 */
export function usePdfExtractMutation() {
  return useMutation({
    mutationFn: async (file: File): Promise<PdfExtractResponse> => {
      const response = await apiClient.uploadFile<PdfExtractResponse>(
        '/references/pdf/extract',
        file
      );
      return response;
    },

    onMutate: () => {
      useUIStore.getState().addToast({
        message: 'Extracting metadata from PDF...',
        type: 'info',
        duration: 0,
      });
    },

    onError: (error) => {
      console.error('PDF Extract Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
      });

      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Invalid PDF') || message.includes('Unsupported')) {
        useUIStore.getState().addToast({
          message: 'Invalid PDF file. Please upload a valid PDF.',
          type: 'error',
          duration: 5000,
        });
      } else {
        useUIStore.getState().addToast({
          message: 'Failed to extract PDF metadata. Please try again.',
          type: 'error',
          duration: 5000,
        });
      }
    },
  });
}

/**
 * Create Reference from PDF - Unified Flow (Zotero-style instant creation)
 *
 * Combines PDF extraction + reference creation in one user action:
 * 1. Extract metadata from PDF via /pdf/extract
 * 2. Create reference via /references (same as manual creation)
 *
 * This is a convenience wrapper that chains the two operations.
 * The key benefit: both manual and PDF flows use POST /references.
 */
interface CreateFromPdfVariables {
  file: File;
  collectionId: string;
}

export function useCreateReferenceFromPdfMutation() {
  const queryClient = useQueryClient();
  const extractMutation = usePdfExtractMutation();

  return useMutation({
    mutationFn: async ({ file, collectionId }: CreateFromPdfVariables): Promise<{ reference: Reference; source: 'crossref' | 'filename-fallback' }> => {
      // Step 1: Extract metadata from PDF
      const extractResult = await extractMutation.mutateAsync(file);

      // Step 2: Create reference via unified endpoint (same as manual creation)
      const referenceData = {
        type: extractResult.metadata.type as Reference['type'],
        title: extractResult.metadata.title,
        authors: extractResult.metadata.authors,
        year: extractResult.metadata.year,
        venue: extractResult.metadata.venue,
        doi: extractResult.metadata.doi,
        url: extractResult.metadata.url,
        abstract: extractResult.metadata.abstract,
        tags: [],
        collectionIds: [collectionId],
        sourceRaw: {
          provider: 'manual' as const, // PDF import is effectively manual entry with auto-fill
          payload: { source: 'pdf-import', extractedFrom: extractResult.source },
        },
        // Include PDF info so reference is created with PDF attached
        hasPdf: true,
        pdf: extractResult.pdfInfo,
      };

      const reference = await apiClient.post<Reference>('/references', referenceData);
      return { reference, source: extractResult.source };
    },

    onSuccess: ({ reference, source }) => {
      // Invalidate references list
      queryClient.invalidateQueries({ queryKey: ['references', 'list'] });

      // Auto-select newly created reference
      useLibraryStore.getState().setActiveReference(reference._id);

      // Show success toast
      const sourceLabel = source === 'crossref' ? 'from Crossref' : 'from filename';
      const titlePreview = reference.title.substring(0, 50);
      const message = `Added: ${titlePreview}${reference.title.length > 50 ? '...' : ''} (${sourceLabel})`;

      useUIStore.getState().addToast({
        message,
        type: source === 'crossref' ? 'success' : 'warning',
        duration: 5000,
      });
    },

    onError: (error) => {
      console.error('PDF Import Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
      });

      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Invalid PDF') || message.includes('Unsupported')) {
        useUIStore.getState().addToast({
          message: 'Invalid PDF file. Please upload a valid PDF.',
          type: 'error',
          duration: 5000,
        });
      } else if (message.includes('already exists')) {
        useUIStore.getState().addToast({
          message: 'Reference with this DOI already exists in your library.',
          type: 'error',
          duration: 5000,
        });
      } else {
        useUIStore.getState().addToast({
          message: 'Failed to import PDF. Please try again.',
          type: 'error',
          duration: 5000,
        });
      }
    },
  });
}
