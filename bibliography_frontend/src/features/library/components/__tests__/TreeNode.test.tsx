import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/utils/testUtils';
import { TreeNode } from '../TreeNode';
import type { Collection } from '@/common/types';

describe('TreeNode Component', () => {
  const mockCollection: Collection = {
    _id: 'col-1',
    userId: 'user-1',
    name: 'Machine Learning Papers',
    parentId: null,
    position: 0,
    color: '#FF6B6B',
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    collection: mockCollection,
    isExpanded: false,
    onToggleExpand: vi.fn(),
    onSelect: vi.fn(),
    isActive: false,
    hasChildren: true,
    depth: 0,
  };

  describe('Rendering', () => {
    it('should render collection name', () => {
      render(<TreeNode {...defaultProps} />);
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();
    });

    it('should render folder icon', () => {
      render(<TreeNode {...defaultProps} />);
      // FolderIcon should be present (test by checking for its SVG role)
      const folderIcon = screen.getByText('Machine Learning Papers')
        .closest('div')
        ?.querySelector('svg[class*="w-5"]');
      expect(folderIcon).toBeInTheDocument();
    });

    it('should apply depth-based indentation', () => {
      const { rerender } = render(<TreeNode {...defaultProps} depth={0} />);
      let container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveStyle({ paddingLeft: '16px' });

      // Rerender with depth 1
      rerender(<TreeNode {...defaultProps} depth={1} />);
      container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveStyle({ paddingLeft: '32px' });

      // Rerender with depth 2
      rerender(<TreeNode {...defaultProps} depth={2} />);
      container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveStyle({ paddingLeft: '48px' });
    });
  });

  describe('Expand/Collapse Button', () => {
    it('should show expand button when hasChildren is true', () => {
      render(<TreeNode {...defaultProps} hasChildren={true} />);
      const buttons = screen.getAllByRole('button');
      // First button should be the chevron
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should hide expand button (invisible) when hasChildren is false', () => {
      render(<TreeNode {...defaultProps} hasChildren={false} />);
      const buttons = screen.getAllByRole('button');
      const chevronButton = buttons[0];
      expect(chevronButton).toHaveClass('invisible');
    });

    it('should rotate chevron when expanded', () => {
      const { rerender } = render(
        <TreeNode {...defaultProps} isExpanded={false} />
      );
      let buttons = screen.getAllByRole('button');
      let chevronButton = buttons[0];
      let chevronIcon = chevronButton.querySelector('svg');
      expect(chevronIcon).not.toHaveClass('rotate-90');

      // Rerender with expanded
      rerender(<TreeNode {...defaultProps} isExpanded={true} />);
      buttons = screen.getAllByRole('button');
      chevronButton = buttons[0];
      chevronIcon = chevronButton.querySelector('svg');
      expect(chevronIcon).toHaveClass('rotate-90');
    });

    it('should call onToggleExpand when chevron clicked', async () => {
      const user = userEvent.setup();
      const onToggleExpand = vi.fn();
      render(
        <TreeNode {...defaultProps} hasChildren={true} onToggleExpand={onToggleExpand} />
      );

      const buttons = screen.getAllByRole('button');
      const chevronButton = buttons[0];
      await user.click(chevronButton);

      expect(onToggleExpand).toHaveBeenCalledOnce();
    });
  });

  describe('Selection', () => {
    it('should call onSelect when collection name clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeNode {...defaultProps} onSelect={onSelect} />);

      const nameButton = screen.getByText('Machine Learning Papers');
      await user.click(nameButton);

      expect(onSelect).toHaveBeenCalledOnce();
    });

    it('should apply active styling when isActive is true', () => {
      render(<TreeNode {...defaultProps} isActive={true} />);
      const container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveClass('bg-app-accent/20');
    });

    it('should not apply active styling when isActive is false', () => {
      render(<TreeNode {...defaultProps} isActive={false} />);
      const container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).not.toHaveClass('bg-app-accent/20');
    });

    it('should apply hover styling when not active', () => {
      render(<TreeNode {...defaultProps} isActive={false} />);
      const container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveClass('hover:bg-app-surface-hover');
    });
  });

  describe('Color Indicators', () => {
    it('should show color dot when collection has color', () => {
      render(
        <TreeNode
          {...defaultProps}
          collection={{ ...mockCollection, color: '#FF6B6B' }}
        />
      );

      const colorDot = screen.getByTestId('color-indicator');
      expect(colorDot).toBeInTheDocument();
      expect(colorDot).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });

    it('should not show color dot when collection has no color', () => {
      render(
        <TreeNode
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const colorDot = screen.queryByTestId('color-indicator');
      expect(colorDot).not.toBeInTheDocument();
    });

    it('should display different colors correctly', () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

      colors.forEach((color) => {
        const { unmount } = render(
          <TreeNode
            {...defaultProps}
            collection={{ ...mockCollection, color }}
          />
        );

        const colorDot = screen.getByTestId('color-indicator');
        expect(colorDot).toHaveStyle({ backgroundColor: color });

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<TreeNode {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Chevron + Name
    });

    it('should support keyboard navigation on chevron', async () => {
      const user = userEvent.setup();
      const onToggleExpand = vi.fn();
      render(
        <TreeNode
          {...defaultProps}
          hasChildren={true}
          onToggleExpand={onToggleExpand}
        />
      );

      const buttons = screen.getAllByRole('button');
      const chevronButton = buttons[0];

      // Tab to chevron and press Enter
      chevronButton.focus();
      await user.keyboard('{Enter}');

      expect(onToggleExpand).toHaveBeenCalledOnce();
    });

    it('should support keyboard navigation on name', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeNode {...defaultProps} onSelect={onSelect} />);

      const nameButton = screen.getByText('Machine Learning Papers');
      nameButton.focus();
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledOnce();
    });
  });

  describe('Item Count Badge', () => {
    it('should render item count badge', () => {
      render(<TreeNode {...defaultProps} />);
      const badge = screen.getByText('0');
      expect(badge).toBeInTheDocument();
    });

    it('should apply group-hover styles to badge', () => {
      render(<TreeNode {...defaultProps} />);
      const container = screen.getByText('Machine Learning Papers').closest('div');
      const badge = container?.querySelector('[class*="group-hover"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Props Changes', () => {
    it('should update when collection changes', () => {
      const { rerender } = render(<TreeNode {...defaultProps} />);
      expect(screen.getByText('Machine Learning Papers')).toBeInTheDocument();

      const newCollection = { ...mockCollection, name: 'Deep Learning Papers' };
      rerender(<TreeNode {...defaultProps} collection={newCollection} />);
      expect(screen.getByText('Deep Learning Papers')).toBeInTheDocument();
    });

    it('should update when isActive prop changes', () => {
      const { rerender } = render(<TreeNode {...defaultProps} isActive={false} />);
      let container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).not.toHaveClass('bg-app-accent/20');

      rerender(<TreeNode {...defaultProps} isActive={true} />);
      container = screen.getByText('Machine Learning Papers').closest('div');
      expect(container).toHaveClass('bg-app-accent/20');
    });
  });
});
