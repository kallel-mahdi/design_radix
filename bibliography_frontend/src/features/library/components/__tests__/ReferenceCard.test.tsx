import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceCard } from '../ReferenceCard';
import type { Reference } from '@/common/types';

const mockReference: Reference = {
  _id: 'ref-123',
  userId: 'user-123',
  type: 'article',
  title: 'Test Article Title',
  authors: [
    { given: 'John', family: 'Doe', full: 'John Doe' },
    { given: 'Jane', family: 'Smith', full: 'Jane Smith' },
  ],
  year: 2024,
  venue: 'Test Conference',
  doi: '10.1234/test',
  isbn: null,
  url: 'https://example.com',
  abstract: 'Test abstract',
  citationKey: 'doe2024test',
  tags: ['machine-learning', 'nlp', 'deep-learning'],
  collectionIds: [],
  hasPdf: true,
  pdf: {
    storedPath: '/path/to/pdf',
    originalName: 'test.pdf',
    size: 1024,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  sourceRaw: {
    provider: 'doi',
    payload: {},
  },
  deleted: false,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ReferenceCard', () => {
  it('should render reference title', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render formatted authors', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('John Doe & Jane Smith')).toBeInTheDocument();
  });

  it('should render single author without "et al."', () => {
    const singleAuthorRef: Reference = {
      ...mockReference,
      authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
    };

    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={singleAuthorRef}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render "et al." for more than 2 authors', () => {
    const multiAuthorRef: Reference = {
      ...mockReference,
      authors: [
        { given: 'John', family: 'Doe', full: 'John Doe' },
        { given: 'Jane', family: 'Smith', full: 'Jane Smith' },
        { given: 'Bob', family: 'Johnson', full: 'Bob Johnson' },
      ],
    };

    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={multiAuthorRef}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('John Doe et al.')).toBeInTheDocument();
  });

  it('should render year badge', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should render type badge', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('article')).toBeInTheDocument();
  });

  it('should render PDF indicator when hasPdf is true', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('should not render PDF indicator when hasPdf is false', () => {
    const noPdfRef: Reference = {
      ...mockReference,
      hasPdf: false,
      pdf: null,
    };

    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={noPdfRef}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.queryByText('PDF')).not.toBeInTheDocument();
  });

  it('should render DOI badge when DOI exists', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('DOI')).toBeInTheDocument();
  });

  it('should render tags (max 3)', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('machine-learning')).toBeInTheDocument();
    expect(screen.getByText('nlp')).toBeInTheDocument();
    expect(screen.getByText('deep-learning')).toBeInTheDocument();
  });

  it('should show "+N more" when more than 3 tags', () => {
    const manyTagsRef: Reference = {
      ...mockReference,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={manyTagsRef}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should render citation key', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    expect(screen.getByText('doe2024test')).toBeInTheDocument();
  });

  it('should render checkbox checked when selected', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={true}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should render checkbox unchecked when not selected', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should call onSelect when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onSelect).toHaveBeenCalledWith('ref-123');
    expect(onClick).not.toHaveBeenCalled(); // Should not trigger card click
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const card = container.firstChild as HTMLElement;
    await user.click(card);

    expect(onClick).toHaveBeenCalledWith('ref-123');
  });

  it('should not call onClick when action buttons are clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();

    render(
      <ReferenceCard
        reference={mockReference}
        isSelected={false}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const editButton = screen.getByTitle('Edit reference');
    await user.click(editButton);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('should apply selected styling when selected', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <ReferenceCard
        reference={mockReference}
        isSelected={true}
        onSelect={onSelect}
        onClick={onClick}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-accent');
  });
});
