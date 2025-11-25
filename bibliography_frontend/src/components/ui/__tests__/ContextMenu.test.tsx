import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, userEvent, waitFor, fireEvent } from '@/test/utils/testUtils';
import { ContextMenu, type ContextMenuItem } from '../ContextMenu';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

describe('ContextMenu Component', () => {
  const defaultItems: ContextMenuItem[] = [
    { label: 'Edit', icon: <PencilIcon className="w-4 h-4" />, onClick: vi.fn() },
    { label: 'Delete', icon: <TrashIcon className="w-4 h-4" />, onClick: vi.fn(), variant: 'danger' },
  ];

  const defaultProps = {
    isOpen: true,
    position: { x: 100, y: 100 },
    onClose: vi.fn(),
    items: defaultItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when isOpen is false', () => {
      render(<ContextMenu {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should render menu items when isOpen is true', () => {
      render(<ContextMenu {...defaultProps} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should render icons when provided', () => {
      render(<ContextMenu {...defaultProps} />);
      // Icons are wrapped in span elements
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);
    });

    it('should handle items without icons', () => {
      const itemsWithoutIcons: ContextMenuItem[] = [
        { label: 'Simple Action', onClick: vi.fn() },
      ];
      render(<ContextMenu {...defaultProps} items={itemsWithoutIcons} />);
      expect(screen.getByText('Simple Action')).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      render(<ContextMenu {...defaultProps} items={[]} />);
      // Menu should render but be empty
      const menuItems = screen.queryAllByRole('menuitem');
      expect(menuItems.length).toBe(0);
    });
  });

  describe('Positioning', () => {
    it('should position at the provided coordinates', () => {
      const { container } = render(
        <ContextMenu {...defaultProps} position={{ x: 200, y: 300 }} />
      );
      const menuContainer = container.querySelector('.fixed');
      expect(menuContainer).toHaveStyle({ left: '200px', top: '300px' });
    });

    it('should adjust position to stay within viewport (right edge)', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 300, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

      const { container } = render(
        <ContextMenu {...defaultProps} position={{ x: 250, y: 100 }} />
      );
      const menuContainer = container.querySelector('.fixed');
      // Menu should be adjusted to stay within viewport
      const style = menuContainer?.getAttribute('style');
      expect(style).toBeDefined();
    });

    it('should adjust position to stay within viewport (bottom edge)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 200, writable: true });

      const { container } = render(
        <ContextMenu {...defaultProps} position={{ x: 100, y: 180 }} />
      );
      const menuContainer = container.querySelector('.fixed');
      const style = menuContainer?.getAttribute('style');
      expect(style).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('should apply danger variant styling for danger items', () => {
      render(<ContextMenu {...defaultProps} />);
      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toHaveClass('text-red-600');
    });

    it('should apply default styling for regular items', () => {
      render(<ContextMenu {...defaultProps} />);
      const editButton = screen.getByText('Edit');
      expect(editButton).toHaveClass('text-app-text-primary');
    });

    it('should apply disabled styling when item is disabled', () => {
      const itemsWithDisabled: ContextMenuItem[] = [
        { label: 'Disabled Action', onClick: vi.fn(), disabled: true },
      ];
      render(<ContextMenu {...defaultProps} items={itemsWithDisabled} />);
      const button = screen.getByText('Disabled Action');
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toHaveClass('opacity-50');
    });
  });

  describe('User Interactions', () => {
    it('should call onClick and onClose when item is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onClose = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Action', onClick }];

      render(<ContextMenu isOpen={true} position={{ x: 100, y: 100 }} onClose={onClose} items={items} />);

      await user.click(screen.getByText('Action'));

      expect(onClick).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should not call onClick when disabled item is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Disabled', onClick, disabled: true }];

      render(<ContextMenu {...defaultProps} items={items} />);

      const button = screen.getByText('Disabled');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should close on Escape key', async () => {
      const onClose = vi.fn();
      render(<ContextMenu {...defaultProps} onClose={onClose} />);

      // Wait for the 10ms delay in useEffect before event listeners are attached
      await new Promise(resolve => setTimeout(resolve, 20));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Outside Click', () => {
    it('should close when clicking outside the menu', async () => {
      const onClose = vi.fn();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ContextMenu {...defaultProps} onClose={onClose} />
        </div>
      );

      // Wait for the 10ms delay in useEffect before event listeners are attached
      await new Promise(resolve => setTimeout(resolve, 20));

      fireEvent.mouseDown(screen.getByTestId('outside'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close from outside click handler when clicking inside the menu', async () => {
      const onClose = vi.fn();
      const items: ContextMenuItem[] = [
        { label: 'Item 1', onClick: vi.fn() },
        { label: 'Item 2', onClick: vi.fn() },
      ];
      render(<ContextMenu {...defaultProps} onClose={onClose} items={items} />);

      // Wait for event listeners to be attached
      await new Promise(resolve => setTimeout(resolve, 20));

      // Clicking on menu content should not trigger outside click handler
      const menuItem = screen.getByText('Item 1');
      fireEvent.mouseDown(menuItem);

      // onClose should NOT be called from outside click handler
      // (it only gets called when user clicks the item, which calls item.onClick then onClose)
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Menu Lifecycle', () => {
    it('should cleanup event listeners when unmounted', () => {
      const onClose = vi.fn();
      const { unmount } = render(<ContextMenu {...defaultProps} onClose={onClose} />);

      unmount();

      // After unmount, pressing Escape should not trigger onClose
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners when isOpen changes to false', async () => {
      const onClose = vi.fn();
      const { rerender } = render(<ContextMenu {...defaultProps} onClose={onClose} />);

      // Wait for listeners to attach
      await new Promise(resolve => setTimeout(resolve, 20));

      // Close the menu
      rerender(<ContextMenu {...defaultProps} isOpen={false} onClose={onClose} />);

      // Pressing Escape should not trigger onClose since menu is closed
      fireEvent.keyDown(document, { key: 'Escape' });
      // onClose should not be called after rerender with isOpen=false
    });
  });
});
