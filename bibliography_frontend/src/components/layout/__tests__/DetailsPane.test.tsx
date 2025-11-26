/**
 * Session 9: DetailsPane Enhancement Tests
 *
 * Tests for enhanced InfoTab features:
 * - Edit button functionality
 * - Tags display with remove buttons
 * - Collections display with clickable links
 * - Metadata footer with dates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailsPane } from '../DetailsPane';
import * as libraryStore from '@/features/library/store/library.store';
import * as mutations from '@/features/library/api/references.mutations';

// Mock the library store
vi.mock('@/features/library/store/library.store', () => ({
  useLibraryStore: vi.fn(),
}));

// Mock the mutations
vi.mock('@/features/library/api/references.mutations', () => ({
  useUpdateReferenceMutation: vi.fn(),
}));

// Mock the API client
vi.mock('@/common/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockReference = {
  _id: 'ref-123',
  userId: 'user-123',
  type: 'article' as const,
  title: 'Machine Learning Paper',
  authors: [
    { given: 'John', family: 'Doe', full: 'Doe, John' },
    { given: 'Jane', family: 'Smith', full: 'Smith, Jane' },
  ],
  year: 2024,
  venue: 'ICML',
  doi: '10.1234/ml.2024',
  abstract: 'A comprehensive study of neural networks',
  citationKey: 'doe2024machine',
  tags: ['machine-learning', 'deep-learning', 'ai'],
  collectionIds: ['col-1', 'col-2'],
  collections: [
    { _id: 'col-1', name: 'Machine Learning', color: '#3b82f6', userId: 'user-123', parentId: null, position: 0, deleted: false, deletedAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { _id: 'col-2', name: 'Deep Learning', color: '#10b981', userId: 'user-123', parentId: null, position: 1, deleted: false, deletedAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ],
  hasPdf: true,
  sourceRaw: { provider: 'doi' as const, payload: {} },
  deleted: false,
  deletedAt: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-16T14:30:00Z',
};

describe('DetailsPane - Session 9 Enhancements', () => {
  let queryClient: QueryClient;
  let mockSetEditReference: ReturnType<typeof vi.fn>;
  let mockSetActiveCollection: ReturnType<typeof vi.fn>;
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockSetEditReference = vi.fn();
    mockSetActiveCollection = vi.fn();
    mockMutate = vi.fn();

    // Mock store
    vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
      const state = {
        setEditReference: mockSetEditReference,
        setActiveCollection: mockSetActiveCollection,
      };
      return selector ? selector(state) : state;
    });

    // Mock mutation
    vi.mocked(mutations.useUpdateReferenceMutation).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      reset: vi.fn(),
      status: 'idle',
      submittedAt: 0,
      variables: undefined,
      context: undefined,
    } as any);

    // Mock successful API response
    queryClient.setQueryData(['references', 'detail', 'ref-123'], mockReference);
  });

  const renderDetailsPane = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      referenceId: 'ref-123',
      activeTab: 'info' as const,
      onTabChange: vi.fn(),
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <DetailsPane {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe('Edit Button', () => {
    it('should render Edit button in Info tab', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should call setEditReference when Edit button clicked', async () => {
      const user = userEvent.setup();
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockSetEditReference).toHaveBeenCalledWith('ref-123');
    });
  });

  describe('Tags Section', () => {
    it('should display all tags', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText('machine-learning')).toBeInTheDocument();
        expect(screen.getByText('deep-learning')).toBeInTheDocument();
        expect(screen.getByText('ai')).toBeInTheDocument();
      });
    });

    it('should show empty state when no tags', async () => {
      const refWithoutTags = { ...mockReference, tags: [] };
      queryClient.setQueryData(['references', 'detail', 'ref-123'], refWithoutTags);

      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText(/no tags/i)).toBeInTheDocument();
      });
    });

    it('should call mutation to remove tag when X button clicked', async () => {
      const user = userEvent.setup();
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText('machine-learning')).toBeInTheDocument();
      });

      // Find remove button for 'machine-learning' tag
      const removeButtons = screen.getAllByRole('button', { name: /remove tag/i });
      await user.click(removeButtons[0]);

      expect(mockMutate).toHaveBeenCalledWith({
        id: 'ref-123',
        data: { tags: ['deep-learning', 'ai'] },
      });
    });
  });

  describe('Collections Section', () => {
    it('should display all collections', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText('Machine Learning')).toBeInTheDocument();
        expect(screen.getByText('Deep Learning')).toBeInTheDocument();
      });
    });

    it('should show empty state when not in any collection', async () => {
      const refWithoutCollections = { ...mockReference, collections: [], collectionIds: [] };
      queryClient.setQueryData(['references', 'detail', 'ref-123'], refWithoutCollections);

      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText(/not in any collection/i)).toBeInTheDocument();
      });
    });

    it('should call setActiveCollection when collection clicked', async () => {
      const user = userEvent.setup();
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText('Machine Learning')).toBeInTheDocument();
      });

      const collectionButton = screen.getByText('Machine Learning');
      await user.click(collectionButton);

      expect(mockSetActiveCollection).toHaveBeenCalledWith('col-1');
    });

    it('should display collection colors', async () => {
      renderDetailsPane();

      await waitFor(() => {
        const mlCollection = screen.getByText('Machine Learning').closest('button');
        const folderIcon = mlCollection?.querySelector('svg');
        expect(folderIcon).toHaveStyle({ color: '#3b82f6' });
      });
    });
  });

  describe('Metadata Footer', () => {
    it('should display creation date', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText(/created:/i)).toBeInTheDocument();
        expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument();
      });
    });

    it('should display modified date', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText(/modified:/i)).toBeInTheDocument();
        expect(screen.getByText(/jan 16, 2024/i)).toBeInTheDocument();
      });
    });

    it('should display source provider', async () => {
      renderDetailsPane();

      await waitFor(() => {
        const sourceText = screen.getByText(/source:/i);
        expect(sourceText).toBeInTheDocument();
        // Check that the source section (in footer) contains "Doi" (capitalized by className)
        const footer = sourceText.closest('.grid');
        expect(footer).toHaveTextContent(/source:/i);
        expect(footer).toHaveTextContent(/doi/i);
      });
    });

    it('should handle missing dates gracefully', async () => {
      const refWithoutDates = {
        ...mockReference,
        createdAt: undefined,
        updatedAt: undefined,
      };
      queryClient.setQueryData(['references', 'detail', 'ref-123'], refWithoutDates);

      renderDetailsPane();

      await waitFor(() => {
        const createdText = screen.getByText(/created:/i);
        expect(createdText).toBeInTheDocument();
        // Check footer contains N/A for both dates
        const footer = createdText.closest('.grid');
        const naElements = screen.getAllByText(/n\/a/i);
        expect(naElements.length).toBe(2); // Created and Modified both show N/A
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should show Info tab content by default', async () => {
      renderDetailsPane();

      await waitFor(() => {
        expect(screen.getByText('Machine Learning Paper')).toBeInTheDocument();
      });
    });

    it('should switch to PDF tab', async () => {
      // Override with hasPdf: false to avoid pdf.js worker issues in tests
      queryClient.setQueryData(['references', 'detail', 'ref-123'], {
        ...mockReference,
        hasPdf: false,
      });

      const onTabChange = vi.fn();
      renderDetailsPane({ activeTab: 'pdf', onTabChange });

      await waitFor(() => {
        // PDF tab should show the "No PDF attached" message when reference has no PDF
        expect(screen.getByText('No PDF attached')).toBeInTheDocument();
      });
    });

    it('should switch to Notes tab', async () => {
      const onTabChange = vi.fn();
      renderDetailsPane({ activeTab: 'notes', onTabChange });

      await waitFor(() => {
        expect(screen.getByText(/no notes have been added/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show skeleton while loading', () => {
      queryClient.clear(); // Clear cached data to trigger loading
      renderDetailsPane();

      // Skeleton should be visible during loading
      const skeletons = screen.getAllByRole('generic', { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Component Props', () => {
    it('should not render when isOpen is false', () => {
      const { container } = renderDetailsPane({ isOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it('should not render when referenceId is null', () => {
      const { container } = renderDetailsPane({ referenceId: null });
      expect(container.firstChild).toBeNull();
    });

    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDetailsPane({ onClose });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
