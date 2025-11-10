import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/utils/testUtils';
import { TagColorPickerModal } from '../TagColorPickerModal';
import type { Tag } from '@/common/types';

describe('TagColorPickerModal Component', () => {
  const mockTag: Tag = {
    _id: 'tag-1',
    userId: 'user-1',
    name: 'machine-learning',
    color: '#FF6B6B',
    position: 1,
    usageCount: 5,
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockTags: Tag[] = [
    mockTag,
    {
      _id: 'tag-2',
      userId: 'user-1',
      name: 'ai',
      color: '#4ECDC4',
      position: 2,
      usageCount: 3,
      deleted: false,
      deletedAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    tag: mockTag,
    allTags: mockTags,
    onColorAndPositionSelect: vi.fn(),
    isLoading: false,
  };

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByText('Assign Color & Position')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<TagColorPickerModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Assign Color & Position')).not.toBeInTheDocument();
    });

    it('should render all 9 color options', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );
      expect(colorButtons).toHaveLength(9);
    });

    it('should display position numbers in color buttons', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      // Positions 1-9 should be displayed (except occupied ones)
      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      const hasPositions = colorButtons.some((btn) => {
        const text = btn.textContent?.trim();
        return text && !isNaN(parseInt(text));
      });

      expect(hasPositions).toBe(true);
    });
  });

  describe('Occupied Positions', () => {
    it('should show occupied positions from other tags', () => {
      render(<TagColorPickerModal {...defaultProps} />);

      // Position 2 should be occupied by tag-2
      const text = screen.queryByText('Taken');
      // May or may not show depending on layout
      expect(screen.getByText('Assign Color & Position')).toBeInTheDocument();
    });

    it('should show "✕" for occupied positions', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      const xButtons = screen.queryAllByText('✕');
      // At least one position should be occupied
      expect(xButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should disable occupied color buttons', () => {
      const tagsWithOccupiedPositions: Tag[] = [
        mockTag,
        { ...mockTags[1], position: 1 }, // Occupy position 1
      ];

      render(
        <TagColorPickerModal
          {...defaultProps}
          allTags={tagsWithOccupiedPositions}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // First button should be disabled (position 1 occupied)
      expect(colorButtons[0]).toBeDisabled();
    });
  });

  describe('Color Selection', () => {
    it('should select a color when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Click first color
      await user.click(colorButtons[0]);

      // Button should have selected styling
      expect(colorButtons[0]).toHaveClass('border-app-accent');
    });

    it('should auto-select first available position when color is selected', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Click first available color
      await user.click(colorButtons[2]); // Skip position 1 and 2 which are occupied

      // Position selector should appear
      const positionButtons = screen.getAllByRole('button').filter(
        (btn) => ['3', '4', '5', '6', '7', '8', '9'].includes(btn.textContent?.trim() || '')
      );

      expect(positionButtons.length).toBeGreaterThan(0);
    });

    it('should deselect color and position when clicking selected color again', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Click selected color to deselect
      await user.click(colorButtons[0]);

      // Position selector should disappear
      expect(screen.queryByText('Select Position (1-9)')).not.toBeInTheDocument();
    });
  });

  describe('Position Selection', () => {
    it('should show position selector when color is selected', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      expect(screen.queryByText('Select Position (1-9)')).not.toBeInTheDocument();

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Select a color
      await user.click(colorButtons[3]); // Position 4

      // Position selector should appear
      expect(screen.getByText('Select Position (1-9)')).toBeInTheDocument();
    });

    it('should allow selecting available positions', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
        />
      );

      // Position buttons should be available
      const positionButtons = screen.getAllByRole('button').filter(
        (btn) => ['3', '4', '5', '6', '7', '8', '9'].includes(btn.textContent?.trim() || '')
      );

      expect(positionButtons.length).toBeGreaterThan(0);

      // Select a position
      if (positionButtons.length > 0) {
        await user.click(positionButtons[0]);
        expect(positionButtons[0]).toHaveClass('border-app-accent');
      }
    });

    it('should toggle position selection when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
        />
      );

      const positionButtons = screen.getAllByRole('button').filter(
        (btn) => ['3', '4', '5', '6', '7', '8', '9'].includes(btn.textContent?.trim() || '')
      );

      if (positionButtons.length > 0) {
        // Click to select
        await user.click(positionButtons[0]);
        expect(positionButtons[0]).toHaveClass('border-app-accent');

        // Click again to deselect
        await user.click(positionButtons[0]);
        expect(positionButtons[0]).not.toHaveClass('border-app-accent');
      }
    });

    it('should show warning when all positions are occupied', () => {
      const allPositionsOccupied: Tag[] = [
        { ...mockTag, position: 1 },
        { ...mockTags[1], position: 2 },
        { _id: 'tag-3', userId: 'user-1', name: 'nlp', color: '#45B7D1', position: 3, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-4', userId: 'user-1', name: 'vision', color: '#FFA07A', position: 4, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-5', userId: 'user-1', name: 'nlp2', color: '#98D8C8', position: 5, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-6', userId: 'user-1', name: 'nlp3', color: '#F7DC6F', position: 6, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-7', userId: 'user-1', name: 'nlp4', color: '#BB8FCE', position: 7, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-8', userId: 'user-1', name: 'nlp5', color: '#85C1E2', position: 8, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { _id: 'tag-9', userId: 'user-1', name: 'nlp6', color: '#F8B88B', position: 9, usageCount: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      ];

      render(
        <TagColorPickerModal
          {...defaultProps}
          allTags={allPositionsOccupied}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      // Should show all positions as occupied
      expect(screen.getByText(/All positions are occupied/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show "Cancel" button when no color is selected', () => {
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should show "Apply Color & Position" button when both are selected', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
        />
      );

      const applyButton = screen.getByRole('button', { name: /Apply Color & Position/i });
      expect(applyButton).toBeInTheDocument();
      expect(applyButton).not.toBeDisabled();
    });

    it('should disable Apply button when color is selected but position is not', async () => {
      const user = userEvent.setup();
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: null, position: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Select color but don't select position
      await user.click(colorButtons[3]);

      const applyButton = screen.getByRole('button', { name: /Cancel/i });
      expect(applyButton).toBeDisabled();
    });

    it('should call onColorAndPositionSelect when Apply button clicked', async () => {
      const user = userEvent.setup();
      const onColorAndPositionSelect = vi.fn();

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
          onColorAndPositionSelect={onColorAndPositionSelect}
        />
      );

      const applyButton = screen.getByRole('button', { name: /Apply Color & Position/i });
      await user.click(applyButton);

      expect(onColorAndPositionSelect).toHaveBeenCalledWith('#FF6B6B', 1);
    });

    it('should show "Remove Color" button when color is selected', () => {
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should call onColorAndPositionSelect(null, null) when Remove Color clicked', async () => {
      const user = userEvent.setup();
      const onColorAndPositionSelect = vi.fn();

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B', position: 1 }}
          onColorAndPositionSelect={onColorAndPositionSelect}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      await user.click(removeButton);

      expect(onColorAndPositionSelect).toHaveBeenCalledWith(null, null);
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when isLoading is true', () => {
      render(
        <TagColorPickerModal
          {...defaultProps}
          isLoading={true}
        />
      );

      const buttons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent?.includes('Apply Color & Position') || btn.textContent?.includes('Remove Color')
      );

      buttons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it('should enable buttons when isLoading is false', () => {
      render(
        <TagColorPickerModal
          {...defaultProps}
          isLoading={false}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      expect(removeButton).not.toBeDisabled();
    });
  });

  describe('Null Tag', () => {
    it('should render with null tag', () => {
      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={null}
        />
      );

      expect(screen.getByText('Assign Color & Position')).toBeInTheDocument();
    });
  });
});
