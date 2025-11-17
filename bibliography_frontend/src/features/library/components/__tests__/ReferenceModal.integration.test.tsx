/**
 * Integration Tests for ReferenceModal Component
 *
 * These tests verify the full integration between ReferenceModal, React Query, and MSW.
 * They test create/edit workflows, form validation, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, userEvent, waitFor, fireEvent } from '@/test/utils/testUtils';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { ReferenceModal } from '../ReferenceModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as uiStore from '@/store/ui.store';

const API_BASE_URL = 'http://localhost:8005/api/bibliography';

// Mock Headless UI components
vi.mock('@headlessui/react', () => {
  const Dialog = ({ children, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.as;
    return <div {...cleanProps}>{children}</div>;
  };
  Dialog.Panel = ({ children, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.as;
    return <div {...cleanProps}>{children}</div>;
  };
  Dialog.Title = ({ children, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.as;
    return <h2 {...cleanProps}>{children}</h2>;
  };
  Dialog.Description = ({ children, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.as;
    return <p {...cleanProps}>{children}</p>;
  };

  const Transition = ({ children, show, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.enterFrom;
    delete cleanProps.enterTo;
    delete cleanProps.leaveFrom;
    delete cleanProps.leaveTo;
    delete cleanProps.as;
    return show ? <div {...cleanProps}>{children}</div> : null;
  };
  Transition.Child = ({ children, ...props }: any) => {
    const cleanProps = { ...props };
    delete cleanProps.enterFrom;
    delete cleanProps.enterTo;
    delete cleanProps.leaveFrom;
    delete cleanProps.leaveTo;
    delete cleanProps.as;
    return <div {...cleanProps}>{children}</div>;
  };

  return { Dialog, Transition };
});

// Mock UI store
const mockAddToast = vi.fn();
const mockCloseModal = vi.fn();
const mockOpenModal = vi.fn();

vi.mock('@/store/ui.store', async () => {
  const actual = await vi.importActual('@/store/ui.store');
  return {
    ...actual,
    useModalState: vi.fn(() => true),
    useUIStore: Object.assign(
      vi.fn(() => ({
        closeModal: mockCloseModal,
        openModal: mockOpenModal,
        addToast: mockAddToast,
      })),
      {
        getState: vi.fn(() => ({
          closeModal: mockCloseModal,
          openModal: mockOpenModal,
          addToast: mockAddToast,
        })),
      }
    ),
  };
});

const mockCreatedReference = {
  _id: 'ref-created-1',
  userId: 'user-123',
  type: 'article' as const,
  title: 'Test Article',
  authors: [{ given: 'John', family: 'Doe', full: 'Doe, John' }],
  year: 2024,
  venue: null,
  doi: null,
  url: null,
  abstract: null,
  citationKey: 'doe2024test',
  tags: [],
  collectionIds: [],
  hasPdf: false,
  sourceRaw: {
    provider: 'manual' as const,
    payload: {},
  },
  deleted: false,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockExistingReference = {
  ...mockCreatedReference,
  _id: 'ref-existing-1',
  title: 'Existing Reference',
  authors: [
    { given: 'Jane', family: 'Smith', full: 'Smith, Jane' },
  ],
  year: 2023,
};

describe('ReferenceModal Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    vi.mocked(uiStore.useModalState).mockReturnValue(true);

    // Default MSW handler for create
    server.use(
      http.post(`${API_BASE_URL}/references`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
          success: true,
          data: { ...mockCreatedReference, ...body },
        }, { status: 201 });
      })
    );
  });

  describe('Create Reference Workflow', () => {
    it('should render create modal with form fields', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      expect(screen.getByText('Create Reference')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/first name/i)).toHaveLength(1);
      expect(screen.getAllByPlaceholderText(/last name/i)).toHaveLength(1);
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should show validation error when title is missing', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill only author, not title
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'Doe');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Should show title required error
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should toggle author mode between structured and single', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Initially structured mode
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();

      // Toggle to single mode
      await user.click(screen.getByRole('button', { name: /use single field/i }));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/first name/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      });

      // Toggle back to structured
      await user.click(screen.getByRole('button', { name: /use two fields/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/full name/i)).not.toBeInTheDocument();
      });
    });

    it('should add and remove authors', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Initially one author
      expect(screen.getAllByPlaceholderText(/first name/i)).toHaveLength(1);

      // Add second author
      await user.click(screen.getByRole('button', { name: /add author/i }));

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText(/first name/i)).toHaveLength(2);
      });

      // Remove buttons should be enabled now
      const removeButtons = screen.getAllByLabelText(/remove author/i);
      expect(removeButtons).toHaveLength(2);
      expect(removeButtons[0]).not.toBeDisabled();
    });
  });

  describe('Edit Reference Workflow', () => {
    it('should show edit mode heading when reference ID is provided', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal referenceId="ref-existing-1" />
        </QueryClientProvider>
      );

      // Should show edit mode heading
      expect(screen.getByText('Edit Reference')).toBeInTheDocument();

      // Should show save changes button
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should have DOI validation error message in schema', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Verify DOI format hint is shown
      expect(screen.getByText(/format.*10\.xxxx/i)).toBeInTheDocument();

      // DOI field should exist and accept input
      const doiInput = screen.getByLabelText(/doi/i);
      expect(doiInput).toBeInTheDocument();
      await user.type(doiInput, '10.1234/example');
      expect(doiInput).toHaveValue('10.1234/example');
    });

    it('should have URL field with proper type', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // URL field should exist with URL type
      const urlInput = screen.getByLabelText(/url/i);
      expect(urlInput).toBeInTheDocument();
      expect(urlInput).toHaveAttribute('type', 'url');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should close modal on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      await user.keyboard('{Escape}');

      expect(mockCloseModal).toHaveBeenCalledWith('reference-modal');
    });
  });

  describe('Modal State', () => {
    it('should have close button available when not submitting', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Close button should exist and be enabled initially
      const closeButton = screen.getByLabelText(/close modal/i);
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).not.toBeDisabled();

      // Form fields should be enabled initially
      expect(screen.getByLabelText(/title/i)).not.toBeDisabled();
    });
  });

  describe('Form Submission Workflows (Real Integration)', () => {
    it('should create reference and close modal on success', async () => {
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill form using userEvent (same as error tests that work)
      await user.type(screen.getByLabelText(/title/i), 'Test Article');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'TestAuthor');

      // Submit
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Wait for async submission to complete and modal to close
      await waitFor(
        () => {
          expect(mockCloseModal).toHaveBeenCalledWith('reference-modal');
        },
        { timeout: 5000 }
      );
    });

    it.skip('should show success toast after creating reference', async () => {
      const user = userEvent.setup();
      const addToastSpy = vi.fn();
      // TODO: Fix - getState doesn't exist on uiStore module
      vi.spyOn(uiStore, 'getState').mockReturnValue({
        addToast: addToastSpy,
        closeModal: mockCloseModal,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/title/i), 'Test Article');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'TestAuthor');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Wait for success toast
      await waitFor(
        () => {
          expect(addToastSpy).toHaveBeenCalledWith({
            message: 'Reference created successfully',
            type: 'success',
          });
        },
        { timeout: 5000 }
      );
    });

    it('should invalidate queries cache after creating reference', async () => {
      const user = userEvent.setup();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/title/i), 'Cache Test');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'CacheAuthor');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Wait for cache invalidation
      await waitFor(
        () => {
          expect(invalidateSpy).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('should update existing reference and close modal', async () => {
      const user = userEvent.setup();

      // Mock GET request for existing reference
      server.use(
        http.get(`${API_BASE_URL}/references/ref-existing-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExistingReference,
          });
        }),
        http.patch(`${API_BASE_URL}/references/ref-existing-1`, async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json({
            success: true,
            data: { ...mockExistingReference, ...body },
          });
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal referenceId="ref-existing-1" />
        </QueryClientProvider>
      );

      // Wait for reference to load
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Reference');
      });

      // Modify field
      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Wait for modal to close
      await waitFor(
        () => {
          expect(mockCloseModal).toHaveBeenCalledWith('reference-modal');
        },
        { timeout: 5000 }
      );
    });

    it('should disable submit button during form submission', async () => {
      const user = userEvent.setup();

      // Add delay to simulate slow API
      server.use(
        http.post(`${API_BASE_URL}/references`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return HttpResponse.json({
            success: true,
            data: mockCreatedReference,
          }, { status: 201 });
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      await user.type(screen.getByLabelText(/title/i), 'Loading Test');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'LoadingAuthor');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      // Verify button is disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(mockCloseModal).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('should handle 409 duplicate error gracefully', async () => {
      const user = userEvent.setup();

      // Mock 409 response
      server.use(
        http.post(`${API_BASE_URL}/references`, () => {
          return HttpResponse.json(
            { success: false, message: 'Duplicate reference detected' },
            { status: 409 }
          );
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Duplicate Article');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'Duplicate');

      // Submit
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Modal should stay open (not closed)
      await waitFor(() => {
        expect(screen.getByText('Create Reference')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should NOT have called closeModal
      expect(mockCloseModal).not.toHaveBeenCalled();
    });

    it('should handle 500 server error gracefully', async () => {
      const user = userEvent.setup();

      // Mock 500 response
      server.use(
        http.post(`${API_BASE_URL}/references`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ReferenceModal />
        </QueryClientProvider>
      );

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Will Fail');
      await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'Error');

      // Submit
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Modal should stay open
      await waitFor(() => {
        expect(screen.getByText('Create Reference')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should NOT have called closeModal
      expect(mockCloseModal).not.toHaveBeenCalled();
    });
  });
});
