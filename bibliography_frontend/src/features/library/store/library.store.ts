import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface LibraryState {
  selectedReferenceIds: Set<string>;
  activeReferenceId: string | null;
  lastSelectedId: string | null;
  activeCollectionId: string | null;
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
          activeCollectionId: state.activeCollectionId
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

export const useSorting = () =>
  useLibraryStore((state) => ({ 
    sortBy: state.sortBy, 
    sortOrder: state.sortOrder 
  }));
