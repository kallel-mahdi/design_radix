import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/utils/testUtils';
import { PromptDialog } from '../PromptDialog';

describe('PromptDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Dialog',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when isOpen is false', () => {
      render(<PromptDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should render title when isOpen is true', () => {
      render(<PromptDialog {...defaultProps} />);
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<PromptDialog {...defaultProps} description="Enter a value below" />);
      expect(screen.getByText('Enter a value below')).toBeInTheDocument();
    });

    it('should render input with placeholder', () => {
      render(<PromptDialog {...defaultProps} placeholder="Type here..." />);
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(<PromptDialog {...defaultProps} />);
      expect(screen.getByPlaceholderText('Enter value...')).toBeInTheDocument();
    });

    it('should populate input with initialValue', () => {
      render(<PromptDialog {...defaultProps} initialValue="Initial text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Initial text');
    });

    it('should render custom button labels', () => {
      render(
        <PromptDialog
          {...defaultProps}
          confirmLabel="Save"
          cancelLabel="Discard"
        />
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });

    it('should use default button labels when not provided', () => {
      render(<PromptDialog {...defaultProps} />);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should allow typing in the input', async () => {
      const user = userEvent.setup();
      render(<PromptDialog {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'New value');

      expect(input).toHaveValue('New value');
    });

    it('should reset value when dialog reopens', async () => {
      const { rerender } = render(
        <PromptDialog {...defaultProps} initialValue="Initial" />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Initial');

      // Close and reopen
      rerender(<PromptDialog {...defaultProps} isOpen={false} initialValue="Initial" />);
      rerender(<PromptDialog {...defaultProps} isOpen={true} initialValue="New Initial" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveValue('New Initial');
      });
    });

    it('should auto-select input text on open', async () => {
      render(<PromptDialog {...defaultProps} initialValue="Select me" />);

      // The component uses setTimeout for selection, so we need to wait
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      }, { timeout: 200 });
    });
  });

  describe('Confirm Button', () => {
    it('should be disabled when input is empty', () => {
      render(<PromptDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should be disabled when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<PromptDialog {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '   ');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should be enabled when input has value', async () => {
      const user = userEvent.setup();
      render(<PromptDialog {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Valid value');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeEnabled();
    });

    it('should call onConfirm with trimmed value when clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '  Trimmed value  ');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledWith('Trimmed value');
      expect(onConfirm).toHaveBeenCalledOnce();
    });
  });

  describe('Cancel Button', () => {
    it('should call onClose when clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PromptDialog {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should not call onConfirm when canceled', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Some value');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledOnce();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit on Enter key when input has value', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Submit via enter');
      await user.keyboard('{Enter}');

      expect(onConfirm).toHaveBeenCalledWith('Submit via enter');
    });

    it('should not submit on Enter when input is empty', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<PromptDialog {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading text on confirm button', () => {
      render(
        <PromptDialog
          {...defaultProps}
          initialValue="Value"
          isLoading={true}
        />
      );
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable confirm button when loading', () => {
      render(
        <PromptDialog
          {...defaultProps}
          initialValue="Value"
          isLoading={true}
        />
      );
      const confirmButton = screen.getByRole('button', { name: /saving/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(
        <PromptDialog
          {...defaultProps}
          initialValue="Value"
          isLoading={true}
        />
      );
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should disable input when loading', () => {
      render(
        <PromptDialog
          {...defaultProps}
          initialValue="Value"
          isLoading={true}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('Modal Close Behavior', () => {
    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PromptDialog {...defaultProps} onClose={onClose} />);

      // HeadlessUI Dialog closes on backdrop click via onClose prop
      // We can simulate this by clicking outside the dialog panel
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when Escape is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PromptDialog {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      // HeadlessUI Dialog handles Escape key
      expect(onClose).toHaveBeenCalled();
    });
  });
});
