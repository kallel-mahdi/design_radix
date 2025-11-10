/**
 * Comprehensive Test Suite for Zod Schemas
 *
 * Tests all validation schemas for References, Collections, Tags, and related entities.
 * Coverage includes:
 * - Valid data validation
 * - Required field validation
 * - Type validation
 * - Nullable field handling
 * - Array validation
 * - Enum validation
 * - Partial update schemas
 * - Type inference
 */

import { describe, it, expect } from 'vitest';
import {
  // Reference schemas
  ReferenceSchema,
  CreateReferenceInputSchema,
  UpdateReferenceInputSchema,
  ReferenceListSchema,

  // Collection schemas
  CollectionSchema,
  CreateCollectionInputSchema,
  UpdateCollectionInputSchema,
  CollectionListSchema,

  // Tag schemas
  TagSchema,
  CreateTagInputSchema,
  UpdateTagInputSchema,
  TagListSchema,

  // Nested object schemas
  AuthorSchema,
  ReferenceTypeSchema,
  DuplicateCandidateSchema,
  DuplicateCandidateListSchema,
  ProjectLinkSchema,

  // Type exports
  type ReferenceSchemaType,
  type CollectionSchemaType,
  type TagSchemaType,
  type AuthorSchemaType,
  type CreateReferenceInput,
  type UpdateReferenceInput,
  type CreateCollectionInput,
  type UpdateCollectionInput,
  type CreateTagInput,
  type UpdateTagInput,
} from '../schemas';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a valid reference object for testing
 */
function createValidReference(): ReferenceSchemaType {
  return {
    _id: '507f1f77bcf86cd799439011',
    userId: 'user123',
    type: 'article',
    title: 'Test Article Title',
    authors: [
      { given: 'John', family: 'Doe', full: 'John Doe' },
      { full: 'Jane Smith' }, // Only full name
    ],
    year: 2024,
    venue: 'Journal of Testing',
    doi: '10.1234/test.2024.001',
    isbn: null,
    url: 'https://example.com/article',
    abstract: 'This is a test abstract.',
    citationKey: 'doe2024test',
    tags: ['machine-learning', 'testing'],
    collectionIds: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    hasPdf: true,
    pdf: {
      storedPath: '/uploads/test.pdf',
      originalName: 'test-paper.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
    },
    sourceRaw: {
      provider: 'doi',
      payload: { doi: '10.1234/test.2024.001', source: 'crossref' },
    },
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };
}

/**
 * Creates a valid collection object for testing
 */
function createValidCollection(): CollectionSchemaType {
  return {
    _id: '507f1f77bcf86cd799439014',
    userId: 'user123',
    name: 'Machine Learning Papers',
    parentId: null,
    position: 0,
    color: '#3b82f6',
    deleted: false,
    deletedAt: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };
}

/**
 * Creates a valid tag object for testing
 */
function createValidTag(): TagSchemaType {
  return {
    _id: '507f1f77bcf86cd799439015',
    userId: 'user123',
    name: 'machine-learning',
    color: '#10b981',
    position: 0,
    automatic: false,
    usageCount: 5,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };
}

// ============================================================================
// AUTHOR SCHEMA TESTS
// ============================================================================

