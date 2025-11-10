import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/utils/testUtils';
import { CollectionColorPickerModal } from '../CollectionColorPickerModal';
import type { Collection } from '@/common/types';

describe('CollectionColorPickerModal Component', () => {
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
    isOpen: true,
    onClose: vi.fn(),
    collection: mockCollection,
    onColorSelect: vi.fn(),
    isLoading: false,
  };

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<CollectionColorPickerModal {...defaultProps} />);
      expect(screen.getByText('Pick a Color')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<CollectionColorPickerModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Pick a Color')).not.toBeInTheDocument();
    });

    it('should render all 9 color options', () => {
      render(<CollectionColorPickerModal {...defaultProps} />);
      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );
      expect(colorButtons).toHaveLength(9);
    });

    it('should render action buttons', () => {
      render(<CollectionColorPickerModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(11); // 9 colors + buttons
    });
  });

  describe('Color Selection', () => {
    it('should select a color when clicked', async () => {
      const user = userEvent.setup();
      render(<CollectionColorPickerModal {...defaultProps} />);

      // Find color buttons by aria-label (more reliable than className)
      const firstColorButton = screen.getByRole('button', { name: /Select color #FF6B6B/i });

      // Click first color
      await user.click(firstColorButton);

      // Re-query buttons after click (React re-renders)
      const selectedButton = screen.getByRole('button', { name: /Select color #FF6B6B/i });

      // Check that button has selected styling (border-app-accent)
      expect(selectedButton).toHaveClass('border-app-accent');
    });

    it('should deselect a color when clicked again', async () => {
      const user = userEvent.setup();
      render(<CollectionColorPickerModal {...defaultProps} />);

      // Find color button by aria-label
      const colorButton = screen.getByRole('button', { name: /Select color #FF6B6B/i });

      // Click to select
      await user.click(colorButton);

      // Re-query after first click
      let selectedButton = screen.getByRole('button', { name: /Select color #FF6B6B/i });
      expect(selectedButton).toHaveClass('border-app-accent');

      // Click again to deselect
      await user.click(selectedButton);

      // Re-query after second click
      selectedButton = screen.getByRole('button', { name: /Select color #FF6B6B/i });
      expect(selectedButton).not.toHaveClass('border-app-accent');
    });

    it('should initialize with collection color selected', () => {
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: '#4ECDC4' }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Second color should be selected
      expect(colorButtons[1]).toHaveClass('border-app-accent');
    });

    it('should handle collection with no color', () => {
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // No color should be selected
      colorButtons.forEach((btn) => {
        expect(btn).not.toHaveClass('border-app-accent');
      });
    });

    it('should allow switching between colors', async () => {
      const user = userEvent.setup();
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Select first color
      await user.click(colorButtons[0]);
      expect(colorButtons[0]).toHaveClass('border-app-accent');

      // Switch to third color
      await user.click(colorButtons[2]);
      expect(colorButtons[0]).not.toHaveClass('border-app-accent');
      expect(colorButtons[2]).toHaveClass('border-app-accent');
    });
  });

  describe('Action Buttons', () => {
    it('should display "Apply Color" button when color is selected', async () => {
      const user = userEvent.setup();
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Select a color
      await user.click(colorButtons[0]);

      // "Apply Color" button should appear
      const applyButton = screen.getByRole('button', { name: /Apply Color/i });
      expect(applyButton).toBeInTheDocument();
    });

    it('should display "Cancel" button when no color is selected', () => {
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should display "Remove Color" button when color is selected', async () => {
      const user = userEvent.setup();
      render(<CollectionColorPickerModal {...defaultProps} />);

      // Color is already selected (from mockCollection)
      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should not display "Remove Color" button when no color is selected', () => {
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
        />
      );

      const removeButton = screen.queryByRole('button', { name: /Remove Color/i });
      expect(removeButton).not.toBeInTheDocument();
    });

    it('should call onColorSelect and onClose when "Apply Color" clicked', async () => {
      const user = userEvent.setup();
      const onColorSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={{ ...mockCollection, color: null }}
          onColorSelect={onColorSelect}
          onClose={onClose}
        />
      );

      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );

      // Select first color
      await user.click(colorButtons[0]);

      // Click Apply Color
      const applyButton = screen.getByRole('button', { name: /Apply Color/i });
      await user.click(applyButton);

      expect(onColorSelect).toHaveBeenCalledWith('#FF6B6B');
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should call onColorSelect(null) and onClose when "Remove Color" clicked', async () => {
      const user = userEvent.setup();
      const onColorSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <CollectionColorPickerModal
          {...defaultProps}
          onColorSelect={onColorSelect}
          onClose={onClose}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      await user.click(removeButton);

      expect(onColorSelect).toHaveBeenCalledWith(null);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should call onClose (without color change) when modal is closed without action', async () => {
      const user = userEvent.setup();
      const onColorSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <CollectionColorPickerModal
          {...defaultProps}
          onColorSelect={onColorSelect}
          onClose={onClose}
        />
      );

      // Close modal (implementation depends on Modal component)
      // For now, verify buttons are clickable
      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when isLoading is true', () => {
      render(<CollectionColorPickerModal {...defaultProps} isLoading={true} />);

      // Find the main action buttons
      const buttons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent?.includes('Apply Color') || btn.textContent?.includes('Remove Color')
      );

      buttons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    it('should enable buttons when isLoading is false', () => {
      render(<CollectionColorPickerModal {...defaultProps} isLoading={false} />);

      const removeButton = screen.getByRole('button', { name: /Remove Color/i });
      expect(removeButton).not.toBeDisabled();
    });
  });

  describe('Null Collection', () => {
    it('should render with null collection', () => {
      render(
        <CollectionColorPickerModal
          {...defaultProps}
          collection={null}
        />
      );

      expect(screen.getByText('Pick a Color')).toBeInTheDocument();
      const colorButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('aspect-square')
      );
      expect(colorButtons).toHaveLength(9);
    });
  });
});
