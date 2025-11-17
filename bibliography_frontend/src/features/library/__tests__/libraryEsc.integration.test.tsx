/**
 * Session 9: Library Page ESC Handler Integration Tests
 *
 * Integration tests for ESC key handler workflow:
 * - ESC key closes DetailsPane
 * - ESC key clears active reference in store
 * - ESC key only works when DetailsPane is open
 * - Event listener cleanup on unmount
 *
 * These tests verify the full keyboard interaction flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import userEvent from '@testing-library/user-event';
import { LibraryPage } from '@/routes/library';
import * as libraryStore from '@/features/library/store/library.store';
import * as uiStore from '@/store/ui.store';

// Mock the stores
vi.mock('@/features/library/store/library.store', () => ({
  useLibraryStore: vi.fn(),
}));

vi.mock('@/store/ui.store', () => ({
  useUIStore: vi.fn(),
}));

// Mock the references query
vi.mock('@/features/library/api/references.queries', () => ({
  useReferencesQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock all child components to keep tests focused on ESC handler logic
vi.mock('@/features/library/components/ReferenceTable', () => ({
  ReferenceTable: () => <div data-testid="reference-table">ReferenceTable Mock</div>,
}));

vi.mock('@/features/library/components/ImportModal', () => ({
  ImportModal: () => <div data-testid="import-modal">ImportModal Mock</div>,
}));

vi.mock('@/features/library/components/ReferenceModal', () => ({
  ReferenceModal: () => <div data-testid="reference-modal">ReferenceModal Mock</div>,
}));

vi.mock('@/components/layout/DetailsPane', () => ({
  DetailsPane: ({ isOpen, referenceId }: { isOpen: boolean; referenceId: string | null }) => (
    <div data-testid="details-pane" data-open={isOpen} data-reference-id={referenceId}>
      DetailsPane Mock
    </div>
  ),
}));

describe('Library Page - ESC Handler Integration Tests', () => {
  let queryClient: QueryClient;
  let mockSetActiveReference: ReturnType<typeof vi.fn>;
  let mockSetDetailsPaneOpen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockSetActiveReference = vi.fn();
    mockSetDetailsPaneOpen = vi.fn();

    // Mock library store with all required state
    vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
      const state = {
        activeReferenceId: null,
        setActiveReference: mockSetActiveReference,
        activeCollectionId: null,
        activeTags: [],
        searchQuery: '',
        editReferenceId: null,
      };
      return selector ? selector(state) : state;
    });

    // Mock UI store with all required state
    vi.mocked(uiStore.useUIStore).mockImplementation((selector: any) => {
      const state = {
        detailsPaneOpen: false,
        setDetailsPaneOpen: mockSetDetailsPaneOpen,
        detailsPaneTab: 'info' as const,
        setDetailsPaneTab: vi.fn(),
        setActiveView: vi.fn(),
        openModal: vi.fn(),
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderLibraryPage = () => {
    // Create router for testing
    const rootRoute = createRootRoute();
    const libraryRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/library',
      component: LibraryPage,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([libraryRoute]),
      history: createMemoryHistory({ initialEntries: ['/library'] }),
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  describe('ESC Key Handler', () => {
    it('should close DetailsPane and clear active reference when ESC pressed with active reference', async () => {
      // Mock state: DetailsPane is open with active reference
      vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
        const state = {
          activeReferenceId: 'ref-123',
          setActiveReference: mockSetActiveReference,
          activeCollectionId: null,
          activeTags: [],
          searchQuery: '',
          editReferenceId: null,
        };
        return selector ? selector(state) : state;
      });

      renderLibraryPage();

      // Press ESC key
      const user = userEvent.setup();
      await user.keyboard('{Escape}');

      // Verify both actions were called
      await waitFor(() => {
        expect(mockSetDetailsPaneOpen).toHaveBeenCalledWith(false);
        expect(mockSetActiveReference).toHaveBeenCalledWith(null);
      });
    });

    it('should NOT trigger when ESC pressed without active reference', async () => {
      // Mock state: No active reference
      vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
        const state = {
          activeReferenceId: null,
          setActiveReference: mockSetActiveReference,
          activeCollectionId: null,
          activeTags: [],
          searchQuery: '',
          editReferenceId: null,
        };
        return selector ? selector(state) : state;
      });

      renderLibraryPage();

      // Wait for component to mount (auto-open useEffect will fire)
      await waitFor(() => {
        expect(mockSetDetailsPaneOpen).toHaveBeenCalledWith(false); // Auto-close when no activeRef
      });

      // Reset mocks after mount
      mockSetDetailsPaneOpen.mockClear();
      mockSetActiveReference.mockClear();

      // Press ESC key
      const user = userEvent.setup();
      await user.keyboard('{Escape}');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify ESC handler did NOT fire (no new calls after reset)
      expect(mockSetDetailsPaneOpen).not.toHaveBeenCalled();
      expect(mockSetActiveReference).not.toHaveBeenCalled();
    });

    it('should cleanup event listener on unmount', async () => {
      // Spy on addEventListener and removeEventListener
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderLibraryPage();

      // Verify event listener was added
      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      });

      // Unmount component
      unmount();

      // Verify event listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Cleanup spies
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should NOT trigger on other keys like Enter', async () => {
      // Mock state with active reference
      vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
        const state = {
          activeReferenceId: 'ref-789',
          setActiveReference: mockSetActiveReference,
          activeCollectionId: null,
          activeTags: [],
          searchQuery: '',
          editReferenceId: null,
        };
        return selector ? selector(state) : state;
      });

      renderLibraryPage();

      // Wait for mount (auto-open useEffect will fire with activeRef=true)
      await waitFor(() => {
        expect(mockSetDetailsPaneOpen).toHaveBeenCalledWith(true);
      });

      // Reset mocks after mount
      mockSetDetailsPaneOpen.mockClear();
      mockSetActiveReference.mockClear();

      const user = userEvent.setup();

      // Press Enter key
      await user.keyboard('{Enter}');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify Enter key did NOT trigger ESC handler
      expect(mockSetDetailsPaneOpen).not.toHaveBeenCalled();
      expect(mockSetActiveReference).not.toHaveBeenCalled();
    });

    it('should handle multiple ESC presses', async () => {
      // Mock state with active reference
      vi.mocked(libraryStore.useLibraryStore).mockImplementation((selector: any) => {
        const state = {
          activeReferenceId: 'ref-456',
          setActiveReference: mockSetActiveReference,
          activeCollectionId: null,
          activeTags: [],
          searchQuery: '',
          editReferenceId: null,
        };
        return selector ? selector(state) : state;
      });

      renderLibraryPage();

      // Wait for mount (auto-open useEffect will fire)
      await waitFor(() => {
        expect(mockSetDetailsPaneOpen).toHaveBeenCalledWith(true);
      });

      // Reset mocks after mount
      mockSetDetailsPaneOpen.mockClear();
      mockSetActiveReference.mockClear();

      const user = userEvent.setup();

      // Press ESC multiple times
      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');

      // All 3 presses should trigger the ESC handler
      await waitFor(() => {
        expect(mockSetDetailsPaneOpen).toHaveBeenCalledTimes(3);
        expect(mockSetActiveReference).toHaveBeenCalledTimes(3);
      });
    });
  });
});
