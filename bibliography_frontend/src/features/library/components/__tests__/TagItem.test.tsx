import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/utils/testUtils';
import { TagItem } from '../TagItem';
import type { Tag } from '@/common/types';

describe('TagItem Component', () => {
  const mockTag: Tag = {
    _id: 'tag-1',
    userId: 'user-1',
    name: 'machine-learning',
    color: '#FF6B6B',
    usageCount: 5,
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    tag: mockTag,
    isActive: false,
    onSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render tag name and usage count', () => {
      render(<TagItem {...defaultProps} />);
      expect(screen.getByText('machine-learning')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render with proper button role', () => {
      render(<TagItem {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle tags with zero usage count', () => {
      render(
        <TagItem
          {...defaultProps}
          tag={{ ...mockTag, usageCount: 0 }}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should apply active styling when isActive is true', () => {
      render(<TagItem {...defaultProps} isActive={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-app-accent/20');
      expect(button).toHaveClass('text-app-text-primary');
    });

    it('should apply inactive styling when isActive is false', () => {
      render(<TagItem {...defaultProps} isActive={false} />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-app-accent/20');
      expect(button).toHaveClass('text-app-text-secondary');
    });
  });

  describe('Color Indicators', () => {
    it('should show color dot when tag has color', () => {
      render(
        <TagItem
          {...defaultProps}
          tag={{ ...mockTag, color: '#FF6B6B' }}
        />
      );
      const colorDot = screen.getByTestId('color-indicator');
      expect(colorDot).toBeInTheDocument();
      expect(colorDot).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });

    it('should not show color dot when tag has no color', () => {
      render(
        <TagItem
          {...defaultProps}
          tag={{ ...mockTag, color: null }}
        />
      );
      const colorDot = screen.queryByTestId('color-indicator');
      expect(colorDot).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelect with tag name when clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TagItem {...defaultProps} onSelect={onSelect} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onSelect).toHaveBeenCalledWith('machine-learning');
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it('should call onContextMenu with tag name on right-click', async () => {
      const user = userEvent.setup();
      const onContextMenu = vi.fn();
      render(
        <TagItem {...defaultProps} onContextMenu={onContextMenu} />
      );

      const button = screen.getByRole('button');
      await user.pointer({ keys: '[MouseRight]', target: button });

      expect(onContextMenu).toHaveBeenCalledWith(
        'machine-learning',
        expect.any(Object)
      );
    });
  });
});
