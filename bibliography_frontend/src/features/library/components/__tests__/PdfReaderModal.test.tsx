/**
 * PdfReaderModal Unit Tests
 *
 * Tests for the full-screen PDF reader modal component
 * 60% of test pyramid (unit tests)
 *
 * Test categories:
 * - Rendering states (loading, no PDF, with PDF)
 * - Zoom controls (zoom in/out)
 * - Page navigation (prev/next, page input)
 * - Close behavior (button, escape key)
 * - Keyboard shortcuts
 * - Download/open actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { PdfReaderModal } from '../PdfReaderModal';
import type { Reference } from '@/common/types';

// Mock annotation queries and mutations
vi.mock('../api/annotations.queries', () => ({
  useAnnotationsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../api/annotations.mutations', () => ({
  useCreateAnnotationMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateAnnotationMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteAnnotationMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: any) => {
    // Simulate successful load
    setTimeout(() => onLoadSuccess?.({ numPages: 5 }), 0);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale }: any) => (
    <div data-testid="pdf-page" data-page={pageNumber} data-scale={scale}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' },
  },
}));

// Mock the worker URL import
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: '/mock-worker.js',
}));

// Mock HeadlessUI components to render children directly in tests
// Pattern from ReferenceModal.test.tsx
vi.mock('@headlessui/react', () => {
  const Dialog = ({ children, ...props }: any) => (
    <div role="dialog" {...props}>
      {children}
    </div>
  );
  Dialog.Panel = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  Dialog.Title = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>;

  const Transition = ({ children, show, ...props }: any) =>
    show ? <div {...props}>{children}</div> : null;
  Transition.Child = ({ children, ...props }: any) => <div {...props}>{children}</div>;

  return { Dialog, Transition };
});

// Mock icons - must include ALL icons used by PdfReaderModal
vi.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassMinusIcon: () => <span data-testid="zoom-out-icon">-</span>,
  MagnifyingGlassPlusIcon: () => <span data-testid="zoom-in-icon">+</span>,
  ChevronLeftIcon: () => <span data-testid="prev-icon">←</span>,
  ChevronRightIcon: () => <span data-testid="next-icon">→</span>,
  ArrowDownTrayIcon: () => <span data-testid="download-icon">↓</span>,
  ArrowTopRightOnSquareIcon: () => <span data-testid="new-tab-icon">↗</span>,
  XMarkIcon: () => <span data-testid="close-icon">×</span>,
  Bars3BottomLeftIcon: () => <span data-testid="sidebar-icon">☰</span>,
}));

// Mock Button component
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

const mockReferenceWithPdf: Reference = {
  _id: 'ref-123',
  userId: 'user-1',
  type: 'article',
  title: 'Test PDF Article',
  authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
  year: 2024,
  venue: 'Test Venue',
  doi: '10.1234/test',
  citationKey: 'doe2024test',
  tags: [],
  collectionIds: [],
  hasPdf: true,
  pdf: {
    originalName: 'test-document.pdf',
    storedName: 'abc123.pdf',
    size: 1024,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  sourceRaw: { provider: 'manual', payload: {} },
  deleted: false,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockReferenceWithoutPdf: Reference = {
  ...mockReferenceWithPdf,
  _id: 'ref-456',
  title: 'Test Article Without PDF',
  hasPdf: false,
  pdf: undefined,
};

describe('PdfReaderModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering States', () => {
    it('should not render when isOpen is false', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render loading state when reference is null', () => {
      render(
        <PdfReaderModal reference={null} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading reference...')).toBeInTheDocument();
    });

    it('should render no PDF state when reference has no PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithoutPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('This reference has no PDF attached')).toBeInTheDocument();
    });

    it('should render PDF viewer when reference has PDF', async () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test PDF Article')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });

    it('should display reference title in header', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('heading', { name: 'Test PDF Article' })).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should show zoom controls when reference has PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should increase zoom when zoom in is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /zoom in/i }));
      expect(screen.getByText('125%')).toBeInTheDocument();
    });

    it('should decrease zoom when zoom out is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /zoom out/i }));
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should disable zoom out at minimum zoom (50%)', async () => {
      const user = userEvent.setup();
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Click zoom out twice to reach 50%
      await user.click(screen.getByRole('button', { name: /zoom out/i }));
      await user.click(screen.getByRole('button', { name: /zoom out/i }));

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
    });

    it('should not show zoom controls when reference has no PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithoutPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('button', { name: /zoom in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /zoom out/i })).not.toBeInTheDocument();
    });
  });

  describe('Page Navigation', () => {
    it('should show page navigation when reference has PDF', async () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    it('should disable prev button on first page', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    });

    it('should update page display after PDF loads', async () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Wait for PDF to "load" (mocked to resolve with 5 pages)
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have close button with proper aria-label', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show download button when reference has PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('should show open in new tab button when reference has PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /open in new tab/i })).toBeInTheDocument();
    });

    it('should not show download/open buttons when reference has no PDF', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithoutPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('button', { name: /download pdf/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open in new tab/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <PdfReaderModal
          reference={mockReferenceWithPdf}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
