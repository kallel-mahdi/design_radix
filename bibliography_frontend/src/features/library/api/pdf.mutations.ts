import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import type { Reference } from '@/common/types';

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

      return response.data;
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
