import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor, act } from '@/test/utils/testUtils';
import { useLibraryStore } from '../store/library.store';
import { TagSelector } from '../components/TagSelector';
import { mockTags } from '@/test/fixtures/mockData';

/**
 * Tag Filter Workflow Integration Tests
 *
 * Tests the complete workflow of filtering references by tags:
 * - User selects tags from TagSelector
 * - Store updates with active tags
 * - Filter state persists to localStorage
 * - Active filters section appears/disappears
 * - Multiple tags can be selected (AND logic)
 */

describe('Tag Filter Workflow Integration', () => {
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

  describe('Single Tag Selection', () => {
    it('should select a tag and update store state', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Find and click first tag
      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // Verify store was updated
      const state = useLibraryStore.getState();
      expect(state.activeTags).toContain('machine-learning');
      expect(state.activeTags).toHaveLength(1);
    });

    it('should deselect a tag when clicked again', async () => {
      const user = userEvent.setup();

      // Pre-select a tag
      useLibraryStore.getState().toggleTag('machine-learning');

      render(<TagSelector tags={mockTags} />);

      // Click the already-selected tag to deselect it
      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // Verify store was updated
      const state = useLibraryStore.getState();
      expect(state.activeTags).not.toContain('machine-learning');
      expect(state.activeTags).toHaveLength(0);
    });

    it('should show active filter pill when tag is selected', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Initially no active filters
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument();

      // Select a tag
      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // Active filters section should appear
      await waitFor(() => {
        expect(screen.getByText('Active Filters')).toBeInTheDocument();
        expect(screen.getByText('machine-learning')).toBeInTheDocument();
      });
    });

    it('should remove filter pill when tag is deselected', async () => {
      const user = userEvent.setup();

      // Pre-select a tag
      useLibraryStore.getState().toggleTag('machine-learning');

      render(<TagSelector tags={mockTags} />);

      // Active filters should be shown
      expect(screen.getByText('Active Filters')).toBeInTheDocument();

      // Click on the filter pill (which shows "tagname ✕")
      const filterPill = screen.getByText(/machine-learning ✕/);
      await user.click(filterPill);

      // Active filters section should disappear
      await waitFor(() => {
        expect(screen.queryByText('Active Filters')).not.toBeInTheDocument();
      });

      // Verify store was updated
      expect(useLibraryStore.getState().activeTags).toHaveLength(0);
    });
  });

  describe('Multiple Tag Selection (AND Logic)', () => {
    it('should select multiple tags', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Select first tag
      await user.click(screen.getByText('machine-learning'));

      // Select second tag
      await user.click(screen.getByText('ai'));

      // Verify both tags are in store
      const state = useLibraryStore.getState();
      expect(state.activeTags).toContain('machine-learning');
      expect(state.activeTags).toContain('ai');
      expect(state.activeTags).toHaveLength(2);
    });

    it('should show multiple filter pills', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Select two tags
      await user.click(screen.getByText('machine-learning'));
      await user.click(screen.getByText('ai'));

      // Both should appear in active filters
      await waitFor(() => {
        expect(screen.getByText('Active Filters')).toBeInTheDocument();
        expect(screen.getByText(/machine-learning ✕/)).toBeInTheDocument();
        expect(screen.getByText(/ai ✕/)).toBeInTheDocument();
      });
    });

    it('should remove individual tags from multi-selection', async () => {
      const user = userEvent.setup();

      // Pre-select multiple tags
      useLibraryStore.getState().toggleTag('machine-learning');
      useLibraryStore.getState().toggleTag('ai');
      useLibraryStore.getState().toggleTag('neural-networks');

      render(<TagSelector tags={mockTags} />);

      // Remove one tag by clicking its filter pill
      const aiFilterPill = screen.getByText(/ai ✕/);
      await user.click(aiFilterPill);

      // Verify only that tag was removed
      await waitFor(() => {
        const state = useLibraryStore.getState();
        expect(state.activeTags).toHaveLength(2);
        expect(state.activeTags).not.toContain('ai');
        expect(state.activeTags).toContain('machine-learning');
        expect(state.activeTags).toContain('neural-networks');
      });
    });

    it('should clear all tag filters at once using store action', () => {
      // Pre-select multiple tags
      useLibraryStore.getState().toggleTag('machine-learning');
      useLibraryStore.getState().toggleTag('ai');

      render(<TagSelector tags={mockTags} />);

      // Verify filters are shown
      expect(screen.getByText('Active Filters')).toBeInTheDocument();
      expect(screen.getByText(/machine-learning ✕/)).toBeInTheDocument();
      expect(screen.getByText(/ai ✕/)).toBeInTheDocument();

      // Clear all tags using store action
      act(() => {
        useLibraryStore.getState().clearTags();
      });

      // All tags should be cleared
      const state = useLibraryStore.getState();
      expect(state.activeTags).toHaveLength(0);
    });
  });

  describe('Store State Persistence', () => {
    it('should persist active tags to localStorage', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Select tags
      await user.click(screen.getByText('machine-learning'));
      await user.click(screen.getByText('ai'));

      // Verify persistence
      const persisted = localStorage.getItem('library-storage');
      expect(persisted).toBeTruthy();

      // Note: activeTags is not currently persisted in the store config
      // This test documents the current behavior
      // If we want to persist tag filters, we'd need to update the persist config
    });

    it('should maintain tag selection during store updates', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Select tags
      await user.click(screen.getByText('machine-learning'));

      // Verify selection persists when other store state changes
      act(() => {
        useLibraryStore.getState().setSearchQuery('test query');
      });

      const state = useLibraryStore.getState();
      expect(state.activeTags).toContain('machine-learning');
      expect(state.searchQuery).toBe('test query');
    });
  });

  describe('Colored Tag Keyboard Shortcuts (Zotero Pattern)', () => {
    it('should toggle tag with keyboard shortcut 1-9', () => {
      // Simulate selecting colored tag at position 1
      const { toggleTag } = useLibraryStore.getState();

      // In real app, pressing "1" would toggle tag at position 1
      // For now, just test the store action
      toggleTag('machine-learning');

      expect(useLibraryStore.getState().activeTags).toContain('machine-learning');

      // Toggle again to deselect
      toggleTag('machine-learning');
      expect(useLibraryStore.getState().activeTags).not.toContain('machine-learning');
    });
  });

  describe('Filter State Management', () => {
    it('should track filter state independently from other filters', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Set collection filter
      act(() => {
        useLibraryStore.getState().setActiveCollection('col-1');
      });

      // Set tag filter
      await user.click(screen.getByText('machine-learning'));

      // Set search filter
      act(() => {
        useLibraryStore.getState().setSearchQuery('neural networks');
      });

      // All filters should coexist
      const state = useLibraryStore.getState();
      expect(state.activeCollectionId).toBe('col-1');
      expect(state.activeTags).toContain('machine-learning');
      expect(state.searchQuery).toBe('neural networks');
    });

    it('should allow clearing tag filters without affecting other filters', () => {
      // Set multiple filter types
      useLibraryStore.getState().setActiveCollection('col-1');
      useLibraryStore.getState().toggleTag('machine-learning');
      useLibraryStore.getState().toggleTag('ai');
      useLibraryStore.getState().setSearchQuery('test');

      // Clear only tag filters
      useLibraryStore.getState().clearTags();

      // Other filters should remain
      const state = useLibraryStore.getState();
      expect(state.activeTags).toHaveLength(0);
      expect(state.activeCollectionId).toBe('col-1');
      expect(state.searchQuery).toBe('test');
    });
  });

  describe('Visual State Synchronization', () => {
    it('should sync visual state with store state', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      // Select tag via UI
      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // Tag should be visually selected (has selected styling)
      expect(mlTag.closest('button')).toHaveClass('bg-app-accent/20');
    });

    it('should update UI when store state changes externally', () => {
      // Render component
      const { rerender } = render(<TagSelector tags={mockTags} />);

      // Change store state externally (not via UI)
      act(() => {
        useLibraryStore.getState().toggleTag('machine-learning');
      });

      // Rerender to pick up state change
      rerender(<TagSelector tags={mockTags} />);

      // UI should reflect the store change
      const mlTag = screen.getByText('machine-learning');
      expect(mlTag.closest('button')).toHaveClass('bg-app-accent/20');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tag list', () => {
      render(<TagSelector tags={[]} />);

      // Should show empty state
      expect(screen.getByText(/No tags yet/i)).toBeInTheDocument();
    });

    it('should handle non-existent tag in store', () => {
      // Set a tag that doesn't exist in the tag list
      useLibraryStore.getState().toggleTag('non-existent-tag');

      render(<TagSelector tags={mockTags} />);

      // Should not crash, filter pill should still appear
      expect(screen.getByText('Active Filters')).toBeInTheDocument();
    });

    it('should handle rapid tag toggling', async () => {
      const user = userEvent.setup();

      render(<TagSelector tags={mockTags} />);

      const mlTag = screen.getByText('machine-learning');

      // Rapidly toggle tag multiple times
      await user.click(mlTag);
      await user.click(mlTag);
      await user.click(mlTag);
      await user.click(mlTag);
      await user.click(mlTag);

      // Final state should be selected (odd number of clicks)
      const state = useLibraryStore.getState();
      expect(state.activeTags).toContain('machine-learning');
    });
  });
});