describe('AuthorSchema', () => {
  it('should validate author with all fields', () => {
    const author = { given: 'John', family: 'Doe', full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).not.toThrow();
  });

  it('should validate author with only full name', () => {
    const author = { full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).not.toThrow();
  });

  it('should validate author with given name and full name', () => {
    const author = { given: 'John', full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).not.toThrow();
  });

  it('should validate author with family name and full name', () => {
    const author = { family: 'Doe', full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).not.toThrow();
  });

  it('should reject author without full name', () => {
    const author = { given: 'John', family: 'Doe' };
    expect(() => AuthorSchema.parse(author)).toThrow();
  });

  it('should reject author with invalid type for full name', () => {
    const author = { full: 123 };
    expect(() => AuthorSchema.parse(author)).toThrow();
  });

  it('should reject author with invalid type for given name', () => {
    const author = { given: 123, full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).toThrow();
  });

  it('should reject author with invalid type for family name', () => {
    const author = { family: 123, full: 'John Doe' };
    expect(() => AuthorSchema.parse(author)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const author: AuthorSchemaType = { full: 'John Doe' };
    expect(author.full).toBe('John Doe');
  });
});

// ============================================================================
// REFERENCE TYPE SCHEMA TESTS
// ============================================================================

describe('ReferenceTypeSchema', () => {
  it('should validate "article" type', () => {
    expect(() => ReferenceTypeSchema.parse('article')).not.toThrow();
  });

  it('should validate "book" type', () => {
    expect(() => ReferenceTypeSchema.parse('book')).not.toThrow();
  });

  it('should validate "chapter" type', () => {
    expect(() => ReferenceTypeSchema.parse('chapter')).not.toThrow();
  });

  it('should validate "conference" type', () => {
    expect(() => ReferenceTypeSchema.parse('conference')).not.toThrow();
  });

  it('should validate "thesis" type', () => {
    expect(() => ReferenceTypeSchema.parse('thesis')).not.toThrow();
  });

  it('should validate "other" type', () => {
    expect(() => ReferenceTypeSchema.parse('other')).not.toThrow();
  });

  it('should reject invalid type', () => {
    expect(() => ReferenceTypeSchema.parse('invalid')).toThrow();
  });

  it('should reject non-string type', () => {
    expect(() => ReferenceTypeSchema.parse(123)).toThrow();
  });

  it('should reject null', () => {
    expect(() => ReferenceTypeSchema.parse(null)).toThrow();
  });

  it('should reject undefined', () => {
    expect(() => ReferenceTypeSchema.parse(undefined)).toThrow();
  });
});

// ============================================================================
// REFERENCE SCHEMA TESTS
// ============================================================================

describe('ReferenceSchema', () => {
  it('should validate a complete valid reference', () => {
    const validRef = createValidReference();
    const result = ReferenceSchema.parse(validRef);
    expect(result).toEqual(validRef);
  });

  it('should validate reference with nullable fields as null', () => {
    const ref = createValidReference();
    ref.year = null;
    ref.venue = null;
    ref.doi = null;
    ref.isbn = null;
    ref.url = null;
    ref.abstract = null;
    ref.pdf = null;
    ref.deletedAt = null;

    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should validate reference with empty arrays', () => {
    const ref = createValidReference();
    ref.authors = [];
    ref.tags = [];
    ref.collectionIds = [];

    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should validate reference of type "book"', () => {
    const ref = createValidReference();
    ref.type = 'book';
    ref.isbn = '978-0-123456-78-9';
    ref.doi = null;

    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should validate deleted reference', () => {
    const ref = createValidReference();
    ref.deleted = true;
    ref.deletedAt = '2024-01-20T15:00:00Z';

    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should validate reference without PDF', () => {
    const ref = createValidReference();
    ref.hasPdf = false;
    ref.pdf = null;

    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should validate reference with different source providers', () => {
    const providers = ['doi', 'bibtex', 'csl-json', 'ris', 'manual'] as const;

    providers.forEach(provider => {
      const ref = createValidReference();
      ref.sourceRaw = { provider, payload: {} };
      expect(() => ReferenceSchema.parse(ref)).not.toThrow();
    });
  });

  it('should reject reference with missing required field (_id)', () => {
    const ref = createValidReference();
    delete (ref as any)._id;
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with missing required field (userId)', () => {
    const ref = createValidReference();
    delete (ref as any).userId;
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with missing required field (type)', () => {
    const ref = createValidReference();
    delete (ref as any).type;
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with missing required field (title)', () => {
    const ref = createValidReference();
    delete (ref as any).title;
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid type value', () => {
    const ref = createValidReference();
    (ref as any).type = 'invalid-type';
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid year type (string instead of number)', () => {
    const ref = createValidReference();
    (ref as any).year = '2024';
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid authors array', () => {
    const ref = createValidReference();
    (ref as any).authors = [{ given: 'John' }]; // Missing required 'full' field
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid hasPdf type', () => {
    const ref = createValidReference();
    (ref as any).hasPdf = 'true';
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid deleted type', () => {
    const ref = createValidReference();
    (ref as any).deleted = 'false';
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid sourceRaw provider', () => {
    const ref = createValidReference();
    (ref as any).sourceRaw = { provider: 'invalid', payload: {} };
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should validate sourceRaw with unknown payload structure', () => {
    const ref = createValidReference();
    ref.sourceRaw = {
      provider: 'manual',
      payload: { complexData: { nested: { value: [1, 2, 3] } } },
    };
    expect(() => ReferenceSchema.parse(ref)).not.toThrow();
  });

  it('should reject reference with invalid PDF structure', () => {
    const ref = createValidReference();
    (ref as any).pdf = { storedPath: '/path' }; // Missing required fields
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid tags (non-array)', () => {
    const ref = createValidReference();
    (ref as any).tags = 'machine-learning';
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should reject reference with invalid collectionIds (array of numbers)', () => {
    const ref = createValidReference();
    (ref as any).collectionIds = [123, 456];
    expect(() => ReferenceSchema.parse(ref)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const ref: ReferenceSchemaType = createValidReference();
    expect(ref._id).toBe('507f1f77bcf86cd799439011');
    expect(ref.type).toBe('article');
  });
});

// ============================================================================
// REFERENCE LIST SCHEMA TESTS
// ============================================================================

describe('ReferenceListSchema', () => {
  it('should validate array of references', () => {
    const refs = [createValidReference(), createValidReference()];
    expect(() => ReferenceListSchema.parse(refs)).not.toThrow();
  });

  it('should validate empty array', () => {
    expect(() => ReferenceListSchema.parse([])).not.toThrow();
  });

  it('should reject non-array', () => {
    expect(() => ReferenceListSchema.parse(createValidReference())).toThrow();
  });

  it('should reject array with invalid reference', () => {
    const refs = [createValidReference(), { invalid: 'reference' }];
    expect(() => ReferenceListSchema.parse(refs)).toThrow();
  });
});

// ============================================================================
// CREATE REFERENCE INPUT SCHEMA TESTS
// ============================================================================

describe('CreateReferenceInputSchema', () => {
  it('should validate minimal input with required fields only', () => {
    const input = {
      type: 'article' as const,
      title: 'Test Article',
    };
    expect(() => CreateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with all optional fields', () => {
    const input: CreateReferenceInput = {
      type: 'article',
      title: 'Test Article',
      authors: [{ full: 'John Doe' }],
      year: 2024,
      venue: 'Test Journal',
      doi: '10.1234/test',
      isbn: '978-0-123456-78-9',
      url: 'https://example.com',
      abstract: 'Test abstract',
      tags: ['tag1', 'tag2'],
      collectionIds: ['507f1f77bcf86cd799439011'],
    };
    expect(() => CreateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should reject input without type', () => {
    const input = { title: 'Test Article' };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject input without title', () => {
    const input = { type: 'article' };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject input with empty title', () => {
    const input = { type: 'article', title: '' };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject input with invalid type', () => {
    const input = { type: 'invalid-type', title: 'Test Article' };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject input with invalid year type', () => {
    const input = { type: 'article', title: 'Test Article', year: '2024' };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject input with invalid authors structure', () => {
    const input = {
      type: 'article',
      title: 'Test Article',
      authors: [{ given: 'John' }], // Missing required 'full'
    };
    expect(() => CreateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should accept input with extra fields (Zod default behavior)', () => {
    const input = {
      type: 'article',
      title: 'Test Article',
      extraField: 'should be stripped',
    };
    const result = CreateReferenceInputSchema.parse(input);
    expect((result as any).extraField).toBeUndefined();
  });

  it('should infer correct TypeScript type', () => {
    const input: CreateReferenceInput = {
      type: 'article',
      title: 'Test Article',
    };
    expect(input.title).toBe('Test Article');
  });
});

// ============================================================================
// UPDATE REFERENCE INPUT SCHEMA TESTS
// ============================================================================

describe('UpdateReferenceInputSchema', () => {
  it('should validate empty update', () => {
    const input = {};
    expect(() => UpdateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with title only', () => {
    const input = { title: 'Updated Title' };
    expect(() => UpdateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with multiple fields', () => {
    const input: UpdateReferenceInput = {
      title: 'Updated Title',
      year: 2025,
      tags: ['new-tag'],
    };
    expect(() => UpdateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should validate update with all fields', () => {
    const input: UpdateReferenceInput = {
      type: 'book',
      title: 'Updated Title',
      authors: [{ full: 'Jane Doe' }],
      year: 2025,
      venue: 'Updated Venue',
      doi: '10.1234/updated',
      isbn: '978-1-234567-89-0',
      url: 'https://updated.com',
      abstract: 'Updated abstract',
      tags: ['updated-tag'],
      collectionIds: ['507f1f77bcf86cd799439099'],
    };
    expect(() => UpdateReferenceInputSchema.parse(input)).not.toThrow();
  });

  it('should reject update with empty title', () => {
    const input = { title: '' };
    expect(() => UpdateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject update with invalid type', () => {
    const input = { type: 'invalid-type' };
    expect(() => UpdateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should reject update with invalid year type', () => {
    const input = { year: '2024' };
    expect(() => UpdateReferenceInputSchema.parse(input)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const input: UpdateReferenceInput = { title: 'Updated' };
    expect(input.title).toBe('Updated');
  });
});

// ============================================================================
// COLLECTION SCHEMA TESTS
// ============================================================================

describe('CollectionSchema', () => {
  it('should validate a complete valid collection', () => {
    const collection = createValidCollection();
    const result = CollectionSchema.parse(collection);
    expect(result).toEqual(collection);
  });

  it('should validate collection with parent', () => {
    const collection = createValidCollection();
    collection.parentId = '507f1f77bcf86cd799439099';
    expect(() => CollectionSchema.parse(collection)).not.toThrow();
  });

  it('should validate collection without color', () => {
    const collection = createValidCollection();
    collection.color = null;
    expect(() => CollectionSchema.parse(collection)).not.toThrow();
  });

  it('should validate deleted collection', () => {
    const collection = createValidCollection();
    collection.deleted = true;
    collection.deletedAt = '2024-01-20T15:00:00Z';
    expect(() => CollectionSchema.parse(collection)).not.toThrow();
  });

  it('should reject collection with missing required field (_id)', () => {
    const collection = createValidCollection();
    delete (collection as any)._id;
    expect(() => CollectionSchema.parse(collection)).toThrow();
  });

  it('should reject collection with missing required field (name)', () => {
    const collection = createValidCollection();
    delete (collection as any).name;
    expect(() => CollectionSchema.parse(collection)).toThrow();
  });

  it('should reject collection with invalid position type', () => {
    const collection = createValidCollection();
    (collection as any).position = '0';
    expect(() => CollectionSchema.parse(collection)).toThrow();
  });

  it('should reject collection with invalid deleted type', () => {
    const collection = createValidCollection();
    (collection as any).deleted = 'false';
    expect(() => CollectionSchema.parse(collection)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const collection: CollectionSchemaType = createValidCollection();
    expect(collection.name).toBe('Machine Learning Papers');
  });
});

// ============================================================================
// COLLECTION LIST SCHEMA TESTS
// ============================================================================

describe('CollectionListSchema', () => {
  it('should validate array of collections', () => {
    const collections = [createValidCollection(), createValidCollection()];
    expect(() => CollectionListSchema.parse(collections)).not.toThrow();
  });

  it('should validate empty array', () => {
    expect(() => CollectionListSchema.parse([])).not.toThrow();
  });

  it('should reject non-array', () => {
    expect(() => CollectionListSchema.parse(createValidCollection())).toThrow();
  });

  it('should reject array with invalid collection', () => {
    const collections = [createValidCollection(), { invalid: 'collection' }];
    expect(() => CollectionListSchema.parse(collections)).toThrow();
  });
});

// ============================================================================
// CREATE COLLECTION INPUT SCHEMA TESTS
// ============================================================================

describe('CreateCollectionInputSchema', () => {
  it('should validate minimal input with name only', () => {
    const input = { name: 'New Collection' };
    expect(() => CreateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with parent ID', () => {
    const input: CreateCollectionInput = {
      name: 'Subcollection',
      parentId: '507f1f77bcf86cd799439099',
    };
    expect(() => CreateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with color', () => {
    const input: CreateCollectionInput = {
      name: 'Colored Collection',
      color: '#3b82f6',
    };
    expect(() => CreateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with all fields', () => {
    const input: CreateCollectionInput = {
      name: 'Complete Collection',
      parentId: '507f1f77bcf86cd799439099',
      color: '#10b981',
    };
    expect(() => CreateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should reject input without name', () => {
    const input = {};
    expect(() => CreateCollectionInputSchema.parse(input)).toThrow();
  });

  it('should reject input with empty name', () => {
    const input = { name: '' };
    expect(() => CreateCollectionInputSchema.parse(input)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const input: CreateCollectionInput = { name: 'Test Collection' };
    expect(input.name).toBe('Test Collection');
  });
});

// ============================================================================
// UPDATE COLLECTION INPUT SCHEMA TESTS
// ============================================================================

describe('UpdateCollectionInputSchema', () => {
  it('should validate empty update', () => {
    const input = {};
    expect(() => UpdateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with name only', () => {
    const input = { name: 'Updated Collection' };
    expect(() => UpdateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with parentId', () => {
    const input: UpdateCollectionInput = {
      parentId: '507f1f77bcf86cd799439099',
    };
    expect(() => UpdateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should validate update with all fields', () => {
    const input: UpdateCollectionInput = {
      name: 'Updated Collection',
      parentId: '507f1f77bcf86cd799439099',
      color: '#ef4444',
    };
    expect(() => UpdateCollectionInputSchema.parse(input)).not.toThrow();
  });

  it('should reject update with empty name', () => {
    const input = { name: '' };
    expect(() => UpdateCollectionInputSchema.parse(input)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const input: UpdateCollectionInput = { name: 'Updated' };
    expect(input.name).toBe('Updated');
  });
});

// ============================================================================
// TAG SCHEMA TESTS
// ============================================================================

describe('TagSchema', () => {
  it('should validate a complete valid tag', () => {
    const tag = createValidTag();
    const result = TagSchema.parse(tag);
    expect(result).toEqual(tag);
  });

  it('should validate tag without color', () => {
    const tag = createValidTag();
    tag.color = null;
    expect(() => TagSchema.parse(tag)).not.toThrow();
  });

  it('should validate tag without position', () => {
    const tag = createValidTag();
    tag.position = null;
    expect(() => TagSchema.parse(tag)).not.toThrow();
  });

  it('should validate automatic tag', () => {
    const tag = createValidTag();
    tag.automatic = true;
    expect(() => TagSchema.parse(tag)).not.toThrow();
  });

  it('should validate tag with zero usage count', () => {
    const tag = createValidTag();
    tag.usageCount = 0;
    expect(() => TagSchema.parse(tag)).not.toThrow();
  });

  it('should reject tag with missing required field (_id)', () => {
    const tag = createValidTag();
    delete (tag as any)._id;
    expect(() => TagSchema.parse(tag)).toThrow();
  });

  it('should reject tag with missing required field (name)', () => {
    const tag = createValidTag();
    delete (tag as any).name;
    expect(() => TagSchema.parse(tag)).toThrow();
  });

  it('should reject tag with invalid automatic type', () => {
    const tag = createValidTag();
    (tag as any).automatic = 'false';
    expect(() => TagSchema.parse(tag)).toThrow();
  });

  it('should reject tag with invalid usageCount type', () => {
    const tag = createValidTag();
    (tag as any).usageCount = '5';
    expect(() => TagSchema.parse(tag)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const tag: TagSchemaType = createValidTag();
    expect(tag.name).toBe('machine-learning');
  });
});

// ============================================================================
// TAG LIST SCHEMA TESTS
// ============================================================================

describe('TagListSchema', () => {
  it('should validate array of tags', () => {
    const tags = [createValidTag(), createValidTag()];
    expect(() => TagListSchema.parse(tags)).not.toThrow();
  });

  it('should validate empty array', () => {
    expect(() => TagListSchema.parse([])).not.toThrow();
  });

  it('should reject non-array', () => {
    expect(() => TagListSchema.parse(createValidTag())).toThrow();
  });

  it('should reject array with invalid tag', () => {
    const tags = [createValidTag(), { invalid: 'tag' }];
    expect(() => TagListSchema.parse(tags)).toThrow();
  });
});

// ============================================================================
// CREATE TAG INPUT SCHEMA TESTS
// ============================================================================

describe('CreateTagInputSchema', () => {
  it('should validate minimal input with name only', () => {
    const input = { name: 'new-tag' };
    expect(() => CreateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with color', () => {
    const input: CreateTagInput = {
      name: 'colored-tag',
      color: '#3b82f6',
    };
    expect(() => CreateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with position', () => {
    const input: CreateTagInput = {
      name: 'positioned-tag',
      position: 5,
    };
    expect(() => CreateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate input with all fields', () => {
    const input: CreateTagInput = {
      name: 'complete-tag',
      color: '#10b981',
      position: 3,
    };
    expect(() => CreateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should reject input without name', () => {
    const input = {};
    expect(() => CreateTagInputSchema.parse(input)).toThrow();
  });

  it('should reject input with empty name', () => {
    const input = { name: '' };
    expect(() => CreateTagInputSchema.parse(input)).toThrow();
  });

  it('should reject input with invalid position type', () => {
    const input = { name: 'test-tag', position: '5' };
    expect(() => CreateTagInputSchema.parse(input)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const input: CreateTagInput = { name: 'test-tag' };
    expect(input.name).toBe('test-tag');
  });
});

// ============================================================================
// UPDATE TAG INPUT SCHEMA TESTS
// ============================================================================

describe('UpdateTagInputSchema', () => {
  it('should validate empty update', () => {
    const input = {};
    expect(() => UpdateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with name only', () => {
    const input = { name: 'updated-tag' };
    expect(() => UpdateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate partial update with color', () => {
    const input: UpdateTagInput = { color: '#ef4444' };
    expect(() => UpdateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should validate update with all fields', () => {
    const input: UpdateTagInput = {
      name: 'updated-tag',
      color: '#8b5cf6',
      position: 10,
    };
    expect(() => UpdateTagInputSchema.parse(input)).not.toThrow();
  });

  it('should reject update with empty name', () => {
    const input = { name: '' };
    expect(() => UpdateTagInputSchema.parse(input)).toThrow();
  });

  it('should infer correct TypeScript type', () => {
    const input: UpdateTagInput = { name: 'updated-tag' };
    expect(input.name).toBe('updated-tag');
  });
});

// ============================================================================
// DUPLICATE CANDIDATE SCHEMA TESTS
// ============================================================================

describe('DuplicateCandidateSchema', () => {
  it('should validate unresolved duplicate candidate', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'doi' as const,
      confidence: 0.95,
      resolved: false,
      resolution: null,
      resolvedAt: null,
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).not.toThrow();
  });

  it('should validate resolved duplicate candidate with "keep-existing"', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'isbn' as const,
      confidence: 1.0,
      resolved: true,
      resolution: 'keep-existing' as const,
      resolvedAt: '2024-01-16T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).not.toThrow();
  });

  it('should validate resolved duplicate candidate with "merge"', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'title-creator' as const,
      confidence: 0.85,
      resolved: true,
      resolution: 'merge' as const,
      resolvedAt: '2024-01-16T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).not.toThrow();
  });

  it('should validate resolved duplicate candidate with "keep-both"', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'doi' as const,
      confidence: 0.75,
      resolved: true,
      resolution: 'keep-both' as const,
      resolvedAt: '2024-01-16T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).not.toThrow();
  });

  it('should reject invalid matchReason', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'invalid-reason',
      confidence: 0.95,
      resolved: false,
      resolution: null,
      resolvedAt: null,
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).toThrow();
  });

  it('should reject invalid resolution', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'doi',
      confidence: 0.95,
      resolved: true,
      resolution: 'invalid-resolution',
      resolvedAt: '2024-01-16T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).toThrow();
  });

  it('should reject invalid confidence type', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'doi',
      confidence: '0.95',
      resolved: false,
      resolution: null,
      resolvedAt: null,
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).toThrow();
  });

  it('should reject missing required field', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      // Missing duplicateReferenceId
      matchReason: 'doi',
      confidence: 0.95,
      resolved: false,
      resolution: null,
      resolvedAt: null,
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateSchema.parse(candidate)).toThrow();
  });
});

// ============================================================================
// DUPLICATE CANDIDATE LIST SCHEMA TESTS
// ============================================================================

describe('DuplicateCandidateListSchema', () => {
  it('should validate array of duplicate candidates', () => {
    const candidates = [
      {
        _id: '507f1f77bcf86cd799439016',
        userId: 'user123',
        existingReferenceId: '507f1f77bcf86cd799439011',
        duplicateReferenceId: '507f1f77bcf86cd799439012',
        matchReason: 'doi' as const,
        confidence: 0.95,
        resolved: false,
        resolution: null,
        resolvedAt: null,
        createdAt: '2024-01-15T10:00:00Z',
      },
    ];
    expect(() => DuplicateCandidateListSchema.parse(candidates)).not.toThrow();
  });

  it('should validate empty array', () => {
    expect(() => DuplicateCandidateListSchema.parse([])).not.toThrow();
  });

  it('should reject non-array', () => {
    const candidate = {
      _id: '507f1f77bcf86cd799439016',
      userId: 'user123',
      existingReferenceId: '507f1f77bcf86cd799439011',
      duplicateReferenceId: '507f1f77bcf86cd799439012',
      matchReason: 'doi' as const,
      confidence: 0.95,
      resolved: false,
      resolution: null,
      resolvedAt: null,
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => DuplicateCandidateListSchema.parse(candidate)).toThrow();
  });
});

// ============================================================================
// PROJECT LINK SCHEMA TESTS
// ============================================================================

describe('ProjectLinkSchema', () => {
  it('should validate project link with reference', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      projectId: 'project123',
      referenceId: '507f1f77bcf86cd799439011',
      userId: 'user123',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).not.toThrow();
  });

  it('should validate project link with collection', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      projectId: 'project123',
      collectionId: '507f1f77bcf86cd799439014',
      userId: 'user123',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).not.toThrow();
  });

  it('should validate project link with both reference and collection', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      projectId: 'project123',
      referenceId: '507f1f77bcf86cd799439011',
      collectionId: '507f1f77bcf86cd799439014',
      userId: 'user123',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).not.toThrow();
  });

  it('should validate project link without reference or collection', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      projectId: 'project123',
      userId: 'user123',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).not.toThrow();
  });

  it('should reject project link with missing required field (projectId)', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      referenceId: '507f1f77bcf86cd799439011',
      userId: 'user123',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).toThrow();
  });

  it('should reject project link with missing required field (userId)', () => {
    const link = {
      _id: '507f1f77bcf86cd799439017',
      projectId: 'project123',
      referenceId: '507f1f77bcf86cd799439011',
      createdAt: '2024-01-15T10:00:00Z',
    };
    expect(() => ProjectLinkSchema.parse(link)).toThrow();
  });
});

// ============================================================================
// TYPE INFERENCE TESTS
// ============================================================================

describe('Type Inference', () => {
  it('should infer ReferenceSchemaType correctly', () => {
    const ref: ReferenceSchemaType = createValidReference();
    // TypeScript compilation test - if this compiles, types are correct
    expect(ref._id).toBeDefined();
    expect(ref.type).toBeDefined();
    expect(ref.title).toBeDefined();
  });

  it('should infer CollectionSchemaType correctly', () => {
    const collection: CollectionSchemaType = createValidCollection();
    expect(collection._id).toBeDefined();
    expect(collection.name).toBeDefined();
  });

  it('should infer TagSchemaType correctly', () => {
    const tag: TagSchemaType = createValidTag();
    expect(tag._id).toBeDefined();
    expect(tag.name).toBeDefined();
  });

  it('should infer AuthorSchemaType correctly', () => {
    const author: AuthorSchemaType = { full: 'John Doe' };
    expect(author.full).toBeDefined();
  });

  it('should infer CreateReferenceInput correctly', () => {
    const input: CreateReferenceInput = {
      type: 'article',
      title: 'Test',
    };
    expect(input.type).toBeDefined();
    expect(input.title).toBeDefined();
  });

  it('should infer UpdateReferenceInput correctly', () => {
    const input: UpdateReferenceInput = { title: 'Updated' };
    expect(input.title).toBe('Updated');
  });

  it('should infer CreateCollectionInput correctly', () => {
    const input: CreateCollectionInput = { name: 'Test Collection' };
    expect(input.name).toBeDefined();
  });

  it('should infer UpdateCollectionInput correctly', () => {
    const input: UpdateCollectionInput = { name: 'Updated Collection' };
    expect(input.name).toBe('Updated Collection');
  });

  it('should infer CreateTagInput correctly', () => {
    const input: CreateTagInput = { name: 'test-tag' };
    expect(input.name).toBeDefined();
  });

  it('should infer UpdateTagInput correctly', () => {
    const input: UpdateTagInput = { name: 'updated-tag' };
    expect(input.name).toBe('updated-tag');
  });
});

// ============================================================================
// ERROR MESSAGE TESTS
// ============================================================================

describe('Error Messages', () => {
  it('should provide helpful error message for missing required field', () => {
    try {
      ReferenceSchema.parse({ userId: 'user123' });
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('Required');
    }
  });

  it('should provide helpful error message for invalid type', () => {
    try {
      ReferenceTypeSchema.parse('invalid-type');
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it('should provide helpful error message for invalid number type', () => {
    const ref = createValidReference();
    (ref as any).year = '2024';
    try {
      ReferenceSchema.parse(ref);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('Expected number');
    }
  });

  it('should provide helpful error message for empty string when min length required', () => {
    try {
      CreateReferenceInputSchema.parse({ type: 'article', title: '' });
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
