import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferenceList } from '../ReferenceList';
import type { Reference } from '@/common/types';
import { useLibraryStore } from '../../store/library.store';
import { useUIStore } from '@/store/ui.store';

const mockReferences: Reference[] = [
  {
    _id: 'ref-1',
    userId: 'user-123',
    type: 'article',
    title: 'First Article',
    authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
    year: 2024,
    venue: 'Test Conference',
    doi: '10.1234/test1',
    isbn: null,
    url: null,
    abstract: null,
    citationKey: 'doe2024first',
    tags: [],
    collectionIds: [],
    hasPdf: false,
    pdf: null,
    sourceRaw: { provider: 'doi', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'ref-2',
    userId: 'user-123',
    type: 'book',
    title: 'Second Book',
    authors: [{ given: 'Jane', family: 'Smith', full: 'Jane Smith' }],
    year: 2023,
    venue: null,
    doi: null,
    isbn: '978-0-123456-78-9',
    url: null,
    abstract: null,
    citationKey: 'smith2023second',
    tags: ['ml'],
    collectionIds: [],
    hasPdf: true,
    pdf: {
      storedPath: '/path/to/pdf',
      originalName: 'book.pdf',
      size: 2048,
      mimeType: 'application/pdf',
      uploadedAt: '2024-01-01T00:00:00.000Z',
    },
    sourceRaw: { provider: 'manual', payload: {} },
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('ReferenceList', () => {
  beforeEach(() => {
    // Reset stores before each test
    useLibraryStore.setState({
      selectedReferenceIds: new Set(),
      activeReferenceId: null,
      activeCollectionId: null,
      activeTags: [],
    });
  });

  it('should render all references', () => {
    render(<ReferenceList references={mockReferences} />);

    expect(screen.getByText('First Article')).toBeInTheDocument();
    expect(screen.getByText('Second Book')).toBeInTheDocument();
  });

  it('should render empty state when no references', () => {
    render(<ReferenceList references={[]} />);

    expect(
      screen.getByText('No references found. Create your first reference to get started.')
    ).toBeInTheDocument();
  });

  it('should pass selected state to ReferenceCard', () => {
    // Set ref-1 as selected in store
    useLibraryStore.setState({
      selectedReferenceIds: new Set(['ref-1']),
    });

    render(<ReferenceList references={mockReferences} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // ref-1 is selected
    expect(checkboxes[1]).not.toBeChecked(); // ref-2 is not selected
  });

  it('should handle multiple selections', () => {
    // Set both refs as selected in store
    useLibraryStore.setState({
      selectedReferenceIds: new Set(['ref-1', 'ref-2']),
    });

    render(<ReferenceList references={mockReferences} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('should maintain reference order', () => {
    const { container } = render(<ReferenceList references={mockReferences} />);

    const cards = container.querySelectorAll('.group');
    expect(cards).toHaveLength(2);

    // First card should contain "First Article"
    expect(cards[0].textContent).toContain('First Article');
    // Second card should contain "Second Book"
    expect(cards[1].textContent).toContain('Second Book');
  });
});
