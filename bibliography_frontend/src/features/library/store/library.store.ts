import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface LibraryState {
  selectedReferenceIds: Set<string>;
  activeReferenceId: string | null;
  lastSelectedId: string | null;
  activeCollectionId: string | null;
  expandedCollectionIds: Set<string>;
  activeTags: string[];
  sortBy: 'title' | 'year' | 'dateAdded' | 'authors';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

interface LibraryActions {
  selectReference: (id: string) => void;
  deselectReference: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveReference: (id: string | null) => void;
  setActiveCollection: (id: string | null) => void;
  toggleCollectionExpanded: (id: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setSorting: (sortBy: LibraryState['sortBy'], sortOrder?: LibraryState['sortOrder']) => void;
  setSearchQuery: (query: string) => void;
}

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  devtools(
    persist(
      (set, get) => ({
        selectedReferenceIds: new Set(),
        activeReferenceId: null,
        lastSelectedId: null,
        activeCollectionId: null,
        expandedCollectionIds: new Set(),
        activeTags: [],
        sortBy: 'dateAdded',
        sortOrder: 'desc',
        searchQuery: '',

        selectReference: (id) =>
          set(
            (state) => ({
              selectedReferenceIds: new Set([...state.selectedReferenceIds, id]),
              lastSelectedId: id
            }),
            false,
            'library/selectReference'
          ),

        deselectReference: (id) =>
          set(
            (state) => {
              const newSet = new Set(state.selectedReferenceIds);
              newSet.delete(id);
              return { selectedReferenceIds: newSet };
            },
            false,
            'library/deselectReference'
          ),

        toggleSelection: (id) => {
          const { selectedReferenceIds } = get();
          if (selectedReferenceIds.has(id)) {
            get().deselectReference(id);
          } else {
            get().selectReference(id);
          }
        },

        selectAll: (ids) =>
          set({ selectedReferenceIds: new Set(ids) }, false, 'library/selectAll'),

        clearSelection: () =>
          set({ selectedReferenceIds: new Set(), lastSelectedId: null }, false, 'library/clearSelection'),

        setActiveReference: (id) =>
          set({ activeReferenceId: id }, false, 'library/setActiveReference'),

        setActiveCollection: (id) =>
          set({ activeCollectionId: id }, false, 'library/setActiveCollection'),

        toggleCollectionExpanded: (id) =>
          set(
            (state) => {
              const expanded = new Set(state.expandedCollectionIds);
              if (expanded.has(id)) {
                expanded.delete(id);
              } else {
                expanded.add(id);
              }
              return { expandedCollectionIds: expanded };
            },
            false,
            'library/toggleCollectionExpanded'
          ),

        toggleTag: (tag) =>
          set(
            (state) => {
              const activeTags = state.activeTags.includes(tag)
                ? state.activeTags.filter(t => t !== tag)
                : [...state.activeTags, tag];
              return { activeTags };
            },
            false,
            'library/toggleTag'
          ),

        clearTags: () =>
          set({ activeTags: [] }, false, 'library/clearTags'),

        setSorting: (sortBy, sortOrder = 'asc') =>
          set({ sortBy, sortOrder }, false, 'library/setSorting'),

        setSearchQuery: (query) =>
          set({ searchQuery: query }, false, 'library/setSearchQuery')
      }),
      {
        name: 'library-storage',
        partialize: (state) => ({
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          activeCollectionId: state.activeCollectionId,
          expandedCollectionIds: Array.from(state.expandedCollectionIds)
        }),
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          // Explicitly restore persisted fields
          sortBy: persistedState?.sortBy ?? currentState.sortBy,
          sortOrder: persistedState?.sortOrder ?? currentState.sortOrder,
          activeCollectionId: persistedState?.activeCollectionId ?? currentState.activeCollectionId,
          expandedCollectionIds: new Set(persistedState?.expandedCollectionIds || [])
        })
      }
    ),
    { name: 'library-store' }
  )
);

export const useSelectedReferenceIds = () =>
  useLibraryStore((state) => Array.from(state.selectedReferenceIds));

export const useIsReferenceSelected = (id: string) =>
  useLibraryStore((state) => state.selectedReferenceIds.has(id));

export const useActiveReferenceId = () =>
  useLibraryStore((state) => state.activeReferenceId);

export const useActiveTags = () =>
  useLibraryStore((state) => state.activeTags);

// Shallow equality comparator for object selectors
const shallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export const useSorting = () =>
  useLibraryStore(
    (state) => ({
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }),
    shallowEqual
  );

export const useExpandedCollectionIds = () =>
  useLibraryStore((state) => Array.from(state.expandedCollectionIds));

export const useIsCollectionExpanded = (id: string) =>
  useLibraryStore((state) => state.expandedCollectionIds.has(id));
