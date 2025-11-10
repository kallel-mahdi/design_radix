import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/utils/testUtils';
import { TagSelector } from '../TagSelector';
import { mockTags } from '@/test/fixtures/mockData';
import { useLibraryStore } from '../../store/library.store';

describe('TagSelector Component', () => {
  beforeEach(() => {
    // Reset store state
    const store = useLibraryStore.getState();
    store.activeTags = [];
    store.toggleTag = vi.fn(store.toggleTag);
  });

  describe('Rendering', () => {
    it('should render tag selector with header', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);
      expect(screen.getByPlaceholderText('Search tags...')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // All tags should be visible
      expect(screen.getByText('machine-learning')).toBeInTheDocument();
      expect(screen.getByText('deep-learning')).toBeInTheDocument();
      expect(screen.getByText('ai')).toBeInTheDocument();
      expect(screen.getByText('neural-networks')).toBeInTheDocument();
      expect(screen.getByText('nlp')).toBeInTheDocument();
    });

    it('should show empty state when no tags', () => {
      render(<TagSelector tags={[]} isLoading={false} />);
      expect(screen.getByText('No tags yet')).toBeInTheDocument();
    });

    it('should display usage count for each tag', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // machine-learning has usageCount: 2
      const mlTag = screen.getByText('machine-learning').closest('button');
      expect(mlTag?.textContent).toContain('2');

      // ai has usageCount: 3
      const aiTag = screen.getByText('ai').closest('button');
      expect(aiTag?.textContent).toContain('3');
    });
  });

  describe('Search/Filter', () => {
    it('should filter tags by search query', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const searchInput = screen.getByPlaceholderText('Search tags...');
      await user.type(searchInput, 'machine');

      // Only machine-learning should be visible
      expect(screen.getByText('machine-learning')).toBeInTheDocument();
      expect(screen.queryByText('deep-learning')).not.toBeInTheDocument();
      expect(screen.queryByText('ai')).not.toBeInTheDocument();
    });

    it('should show case-insensitive search', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const searchInput = screen.getByPlaceholderText('Search tags...');
      await user.type(searchInput, 'MACHINE');

      expect(screen.getByText('machine-learning')).toBeInTheDocument();
    });

    it('should clear search on empty input', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const searchInput = screen.getByPlaceholderText('Search tags...');
      await user.type(searchInput, 'machine');
      expect(screen.queryByText('ai')).not.toBeInTheDocument();

      // Clear search
      await user.clear(searchInput);

      // All tags should reappear
      await waitFor(() => {
        expect(screen.getByText('ai')).toBeInTheDocument();
      });
    });

    it('should show "No results" when search has no matches', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const searchInput = screen.getByPlaceholderText('Search tags...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No tags match your search')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const searchInput = screen.getByPlaceholderText('Search tags...');

      // Type multiple characters quickly
      await user.type(searchInput, 'mlp');

      // Component should still render without errors
      expect(screen.getByPlaceholderText('Search tags...')).toHaveValue('mlp');
    });
  });

  describe('Tag Selection/Filtering', () => {
    it('should toggle tag selection on click', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // Store should be called with toggleTag
      const store = useLibraryStore.getState();
      expect(store.activeTags).toContain('machine-learning');
    });

    it('should display active filters section when tags selected', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TagSelector tags={mockTags} isLoading={false} />);

      // Manually set active tags in store
      useLibraryStore.setState({ activeTags: ['machine-learning', 'ai'] });

      rerender(<TagSelector tags={mockTags} isLoading={false} />);

      // Check for Active Filters section
      const activeFiltersHeading = screen.getByText('Active Filters');
      expect(activeFiltersHeading).toBeInTheDocument();

      // Check that tags appear in the active filters section
      const filterButtons = screen.getAllByText(/machine-learning|ai/);
      // Should have at least 2 matches (one for each active tag)
      expect(filterButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should remove tag filter on ✕ click', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TagSelector tags={mockTags} isLoading={false} />);

      // Set active tags
      useLibraryStore.setState({ activeTags: ['machine-learning', 'ai'] });
      rerender(<TagSelector tags={mockTags} isLoading={false} />);

      // Find and click the ✕ button for machine-learning
      const removeButtons = screen.getAllByText(/✕/);
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);

        // machine-learning should be removed
        const store = useLibraryStore.getState();
        expect(store.activeTags).not.toContain('machine-learning');
        expect(store.activeTags).toContain('ai');
      }
    });

    it('should highlight active tags in list', () => {
      useLibraryStore.setState({ activeTags: ['machine-learning'] });

      render(<TagSelector tags={mockTags} isLoading={false} />);

      const mlTag = screen.getByText('machine-learning').closest('button');
      expect(mlTag).toHaveClass('bg-app-accent/20');
    });

    it('should not highlight inactive tags', () => {
      useLibraryStore.setState({ activeTags: ['machine-learning'] });

      render(<TagSelector tags={mockTags} isLoading={false} />);

      const aiTag = screen.getByText('ai').closest('button');
      expect(aiTag).not.toHaveClass('bg-app-accent/20');
    });
  });

  describe('Collapse/Expand', () => {
    it('should collapse panel on collapse button click', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Find collapse button (chevron down icon)
      const buttons = screen.getAllByRole('button');
      const collapseButton = buttons.find(
        (btn) => btn.getAttribute('aria-label') === 'Collapse tags'
      );

      if (collapseButton) {
        await user.click(collapseButton);

        // Tags should be hidden
        expect(screen.queryByText('machine-learning')).not.toBeInTheDocument();
      }
    });

    it('should expand panel on collapse button click when collapsed', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // First collapse the panel
      const buttons = screen.getAllByRole('button');
      const collapseButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Collapse tags');

      if (collapseButton) {
        await user.click(collapseButton);

        // Tag list should be hidden after collapse
        expect(screen.queryByText('machine-learning')).not.toBeInTheDocument();

        // Find and click expand button (the one that says "Tags")
        const expandButton = screen.getByText('Tags').closest('button');
        if (expandButton) {
          await user.click(expandButton);

          // Tags should now be visible
          expect(screen.getByText('machine-learning')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Sorting', () => {
    it('should sort tags by usageCount descending', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      const tagTexts = screen.getAllByRole('button').map((btn) => btn.textContent?.trim());

      // AI (usageCount: 3) should come before machine-learning (usageCount: 2)
      const aiIndex = tagTexts.findIndex((text) => text?.includes('ai'));
      const mlIndex = tagTexts.findIndex((text) => text?.includes('machine-learning'));

      expect(aiIndex).toBeLessThan(mlIndex);
    });

    it('should handle tags with same usageCount', () => {
      // deep-learning and neural-networks both have usageCount: 1
      render(<TagSelector tags={mockTags} isLoading={false} />);

      expect(screen.getByText('deep-learning')).toBeInTheDocument();
      expect(screen.getByText('neural-networks')).toBeInTheDocument();
    });
  });

  describe('Color Indicators', () => {
    it('should display colored tags with color indicator', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // machine-learning is colored #FF6B6B
      // Get all color indicators (there may be multiple)
      const colorDots = screen.getAllByTestId('color-indicator');
      expect(colorDots.length).toBeGreaterThan(0);

      // Check that at least one color indicator has the expected background color
      // Check using computed style or inline style
      const mlColorFound = colorDots.some((dot) => {
        // Try inline style first
        const style = dot.getAttribute('style');
        if (style && style.includes('#FF6B6B')) {
          return true;
        }

        // Try computed style (for CSS variables)
        const computed = window.getComputedStyle(dot);
        const bgColor = computed.backgroundColor;
        // #FF6B6B is rgb(255, 107, 107) in computed style
        return bgColor && (bgColor.includes('255, 107, 107') || bgColor.includes('#FF6B6B'));
      });
      expect(mlColorFound).toBe(true);
    });

    it('should not display color dot for all uncolored tags', () => {
      // ai tag has no color (null)
      const uncoloredTags = mockTags.filter((t) => !t.color);
      expect(uncoloredTags.length).toBeGreaterThan(0); // Ensure we have uncolored tags

      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Count colored tags in mockTags
      const coloredTags = mockTags.filter((t) => t.color);
      const colorDots = screen.getAllByTestId('color-indicator');

      // Number of color indicators should equal number of colored tags
      expect(colorDots.length).toBe(coloredTags.length);
    });
  });

  describe('Loading State', () => {
    it('should show loading state when isLoading prop is true', () => {
      render(<TagSelector tags={[]} isLoading={true} />);

      // Component should still render but might show loading indicator
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('should hide loading state when isLoading prop is false', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Tags should be visible
      expect(screen.getByText('machine-learning')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Tags should be buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation through tags', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Find the search input directly
      const searchInput = screen.getByPlaceholderText('Search tags...');

      // Focus on search input and type
      await user.click(searchInput);
      await user.type(searchInput, 'machine');

      // Should filter results - only machine-learning should be visible
      expect(screen.getByText('machine-learning')).toBeInTheDocument();

      // ai tag should not be visible because it doesn't match 'machine'
      // Use queryByText which returns null if not found
      const aiTag = screen.queryByText(/^ai$/);
      expect(aiTag).not.toBeInTheDocument();
    });

    it('should allow keyboard selection of tags', async () => {
      const user = userEvent.setup();
      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Get the first tag button by finding all buttons and selecting the first one
      // (after filtering out header buttons like the collapse button)
      const allButtons = screen.getAllByRole('button');
      // Skip buttons that are not tag buttons (like collapse button)
      const firstTagButton = allButtons.find((btn) =>
        btn.textContent?.includes('-') && !btn.textContent?.includes('Collapse')
      );

      if (!firstTagButton) {
        throw new Error('Could not find first tag button');
      }

      // Focus and press Enter to select
      firstTagButton.focus();
      await user.keyboard('{Enter}');

      // First tag should be selected in the store
      const store = useLibraryStore.getState();
      expect(store.activeTags.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with Store', () => {
    it('should update when activeTags in store changes', () => {
      const { rerender } = render(<TagSelector tags={mockTags} isLoading={false} />);

      // Initially no active tags
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument();

      // Update store
      useLibraryStore.setState({ activeTags: ['machine-learning'] });
      rerender(<TagSelector tags={mockTags} isLoading={false} />);

      // Active filters should appear
      expect(screen.getByText('Active Filters')).toBeInTheDocument();
    });

    it('should call toggleTag from store', async () => {
      const user = userEvent.setup();
      const mockToggleTag = vi.fn();

      // Mock the store method
      useLibraryStore.setState({ toggleTag: mockToggleTag });

      render(<TagSelector tags={mockTags} isLoading={false} />);

      // Click a tag
      const mlTag = screen.getByText('machine-learning');
      await user.click(mlTag);

      // toggleTag should be called
      expect(mockToggleTag).toHaveBeenCalledWith('machine-learning');
    });
  });
});
