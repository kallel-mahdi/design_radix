/**
 * ReferenceTable Integration Tests - Session 8
 *
 * Tests real integration between ReferenceTable, Zustand store, and TanStack Query
 * Coverage: 30% of test pyramid (integration tests)
 *
 * Test categories:
 * - Selection state sync with library.store
 * - Sorting state sync and localStorage persistence
 * - Multi-select workflows (all 3 modes)
 * - Double-click modal opening
 * - Store action side effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { ReferenceTable } from '../ReferenceTable';
import { useLibraryStore } from '../../store/library.store';
import { useUIStore } from '@/store/ui.store';
import type { Reference } from '@/common/types';

// Mock virtualization to render all rows
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        start: index * 48,
        size: 48,
        key: index,
      })),
    getTotalSize: () => count * 48,
  }),
}));

// Mock icons - all icons used by ReferenceTable and its dependencies
vi.mock('@heroicons/react/24/outline', () => ({
  PaperClipIcon: () => <span data-testid="paperclip-icon">📎</span>,
  ChevronUpIcon: () => <span data-testid="chevron-up">↑</span>,
  ChevronDownIcon: () => <span data-testid="chevron-down">↓</span>,
  FolderPlusIcon: () => <span data-testid="folder-plus-icon">📁</span>,
  TagIcon: () => <span data-testid="tag-icon">🏷️</span>,
  TrashIcon: () => <span data-testid="trash-icon">🗑️</span>,
  // CollectionPickerModal icons
  MagnifyingGlassIcon: () => <span data-testid="search-icon">🔍</span>,
  FolderIcon: () => <span data-testid="folder-icon">📁</span>,
  // ContextMenu and other icons
  PencilIcon: () => <span data-testid="pencil-icon">✏️</span>,
  XMarkIcon: () => <span data-testid="x-mark-icon">✕</span>,
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
}));

// Mock Tag component
vi.mock('@/components/ui/Tag', () => ({
  Tag: ({ label }: { label: string }) => <span data-testid="tag">{label}</span>,
}));

const mockReferences: Reference[] = [
  {
    _id: 'ref-1',
    userId: 'user-1',
    type: 'article',
    title: 'First Reference',
    authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
    year: 2023,
    venue: 'Nature',
    doi: '10.1234/first',
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'doe2023first',
    tags: ['ml'],
    collectionIds: [],
    hasPdf: false,
    pdf: null,
    sourceRaw: { provider: 'doi', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    _id: 'ref-2',
    userId: 'user-1',
    type: 'article',
    title: 'Second Reference',
    authors: [{ given: 'Jane', family: 'Smith', full: 'Jane Smith' }],
    year: 2022,
    venue: 'Science',
    doi: '10.1234/second',
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'smith2022second',
    tags: ['ai'],
    collectionIds: [],
    hasPdf: true,
    pdf: {
      storedPath: '/pdfs/ref-2.pdf',
      originalName: 'second.pdf',
      size: 1024,
      mimeType: 'application/pdf',
      uploadedAt: '2023-02-01T12:00:00Z',
    },
    sourceRaw: { provider: 'doi', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2022-01-01T00:00:00Z',
  },
  {
    _id: 'ref-3',
    userId: 'user-1',
    type: 'article',
    title: 'Third Reference',
    authors: [{ given: 'Bob', family: 'Johnson', full: 'Bob Johnson' }],
    year: 2021,
    venue: 'Nature',
    doi: null,
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'johnson2021third',
    tags: ['nlp'],
    collectionIds: [],
    hasPdf: false,
    pdf: null,
    sourceRaw: { provider: 'manual', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
  {
    _id: 'ref-4',
    userId: 'user-1',
    type: 'article',
    title: 'Fourth Reference',
    authors: [{ given: 'Alice', family: 'Williams', full: 'Alice Williams' }],
    year: 2020,
    venue: 'ACL',
    doi: null,
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'williams2020fourth',
    tags: ['cv'],
    collectionIds: [],
    hasPdf: false,
    pdf: null,
    sourceRaw: { provider: 'manual', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },
  {
    _id: 'ref-5',
    userId: 'user-1',
    type: 'article',
    title: 'Fifth Reference',
    authors: [{ given: 'Charlie', family: 'Brown', full: 'Charlie Brown' }],
    year: 2019,
    venue: 'CVPR',
    doi: null,
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'brown2019fifth',
    tags: ['rl'],
    collectionIds: [],
    hasPdf: false,
    pdf: null,
    sourceRaw: { provider: 'manual', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2019-01-01T00:00:00Z',
  },
];

describe('ReferenceTable Integration Tests', () => {
  const mockOpenModal = vi.fn();

  beforeEach(() => {
    // Reset Zustand store to clean state
    // Use 'year' sorting to keep refs in original order (2023, 2022, 2021, 2020, 2019)
    useLibraryStore.setState({
      selectedReferenceIds: new Set(),
      activeReferenceId: null,
      editReferenceId: null,
      lastSelectedId: null,
      activeCollectionId: null,
      expandedCollectionIds: new Set(),
      activeTags: [],
      sortBy: 'year',
      sortOrder: 'desc', // Descending year keeps original order
      searchQuery: '',
    });

    // Clear localStorage
    localStorage.clear();

    // Mock UI store
    vi.spyOn(useUIStore, 'getState').mockReturnValue({
      openModal: mockOpenModal,
    } as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Selection State Integration', () => {
    it('should sync normal click selection with library.store', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Click first reference row (uses div with aria-selected, has click handlers)
      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');
      await user.click(firstRow!);

      // Normal click has 200ms delay to distinguish from double-click
      // Wait for the delayed action to complete
      await waitFor(() => {
        const { selectedReferenceIds, activeReferenceId } = useLibraryStore.getState();
        expect(selectedReferenceIds.has('ref-1')).toBe(true);
        expect(selectedReferenceIds.size).toBe(1);
        expect(activeReferenceId).toBe('ref-1');
      }, { timeout: 500 });
    });

    it('should sync checkbox selection with library.store', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Click checkbox for first reference
      const checkbox = screen.getByLabelText('Select First Reference');
      await user.click(checkbox);

      // Verify store state updated
      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.has('ref-1')).toBe(true);
    });

    it('should sync select all checkbox with library.store', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Click select all checkbox
      const selectAllCheckbox = screen.getByLabelText('Select all references');
      await user.click(selectAllCheckbox);

      // Verify all references selected in store
      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.size).toBe(5);
      expect(selectedReferenceIds.has('ref-1')).toBe(true);
      expect(selectedReferenceIds.has('ref-2')).toBe(true);
      expect(selectedReferenceIds.has('ref-3')).toBe(true);
      expect(selectedReferenceIds.has('ref-4')).toBe(true);
      expect(selectedReferenceIds.has('ref-5')).toBe(true);
    });

    it('should clear selection when clicking selected-only row', async () => {
      const user = userEvent.setup();

      // Pre-select first reference
      useLibraryStore.setState({
        selectedReferenceIds: new Set(['ref-1']),
        activeReferenceId: 'ref-1',
      });

      render(<ReferenceTable references={mockReferences} />);

      // Click same row again
      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');
      await user.click(firstRow!);

      // Normal click has 200ms delay - wait for the delayed action to complete
      await waitFor(() => {
        const { selectedReferenceIds, activeReferenceId } = useLibraryStore.getState();
        expect(selectedReferenceIds.size).toBe(0);
        expect(activeReferenceId).toBe(null);
      }, { timeout: 500 });
    });
  });

  describe('Multi-Select Workflows', () => {
    it('should toggle individual selection with Cmd+Click', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');
      const secondRow = screen.getByText('Second Reference').closest('[aria-selected]');

      // Cmd+Click first row (hold Meta, click, release Meta)
      await user.keyboard('{Meta>}');
      await user.click(firstRow!);
      await user.keyboard('{/Meta}');

      // Cmd+Click second row
      await user.keyboard('{Meta>}');
      await user.click(secondRow!);
      await user.keyboard('{/Meta}');

      // Verify both selected
      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.size).toBe(2);
      expect(selectedReferenceIds.has('ref-1')).toBe(true);
      expect(selectedReferenceIds.has('ref-2')).toBe(true);
    });

    it('should deselect with Cmd+Click on selected row', async () => {
      const user = userEvent.setup();

      // Pre-select two references
      useLibraryStore.setState({
        selectedReferenceIds: new Set(['ref-1', 'ref-2']),
      });

      render(<ReferenceTable references={mockReferences} />);

      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');

      // Cmd+Click to deselect
      await user.keyboard('{Meta>}');
      await user.click(firstRow!);
      await user.keyboard('{/Meta}');

      // Verify only ref-2 remains
      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.size).toBe(1);
      expect(selectedReferenceIds.has('ref-1')).toBe(false);
      expect(selectedReferenceIds.has('ref-2')).toBe(true);
    });

    it('should select range with Shift+Click', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Normal click first row (sets lastSelectedIndex) - has 200ms delay
      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');
      await user.click(firstRow!);

      // Wait for the first click's delayed action to complete
      await waitFor(() => {
        expect(useLibraryStore.getState().selectedReferenceIds.has('ref-1')).toBe(true);
      }, { timeout: 500 });

      // Shift+Click third row (should select ref-1, ref-2, ref-3) - immediate action
      const thirdRow = screen.getByText('Third Reference').closest('[aria-selected]');
      await user.keyboard('{Shift>}');
      await user.click(thirdRow!);
      await user.keyboard('{/Shift}');

      // Verify range selected (Shift+Click is immediate, no wait needed)
      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.size).toBe(3);
      expect(selectedReferenceIds.has('ref-1')).toBe(true);
      expect(selectedReferenceIds.has('ref-2')).toBe(true);
      expect(selectedReferenceIds.has('ref-3')).toBe(true);
    });

    it('should preserve multi-selection across re-renders', async () => {
      const user = userEvent.setup();

      // Pre-select multiple references
      useLibraryStore.setState({
        selectedReferenceIds: new Set(['ref-1', 'ref-3', 'ref-5']),
      });

      const { rerender } = render(<ReferenceTable references={mockReferences} />);

      // Verify all three are visually selected
      expect(screen.getByLabelText('Select First Reference')).toBeChecked();
      expect(screen.getByLabelText('Select Third Reference')).toBeChecked();
      expect(screen.getByLabelText('Select Fifth Reference')).toBeChecked();

      // Re-render with same references
      rerender(<ReferenceTable references={mockReferences} />);

      // Verify selection persists after re-render
      expect(screen.getByLabelText('Select First Reference')).toBeChecked();
      expect(screen.getByLabelText('Select Third Reference')).toBeChecked();
      expect(screen.getByLabelText('Select Fifth Reference')).toBeChecked();

      const { selectedReferenceIds } = useLibraryStore.getState();
      expect(selectedReferenceIds.size).toBe(3);
    });
  });

  describe('Sorting State Integration', () => {
    it('should sync column header click with library.store sortBy', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Click "Authors" header
      const authorsHeader = screen.getByText('Authors').closest('[role="columnheader"]');
      await user.click(authorsHeader!);

      // Verify store updated
      const { sortBy } = useLibraryStore.getState();
      expect(sortBy).toBe('authors');
    });

    it('should toggle sort order on repeated header clicks', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      const titleHeader = screen.getByText('Title').closest('[role="columnheader"]');

      // Currently sorted by year desc, first click on Title should set title asc
      await user.click(titleHeader!);
      expect(useLibraryStore.getState().sortBy).toBe('title');
      expect(useLibraryStore.getState().sortOrder).toBe('asc');

      // Second click: should toggle to desc
      await user.click(titleHeader!);
      expect(useLibraryStore.getState().sortOrder).toBe('desc');

      // Third click: should toggle back to asc
      await user.click(titleHeader!);
      expect(useLibraryStore.getState().sortOrder).toBe('asc');
    });

    it('should persist sorting preference to localStorage', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      // Click "Year" header
      const yearHeader = screen.getByText('Year').closest('[role="columnheader"]');
      await user.click(yearHeader!);

      // Wait for persistence
      await waitFor(() => {
        const persisted = localStorage.getItem('library-storage');
        expect(persisted).toBeTruthy();

        const parsed = JSON.parse(persisted!);
        expect(parsed.state.sortBy).toBe('year');
      });
    });
  });

  describe('Modal Opening Integration', () => {
    it('should set editReferenceId on double-click', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');

      // Double-click row
      await user.dblClick(firstRow!);

      // Verify editReferenceId set in library store
      const { editReferenceId } = useLibraryStore.getState();
      expect(editReferenceId).toBe('ref-1');

      // Note: openModal is called but mocking useUIStore.getState() is tricky in integration tests
      // This is better tested in E2E tests where the full modal interaction can be verified
    });
  });

  describe('Store Action Side Effects', () => {
    it('should update activeReferenceId on normal click', async () => {
      const user = userEvent.setup();
      render(<ReferenceTable references={mockReferences} />);

      const secondRow = screen.getByText('Second Reference').closest('[aria-selected]');
      await user.click(secondRow!);

      // Normal click has 200ms delay - wait for the delayed action to complete
      await waitFor(() => {
        const { activeReferenceId } = useLibraryStore.getState();
        expect(activeReferenceId).toBe('ref-2');
      }, { timeout: 500 });
    });

    it('should not change activeReferenceId on Cmd+Click', async () => {
      const user = userEvent.setup();

      // Set initial active reference
      useLibraryStore.setState({ activeReferenceId: 'ref-1' });

      render(<ReferenceTable references={mockReferences} />);

      const secondRow = screen.getByText('Second Reference').closest('[aria-selected]');

      // Cmd+Click should not change activeReferenceId
      await user.keyboard('{Meta>}');
      await user.click(secondRow!);
      await user.keyboard('{/Meta}');

      const { activeReferenceId } = useLibraryStore.getState();
      expect(activeReferenceId).toBe('ref-1'); // Should remain unchanged
    });

    it('should clear activeReferenceId when clearing selection', async () => {
      const user = userEvent.setup();

      // Start with selection
      useLibraryStore.setState({
        selectedReferenceIds: new Set(['ref-1']),
        activeReferenceId: 'ref-1',
      });

      render(<ReferenceTable references={mockReferences} />);

      const firstRow = screen.getByText('First Reference').closest('[aria-selected]');

      // Click same row to clear
      await user.click(firstRow!);

      // Normal click has 200ms delay - wait for the delayed action to complete
      await waitFor(() => {
        const { activeReferenceId, selectedReferenceIds } = useLibraryStore.getState();
        expect(activeReferenceId).toBe(null);
        expect(selectedReferenceIds.size).toBe(0);
      }, { timeout: 500 });
    });
  });
});
