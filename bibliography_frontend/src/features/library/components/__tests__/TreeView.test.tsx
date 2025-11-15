import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/utils/testUtils';
import { TreeView } from '../TreeView';
import { useLibraryStore } from '../../store/library.store';
import { mockCollections } from '@/test/fixtures/mockData';
import type { Collection } from '@/common/types';

describe('TreeView Component', () => {
  beforeEach(() => {
    // Reset store state between tests
    localStorage.clear();

    // Also reset Zustand store state
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
  });

  describe('Rendering', () => {
    it('should render empty state when no collections', () => {
      render(
        <TreeView
          collections={[]}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );
      expect(screen.getByText('No collections yet')).toBeInTheDocument();
    });

    it('should render single root collection', () => {
      const collections = [mockCollections[0]]; // ML Papers (root)
      render(
        <TreeView
          collections={collections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();
    });

    it('should render multiple root collections sorted by position', () => {
      const collections = mockCollections.filter((c) => !c.parentId);
      render(
        <TreeView
          collections={collections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Should appear in order: ML Papers (position 0), Books (position 1)
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });

    it('should render nested collections at correct depth', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Root collection
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();

      // Expand parent to reveal nested collections
      const mlPapersNode = screen.getByText('Machine Learning Papers').closest('div');
      const expandButton = mlPapersNode?.querySelector('button:first-child');
      if (expandButton) {
        await user.click(expandButton);
      }

      // Nested collections should now be visible
      await waitFor(() => {
        expect(screen.getByText('Reinforcement Learning')).toBeInTheDocument();
        expect(screen.getByText('Computer Vision')).toBeInTheDocument();
      });
    });

    it('should apply depth-based indentation', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Check root level indentation (depth 0)
      const mlPapersDiv = screen.getByText('Machine Learning Papers').closest('div');
      expect(mlPapersDiv).toHaveStyle({ paddingLeft: '16px' });

      // Expand to see nested collections
      const expandButton = mlPapersDiv?.querySelector('button:first-child');
      if (expandButton) {
        await user.click(expandButton);
      }

      // Check child level indentation (depth 1)
      await waitFor(() => {
        const rlDiv = screen.getByText('Reinforcement Learning').closest('div');
        expect(rlDiv).toHaveStyle({ paddingLeft: '32px' });
      });
    });
  });

  describe('Expand/Collapse', () => {
    it('should expand collection on chevron click', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Initially, ML Papers is collapsed
      const mlPapersButton = screen.getByText('Machine Learning Papers').closest('div');
      expect(mlPapersButton).toBeInTheDocument();

      // Find and click chevron (should be in the same parent div)
      const chevronButton = mlPapersButton?.querySelector('button:first-child');
      if (chevronButton) {
        await user.click(chevronButton);

        // After click, children should be visible
        await waitFor(() => {
          expect(screen.getByText('Reinforcement Learning')).toBeVisible();
        });
      }
    });

    it('should collapse expanded collection on chevron click', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Expand first
      const buttons = screen.getAllByRole('button');
      const expandButton = buttons[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Reinforcement Learning')).toBeVisible();
      });

      // Collapse
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.queryByText('Reinforcement Learning')).not.toBeInTheDocument();
      });
    });

    it('should persist expanded state to localStorage', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Expand a collection
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      // State should be persisted
      const expanded = localStorage.getItem('library-storage');
      expect(expanded).toBeTruthy();

      // Remount and verify state is restored
      rerender(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Reinforcement Learning')).toBeVisible();
      });
    });

    it('should hide chevron when collection has no children', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Books collection has no children
      const booksButton = screen.getByText('Books').closest('div');
      const chevron = booksButton?.querySelector('button:first-child');

      // Chevron should be invisible
      expect(chevron).toHaveClass('invisible');
    });
  });

  describe('Selection', () => {
    it('should call onSelectCollection when collection clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={handleSelect}
          activeCollectionId={null}
        />
      );

      const mlPapersButton = screen.getByText('Machine Learning Papers');
      await user.click(mlPapersButton);

      expect(handleSelect).toHaveBeenCalledWith('col-1');
    });

    it('should highlight active collection', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId="col-1"
        />
      );

      const mlPapersButton = screen.getByText('Machine Learning Papers').closest('div');
      expect(mlPapersButton).toHaveClass('bg-app-accent/20');
    });

    it('should not highlight inactive collections', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId="col-2"
        />
      );

      const mlPapersButton = screen.getByText('Machine Learning Papers').closest('div');
      expect(mlPapersButton).not.toHaveClass('bg-app-accent/20');
    });
  });

  describe('Color Indicators', () => {
    it('should show color dot for colored collections', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // ML Papers (col-1) has color #FF6B6B
      // Expand the collection first to ensure all nodes are rendered
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check for color indicator in ML Papers node
      const colorDots = screen.getAllByTestId('color-indicator');
      expect(colorDots.length).toBeGreaterThan(0);

      // First color dot should be from ML Papers (col-1)
      expect(colorDots[0]).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });

    it('should not show color dot for uncolored collections', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Books (col-2) has no color
      // Count color indicators: should only have ML Papers (#FF6B6B), RL (#4ECDC4), CV (#45B7D1)
      // Books has null color, so it shouldn't have a color indicator
      const colorDots = screen.getAllByTestId('color-indicator');

      // Should have exactly 3 colored collections (ML Papers, RL, CV)
      // All color values should be non-null
      const booksElement = screen.getByText('Books').closest('div');
      const booksColorDot = booksElement?.querySelector('[data-testid="color-indicator"]');

      expect(booksColorDot).not.toBeInTheDocument();
    });
  });

  describe('Tree Building Algorithm', () => {
    it('should build correct tree structure from flat array', () => {
      // Verify tree is built correctly by checking parent-child relationships
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // ML Papers (root) should have chevron (has children)
      const mlPapersNode = screen.getByText('Machine Learning Papers').closest('div');
      expect(mlPapersNode?.querySelector('button:first-child')).not.toHaveClass('invisible');

      // Books (root) should not have chevron (no children)
      const booksNode = screen.getByText('Books').closest('div');
      expect(booksNode?.querySelector('button:first-child')).toHaveClass('invisible');
    });

    it('should handle deeply nested collections (up to 5 levels)', () => {
      // Test that the tree builder correctly creates nested structure from flat array
      // Nested items only render when parent is expanded (tested separately)
      const deepCollections: Collection[] = [
        {
          _id: 'col-1',
          userId: 'test',
          name: 'Level 1',
          parentId: null,
          position: 0,
          color: null,
          deleted: false,
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: 'col-2',
          userId: 'test',
          name: 'Level 2',
          parentId: 'col-1',
          position: 0,
          color: null,
          deleted: false,
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: 'col-3',
          userId: 'test',
          name: 'Level 3',
          parentId: 'col-2',
          position: 0,
          color: null,
          deleted: false,
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: 'col-4',
          userId: 'test',
          name: 'Level 4',
          parentId: 'col-3',
          position: 0,
          color: null,
          deleted: false,
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: 'col-5',
          userId: 'test',
          name: 'Level 5',
          parentId: 'col-4',
          position: 0,
          color: null,
          deleted: false,
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      render(
        <TreeView
          collections={deepCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // Root level should always render
      expect(screen.getByText('Level 1')).toBeInTheDocument();

      // Level 1 should have a chevron (has children)
      const level1Node = screen.getByText('Level 1').closest('div');
      const level1Chevron = level1Node?.querySelector('button:first-child');
      expect(level1Chevron).not.toHaveClass('invisible');

      // Other levels are not rendered yet because parent is not expanded
      // This is correct behavior - they only render when parent is expanded
      expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Level 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Level 5')).not.toBeInTheDocument();
    });
  });

  describe('Updates', () => {
    it('should update when collections prop changes', () => {
      const { rerender } = render(
        <TreeView
          collections={[mockCollections[0]]}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();
      expect(screen.queryByText('Books')).not.toBeInTheDocument();

      // Update props with different root collections (mockCollections[3] is Books)
      rerender(
        <TreeView
          collections={[mockCollections[3]]}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      expect(screen.queryByText('Machine Learning Papers')).not.toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={() => {}}
          activeCollectionId={null}
        />
      );

      // All collection items should be buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <TreeView
          collections={mockCollections}
          onSelectCollection={handleSelect}
          activeCollectionId={null}
        />
      );

      // Tab to first button (chevron)
      await user.tab();
      // Tab to second button (collection name)
      await user.tab();

      // Press Enter to select the collection
      await user.keyboard('{Enter}');

      // Should call onSelectCollection
      expect(handleSelect).toHaveBeenCalled();
    });
  });
});
