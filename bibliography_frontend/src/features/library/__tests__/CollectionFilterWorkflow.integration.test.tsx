import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor, act } from '@/test/utils/testUtils';
import { useLibraryStore } from '../store/library.store';
import { TreeView } from '../components/TreeView';
import { mockCollections } from '@/test/fixtures/mockData';

/**
 * Collection Filter Workflow Integration Tests
 *
 * Tests the complete workflow of filtering references by collections:
 * - User clicks on a collection in TreeView
 * - Store updates with activeCollectionId
 * - Filter state persists correctly
 * - Nested collections work (expand/collapse)
 * - Clearing collection filter
 * - Visual state synchronization
 */

describe('Collection Filter Workflow Integration', () => {
  // Filter out deleted collections for testing
  const activeCollections = mockCollections.filter((c) => !c.deleted);

  beforeEach(() => {
    // Reset store state
    useLibraryStore.setState({
      selectedReferenceIds: new Set(),
      activeReferenceId: null,
      activeCollectionId: null,
      expandedCollectionIds: new Set(),
      activeTags: [],
      sortBy: 'dateAdded',
      sortOrder: 'desc',
      searchQuery: '',
      lastSelectedId: null,
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe('Single Collection Selection', () => {
    it('should select a collection and update store state', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Find and click root collection
      const mlCollection = screen.getByText('Machine Learning Papers');
      await user.click(mlCollection);

      // Verify store was updated
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1');
    });

    it('should deselect collection when clicked again', async () => {
      const user = userEvent.setup();

      // Pre-select a collection
      useLibraryStore.getState().setActiveCollection('col-1');

      const onSelectCollection = (id: string) => {
        const currentId = useLibraryStore.getState().activeCollectionId;
        // Toggle logic: if same collection clicked, deselect it
        useLibraryStore.getState().setActiveCollection(currentId === id ? null : id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // Click the already-selected collection to deselect it
      const mlCollection = screen.getByText('Machine Learning Papers');
      await user.click(mlCollection);

      // Verify store was updated
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBeNull();
    });

    it('should show visual active state when collection is selected', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      const { rerender } = render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Select a collection
      const mlCollection = screen.getByText('Machine Learning Papers');
      await user.click(mlCollection);

      // Rerender with updated state
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // Collection should have active styling (active class is on parent div)
      await waitFor(() => {
        const parentDiv = mlCollection.closest('div');
        expect(parentDiv).toHaveClass('bg-app-accent/20');
      });
    });
  });

  describe('Nested Collection Navigation', () => {
    it('should expand parent collection to reveal children', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Initially, child collections should not be visible
      expect(screen.queryByText('Reinforcement Learning')).not.toBeInTheDocument();
      expect(screen.queryByText('Computer Vision')).not.toBeInTheDocument();

      // Find and click the expand button (chevron) - it's the first button for each collection
      const allButtons = screen.getAllByRole('button');
      // The first button is the chevron for "Machine Learning Papers"
      const chevronButton = allButtons[0];
      await user.click(chevronButton);

      // Child collections should now be visible
      await waitFor(() => {
        expect(screen.getByText('Reinforcement Learning')).toBeInTheDocument();
        expect(screen.getByText('Computer Vision')).toBeInTheDocument();
      });
    });

    it('should collapse parent collection to hide children', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      // Pre-expand the parent collection
      useLibraryStore.getState().toggleCollectionExpanded('col-1');

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Children should be visible
      expect(screen.getByText('Reinforcement Learning')).toBeInTheDocument();

      // Find and click the collapse button (chevron) - it's the first button
      const allButtons = screen.getAllByRole('button');
      const chevronButton = allButtons[0];
      await user.click(chevronButton);

      // Children should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Reinforcement Learning')).not.toBeInTheDocument();
      });
    });

    it('should select nested collection and update store', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      // Pre-expand the parent
      useLibraryStore.getState().toggleCollectionExpanded('col-1');

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Click nested collection
      const rlCollection = screen.getByText('Reinforcement Learning');
      await user.click(rlCollection);

      // Verify store was updated with nested collection ID
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1-1');
    });
  });

  describe('Multiple Collection Types', () => {
    it('should switch between different collections', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      const { rerender } = render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Select first collection
      await user.click(screen.getByText('Machine Learning Papers'));
      expect(useLibraryStore.getState().activeCollectionId).toBe('col-1');

      // Rerender with updated state
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // Select second collection
      await user.click(screen.getByText('Books'));

      // Should update to new collection
      expect(useLibraryStore.getState().activeCollectionId).toBe('col-2');
    });

    it('should handle collections without colors', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Books collection has color: null
      const booksCollection = screen.getByText('Books');
      await user.click(booksCollection);

      // Should still work correctly
      expect(useLibraryStore.getState().activeCollectionId).toBe('col-2');
    });
  });

  describe('Filter State Management', () => {
    it('should track collection filter independently from other filters', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Set tag filters
      act(() => {
        useLibraryStore.getState().toggleTag('machine-learning');
        useLibraryStore.getState().toggleTag('ai');
      });

      // Set search query
      act(() => {
        useLibraryStore.getState().setSearchQuery('deep learning');
      });

      // Select collection
      await user.click(screen.getByText('Machine Learning Papers'));

      // All filters should coexist
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1');
      expect(state.activeTags).toContain('machine-learning');
      expect(state.activeTags).toContain('ai');
      expect(state.searchQuery).toBe('deep learning');
    });

    it('should allow clearing collection filter without affecting other filters', () => {
      // Set multiple filter types
      useLibraryStore.getState().setActiveCollection('col-1');
      useLibraryStore.getState().toggleTag('machine-learning');
      useLibraryStore.getState().setSearchQuery('test query');

      // Clear only collection filter
      useLibraryStore.getState().setActiveCollection(null);

      // Other filters should remain
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBeNull();
      expect(state.activeTags).toContain('machine-learning');
      expect(state.searchQuery).toBe('test query');
    });
  });

  describe('Store State Persistence', () => {
    it('should persist expanded collection state', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Expand a collection
      const allButtons = screen.getAllByRole('button');
      const chevronButton = allButtons[0]; // First button is the chevron
      await user.click(chevronButton);

      // Expanded state should be in store
      await waitFor(() => {
        const state = useLibraryStore.getState();
        expect(state.expandedCollectionIds.has('col-1')).toBe(true);
      });

      // Verify persistence to localStorage
      const persisted = localStorage.getItem('library-storage');
      expect(persisted).toBeTruthy();

      if (persisted) {
        const parsed = JSON.parse(persisted);
        expect(parsed.state.expandedCollectionIds).toContain('col-1');
      }
    });

    it('should maintain collection selection during other state updates', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Select collection
      await user.click(screen.getByText('Machine Learning Papers'));

      // Verify selection persists when other store state changes
      act(() => {
        useLibraryStore.getState().setSorting('title', 'asc');
        useLibraryStore.getState().setSearchQuery('test');
      });

      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1');
      expect(state.sortBy).toBe('title');
      expect(state.searchQuery).toBe('test');
    });
  });

  describe('Visual State Synchronization', () => {
    it('should sync visual state with store state', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      const { rerender } = render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Select collection via UI
      const mlCollection = screen.getByText('Machine Learning Papers');
      await user.click(mlCollection);

      // Rerender with updated active ID
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // Collection should be visually active (active class is on parent div)
      const parentDiv = mlCollection.closest('div');
      expect(parentDiv).toHaveClass('bg-app-accent/20');
    });

    it('should update UI when store state changes externally', () => {
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      // Render with no selection
      const { rerender } = render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Change store state externally (not via UI)
      act(() => {
        useLibraryStore.getState().setActiveCollection('col-1');
      });

      // Rerender with updated state
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // UI should reflect the store change (active class is on parent div)
      const mlCollection = screen.getByText('Machine Learning Papers');
      const parentDiv = mlCollection.closest('div');
      expect(parentDiv).toHaveClass('bg-app-accent/20');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty collections list', () => {
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      render(
        <TreeView
          collections={[]}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      // Should show empty state
      expect(screen.getByText('No collections yet')).toBeInTheDocument();
    });

    it('should handle non-existent collection in store', () => {
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      // Set a collection ID that doesn't exist
      useLibraryStore.getState().setActiveCollection('non-existent-id');

      render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="non-existent-id"
        />
      );

      // Should not crash
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();
    });

    it('should handle rapid collection switching', async () => {
      const user = userEvent.setup();
      const onSelectCollection = (id: string) => {
        useLibraryStore.getState().setActiveCollection(id);
      };

      const { rerender } = render(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId={null}
        />
      );

      const mlCollection = screen.getByText('Machine Learning Papers');
      const booksCollection = screen.getByText('Books');

      // Rapidly switch between collections
      await user.click(mlCollection);
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      await user.click(booksCollection);
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-2"
        />
      );

      await user.click(mlCollection);
      rerender(
        <TreeView
          collections={activeCollections}
          onSelectCollection={onSelectCollection}
          activeCollectionId="col-1"
        />
      );

      // Final state should be the last clicked
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1');
    });
  });
});
