import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { useUIStore } from '@/store/ui.store';
import { referenceKeys, type ReferencesQueryParams } from './references.queries';
import type { Reference } from '@/common/types';
import { ReferenceSchema, ImportDoiInput } from '@bibliography/shared';

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
    mutationFn: async (input: ImportDoiInput): Promise<Reference> => {
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
