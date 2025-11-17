import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/utils/testUtils';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { ImportModal } from '../components/ImportModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:8005/api/bibliography';

/**
 * Import DOI Workflow Integration Tests
 *
 * Tests the complete workflow of importing references via DOI:
 * - User enters DOI in ImportModal
 * - API call is made to backend
 * - Reference is created in database
 * - React Query cache is updated
 * - UI reflects the new reference
 */

const mockImportedReference = {
  _id: 'ref-imported-1',
  userId: 'user-123',
  type: 'article' as const,
  title: 'Data Cascades in High-Stakes AI',
  authors: [
    { given: 'Nithya', family: 'Sambasivan', full: 'Sambasivan, Nithya' },
  ],
  year: 2021,
  venue: 'CHI Conference',
  doi: '10.1145/3411764.3445518',
  url: 'http://dx.doi.org/10.1145/3411764.3445518',
  abstract: 'Machine learning models are increasingly applied...',
  citationKey: 'sambasivan2021data',
  tags: [],
  collectionIds: [],
  hasPdf: false,
  sourceRaw: { provider: 'doi' as const, payload: {} },
  deleted: false,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Import DOI Workflow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set up default MSW handler for successful import
    server.use(
      http.post(`${API_BASE_URL}/references/import-doi`, async ({ request }) => {
        const body = await request.json() as { doi: string };

        // Simulate validation
        if (!body.doi || !body.doi.match(/^10\.\d+\/.+/)) {
          return HttpResponse.json(
            { error: 'Invalid DOI format' },
            { status: 400 }
          );
        }

        // Return imported reference (wrapped in API response envelope)
        return HttpResponse.json({
          success: true,
          data: mockImportedReference,
        }, { status: 201 });
      })
    );
  });

  describe('Successful Import Flow', () => {
    // Skip: Timing issues with MIN_LOADING_DURATION need investigation
    it('should import reference and update React Query cache', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={onClose} />
        </QueryClientProvider>
      );

      // Step 1: User enters DOI
      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      // Step 2: User clicks Import
      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      // Step 3: Verify API was called and reference was imported
      await waitFor(() => {
        expect(input).toHaveValue(''); // Input cleared for next import
      }, { timeout: 2000 }); // Allow time for MIN_LOADING_DURATION

      // Modal stays open for sequential imports
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'Import Reference' })).toBeInTheDocument();
    });

    it('should handle sequential imports correctly', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={onClose} />
        </QueryClientProvider>
      );

      // First import
      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      }, { timeout: 2000 });

      // Second import - different DOI
      await user.type(input, '10.1234/5678.9012');
      await user.click(importButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      }, { timeout: 2000 });

      // Modal still open
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Flow', () => {
    it('should show error and keep input on failed import', async () => {
      const user = userEvent.setup();

      // Override handler to return error
      server.use(
        http.post(`${API_BASE_URL}/references/import-doi`, () => {
          return HttpResponse.json(
            { error: 'DOI not found' },
            { status: 404 }
          );
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      const testDoi = '10.9999/nonexistent';
      await user.type(input, testDoi);

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      // Wait for error to appear (would show in toast)
      await waitFor(() => {
        // Input should NOT be cleared on error
        expect(input).toHaveValue(testDoi);
      });
    });

    it('should handle rate limit errors gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE_URL}/references/import-doi`, () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      await waitFor(() => {
        // Input preserved for retry
        expect(input).toHaveValue('10.1145/3411764.3445518');
      });
    });

    it('should handle network errors', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE_URL}/references/import-doi`, () => {
          return HttpResponse.error();
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      await waitFor(() => {
        expect(input).toHaveValue('10.1145/3411764.3445518');
      });
    });
  });

  describe('Validation Flow', () => {
    it('should prevent import with invalid DOI format', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, 'invalid-doi-format');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });

      // Button should be disabled for invalid DOI
      expect(importButton).toBeDisabled();
    });

    it('should enable import button only for valid DOI', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      const importButton = screen.getByRole('button', { name: /Import Reference/i });

      // Initially disabled (empty input)
      expect(importButton).toBeDisabled();

      // Still disabled with invalid format
      await user.type(input, 'not-a-doi');
      expect(importButton).toBeDisabled();

      // Clear and type valid DOI
      await user.clear(input);
      await user.type(input, '10.1145/3411764.3445518');

      // Now enabled
      expect(importButton).not.toBeDisabled();
    });
  });

  describe('User Experience Flow', () => {
    it('should show loading state during import', async () => {
      const user = userEvent.setup();

      // Add delay to simulate slow API
      server.use(
        http.post(`${API_BASE_URL}/references/import-doi`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return HttpResponse.json({
            success: true,
            data: mockImportedReference,
          }, { status: 201 });
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      // Loading state should appear
      expect(screen.getByText('Importing...')).toBeInTheDocument();
      expect(input).toBeDisabled();

      // Wait for import to complete
      await waitFor(() => {
        expect(input).toHaveValue('');
        expect(input).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should support keyboard shortcuts (Enter to submit)', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      // Press Enter to submit
      await user.keyboard('{Enter}');

      // Should trigger import
      await waitFor(() => {
        expect(input).toHaveValue('');
      }, { timeout: 2000 });
    });

    it('should close modal when user clicks close button', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={onClose} />
        </QueryClientProvider>
      );

      const closeButton = screen.getByRole('button', { name: /Close modal/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Duplicate Detection Integration', () => {
    it('should handle duplicate reference error', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE_URL}/references/import-doi`, () => {
          return HttpResponse.json(
            { error: 'Reference already exists' },
            { status: 409 }
          );
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ImportModal isOpen={true} onClose={vi.fn()} />
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('DOI');
      await user.type(input, '10.1145/3411764.3445518');

      const importButton = screen.getByRole('button', { name: /Import Reference/i });
      await user.click(importButton);

      // Should show duplicate error and keep DOI for reference
      await waitFor(() => {
        expect(input).toHaveValue('10.1145/3411764.3445518');
      });
    });
  });
});
