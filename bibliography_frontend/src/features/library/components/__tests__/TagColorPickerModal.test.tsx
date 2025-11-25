import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, within } from '@/test/utils/testUtils';
import { TagColorPickerModal } from '../TagColorPickerModal';
import type { Tag } from '@/common/types';

describe('TagColorPickerModal Component', () => {
  const createTag = (overrides: Partial<Tag> = {}): Tag => ({
    _id: 'tag-1',
    userId: 'user-1',
    name: 'machine-learning',
    color: null,
    position: null,
    usageCount: 5,
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  const coloredTag = createTag({
    color: '#FF6B6B',
    position: 1,
  });

  const uncoloredTag = createTag({
    color: null,
    position: null,
  });

  const mockTags: Tag[] = [
    coloredTag,
    createTag({
      _id: 'tag-2',
      name: 'ai',
      color: '#4ECDC4',
      position: 2,
    }),
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    tag: uncoloredTag,
    allTags: mockTags,
    onColorAndPositionSelect: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with "Set Tag Color" title', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByText('Set Tag Color')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<TagColorPickerModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Set Tag Color')).not.toBeInTheDocument();
    });

    it('should render 9 color swatches', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      const swatches = screen.getAllByTestId('color-swatch');
      expect(swatches).toHaveLength(9);
    });

    it('should render color swatches without position numbers', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      const swatches = screen.getAllByTestId('color-swatch');
      swatches.forEach((swatch) => {
        // Swatches should not contain number text
        expect(swatch.textContent).toBe('');
      });
    });

    it('should render position dropdown', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByRole('combobox', { name: /Select position/i })).toBeInTheDocument();
    });

    it('should render keyboard instruction when position is selected', () => {
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} />);
      expect(screen.getByText(/to add\/remove this tag from selected items/i)).toBeInTheDocument();
    });

    it('should render max tags info message', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByText(/Maximum of 9 tags can have colors assigned/i)).toBeInTheDocument();
    });

    it('should always render Cancel button', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should always render Set Color button', () => {
      render(<TagColorPickerModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Set Color/i })).toBeInTheDocument();
    });

    it('should show Remove Color only when tag has existing color', () => {
      // With colored tag
      const { rerender } = render(<TagColorPickerModal {...defaultProps} tag={coloredTag} />);
      expect(screen.getByRole('button', { name: /Remove Color/i })).toBeInTheDocument();

      // With uncolored tag
      rerender(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} />);
      expect(screen.queryByRole('button', { name: /Remove Color/i })).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should pre-select a color for new/uncolored tag', () => {
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);
      const swatches = screen.getAllByTestId('color-swatch');
      // At least one swatch should be selected (has aria-pressed="true")
      const selectedSwatches = swatches.filter(
        (swatch) => swatch.getAttribute('aria-pressed') === 'true'
      );
      expect(selectedSwatches.length).toBe(1);
    });

    it('should pre-select next available position for new tag', () => {
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);
      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      expect(dropdown).toHaveValue('1');
    });

    it('should show current color and position for existing colored tag', () => {
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} />);

      // Check selected color
      const swatches = screen.getAllByTestId('color-swatch');
      const redSwatch = swatches[0]; // First color is red (#FF6B6B)
      expect(redSwatch.getAttribute('aria-pressed')).toBe('true');

      // Check position
      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      expect(dropdown).toHaveValue('1');
    });
  });

  describe('Color Selection', () => {
    it('should allow selecting any of 9 colors', async () => {
      const user = userEvent.setup();
      // Use coloredTag to have known initial state (red = index 0)
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[]} />);

      const swatches = screen.getAllByTestId('color-swatch');

      // Click a different color than the pre-selected one (index 0 = red)
      await user.click(swatches[2]);
      expect(swatches[2].getAttribute('aria-pressed')).toBe('true');
    });

    it('should highlight selected color with visual indicator', async () => {
      const user = userEvent.setup();
      // Use coloredTag to have known initial state (red = index 0)
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[]} />);

      const swatches = screen.getAllByTestId('color-swatch');
      // Click a different color than the pre-selected one (index 0 = red)
      await user.click(swatches[3]);

      // Selected swatch should have border-app-accent class
      expect(swatches[3]).toHaveClass('border-app-accent');
    });

    it('should allow changing color selection', async () => {
      const user = userEvent.setup();
      // Use coloredTag to have a known initial color selection
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[]} />);

      const swatches = screen.getAllByTestId('color-swatch');

      // First swatch (red) should be selected (coloredTag has #FF6B6B)
      expect(swatches[0].getAttribute('aria-pressed')).toBe('true');

      // Change to second color
      await user.click(swatches[1]);
      expect(swatches[0].getAttribute('aria-pressed')).toBe('false');
      expect(swatches[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('should deselect color when clicking selected color again', async () => {
      const user = userEvent.setup();
      // Use coloredTag to have a known initial color selection
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[]} />);

      const swatches = screen.getAllByTestId('color-swatch');

      // First swatch (red) should be selected
      expect(swatches[0].getAttribute('aria-pressed')).toBe('true');

      // Click it again to deselect
      await user.click(swatches[0]);
      expect(swatches[0].getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Position Selection', () => {
    it('should show dropdown with available positions', () => {
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);

      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      const options = within(dropdown).getAllByRole('option');

      // Should have options 1-9
      expect(options).toHaveLength(9);
    });

    it('should exclude positions used by other tags', () => {
      // Create a tag with different name to properly test position exclusion
      const differentTag = createTag({ _id: 'different-tag', name: 'different-tag', color: null, position: null });
      // mockTags has positions 1 and 2 used by tags with different names
      render(<TagColorPickerModal {...defaultProps} tag={differentTag} allTags={mockTags} />);

      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      const options = within(dropdown).getAllByRole('option');

      // Should have 7 options (3-9) since positions 1 and 2 are taken by other tags
      expect(options).toHaveLength(7);
      expect(options.map((o) => o.textContent)).toEqual(['3', '4', '5', '6', '7', '8', '9']);
    });

    it('should allow selecting any available position', async () => {
      const user = userEvent.setup();
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);

      const dropdown = screen.getByRole('combobox', { name: /Select position/i });

      await user.selectOptions(dropdown, '5');
      expect(dropdown).toHaveValue('5');
    });

    it('should allow keeping current position for existing tag', () => {
      // Tag has position 1, which is "used" by the same tag
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[coloredTag]} />);

      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      expect(dropdown).toHaveValue('1');

      // Position 1 should be available since it's the current tag's position
      const options = within(dropdown).getAllByRole('option');
      expect(options.map((o) => o.textContent)).toContain('1');
    });
  });

  describe('Actions', () => {
    it('should call onColorAndPositionSelect with selected values on Set Color', async () => {
      const user = userEvent.setup();
      const onColorAndPositionSelect = vi.fn();

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={coloredTag} // Use colored tag so we know the initial state
          allTags={[]}
          onColorAndPositionSelect={onColorAndPositionSelect}
        />
      );

      // coloredTag has color #FF6B6B and position 1
      // Just click Set Color to confirm the existing values
      await user.click(screen.getByRole('button', { name: /Set Color/i }));

      expect(onColorAndPositionSelect).toHaveBeenCalledWith('#FF6B6B', 1);
    });

    it('should call onColorAndPositionSelect(null, null) on Remove Color', async () => {
      const user = userEvent.setup();
      const onColorAndPositionSelect = vi.fn();

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={coloredTag}
          onColorAndPositionSelect={onColorAndPositionSelect}
        />
      );

      await user.click(screen.getByRole('button', { name: /Remove Color/i }));

      expect(onColorAndPositionSelect).toHaveBeenCalledWith(null, null);
    });

    it('should call onClose on Cancel', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<TagColorPickerModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should disable Set Color when all 9 positions are occupied', () => {
      // Create 9 tags with all positions taken
      const allColoredTags: Tag[] = Array.from({ length: 9 }, (_, i) =>
        createTag({
          _id: `tag-${i}`,
          name: `tag-${i}`,
          color: '#FF6B6B',
          position: i + 1,
        })
      );

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={createTag({ _id: 'new-tag', name: 'new-tag' })}
          allTags={allColoredTags}
        />
      );

      const setColorButton = screen.getByRole('button', { name: /Set Color/i });
      expect(setColorButton).toBeDisabled();
    });

    it('should show warning when all positions are occupied', () => {
      const allColoredTags: Tag[] = Array.from({ length: 9 }, (_, i) =>
        createTag({
          _id: `tag-${i}`,
          name: `tag-${i}`,
          color: '#FF6B6B',
          position: i + 1,
        })
      );

      render(
        <TagColorPickerModal
          {...defaultProps}
          tag={createTag({ _id: 'new-tag', name: 'new-tag' })}
          allTags={allColoredTags}
        />
      );

      expect(screen.getByText(/All positions are occupied/i)).toBeInTheDocument();
    });

    it('should disable buttons when isLoading is true', () => {
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Set Color/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Remove Color/i })).toBeDisabled();
    });

    it('should render with null tag', () => {
      render(<TagColorPickerModal {...defaultProps} tag={null} />);
      expect(screen.getByText('Set Tag Color')).toBeInTheDocument();
    });

    it('should disable Set Color when no color is selected', async () => {
      const user = userEvent.setup();
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);

      // Deselect the pre-selected color
      const swatches = screen.getAllByTestId('color-swatch');
      const selectedSwatch = swatches.find(
        (s) => s.getAttribute('aria-pressed') === 'true'
      );
      if (selectedSwatch) {
        await user.click(selectedSwatch);
      }

      const setColorButton = screen.getByRole('button', { name: /Set Color/i });
      expect(setColorButton).toBeDisabled();
    });
  });

  describe('Keyboard Instruction', () => {
    it('should display the selected position number in keyboard instruction', () => {
      render(<TagColorPickerModal {...defaultProps} tag={coloredTag} allTags={[]} />);

      // Modal renders in a portal, so use document.querySelector
      const kbd = document.querySelector('kbd');
      expect(kbd).toBeInTheDocument();
      expect(kbd?.textContent).toBe('1');
    });

    it('should update keyboard instruction when position changes', async () => {
      const user = userEvent.setup();
      render(<TagColorPickerModal {...defaultProps} tag={uncoloredTag} allTags={[]} />);

      const dropdown = screen.getByRole('combobox', { name: /Select position/i });
      await user.selectOptions(dropdown, '5');

      // Modal renders in a portal, so use document.querySelector
      const kbd = document.querySelector('kbd');
      expect(kbd).toBeInTheDocument();
      expect(kbd?.textContent).toBe('5');
    });
  });
});
