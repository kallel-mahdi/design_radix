/**
 * Unit Tests for Reference Form Schema Validation
 *
 * Tests Zod schema validation for ReferenceFormData including:
 * - Required fields (title)
 * - Optional fields with format validation (DOI, URL, year)
 * - Author field validation (structured vs single mode)
 * - Edge cases and error messages
 */

import { describe, it, expect } from 'vitest';
import { ReferenceFormSchema, formDataToCreateInput, formDataToUpdateInput } from '../schemas';

describe('ReferenceFormSchema', () => {
  describe('Valid References', () => {
    it('should validate reference with all fields populated', () => {
      const validData = {
        type: 'article' as const,
        title: 'Machine Learning in Practice',
        authors: [
          { given: 'John', family: 'Doe', full: '' },
          { given: '', family: '', full: 'World Health Organization' },
        ],
        year: 2024,
        venue: 'Nature Machine Intelligence',
        doi: '10.1234/example',
        url: 'https://example.com/paper',
        abstract: 'This is an abstract about machine learning.',
        tags: ['AI', 'ML'],
        collectionIds: ['col-123', 'col-456'],
      };

      const result = ReferenceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate reference with only required fields (title)', () => {
      const minimalData = {
        type: 'article' as const,
        title: 'Minimal Reference',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should accept all reference types', () => {
      const types = ['article', 'book', 'chapter', 'conference', 'thesis', 'other'] as const;

      types.forEach((type) => {
        const data = {
          type,
          title: 'Test Reference',
          authors: [],
          tags: [],
          collectionIds: [],
        };

        const result = ReferenceFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Title Validation', () => {
    it('should reject empty title', () => {
      const data = {
        type: 'article' as const,
        title: '',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject missing title', () => {
      const data = {
        type: 'article' as const,
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('DOI Validation', () => {
    it('should accept valid DOI format', () => {
      const validDOIs = [
        '10.1234/example',
        '10.1000/xyz123',
        '10.12345/ABC-123_test',
        '10.1234/example(2024)',
      ];

      validDOIs.forEach((doi) => {
        const data = {
          type: 'article' as const,
          title: 'Test',
          doi,
          authors: [],
          tags: [],
          collectionIds: [],
        };

        const result = ReferenceFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid DOI format', () => {
      const invalidDOIs = ['bad-doi', '1234/example', 'doi:10.1234/example', ''];

      invalidDOIs.forEach((doi) => {
        const data = {
          type: 'article' as const,
          title: 'Test',
          doi,
          authors: [],
          tags: [],
          collectionIds: [],
        };

        const result = ReferenceFormSchema.safeParse(data);
        if (doi === '') {
          // Empty string is acceptable (transforms to undefined)
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('Invalid DOI format');
          }
        }
      });
    });

    it('should accept empty DOI string (optional field)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        doi: '',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('should accept valid URL formats', () => {
      const validURLs = [
        'https://example.com',
        'http://example.com/path',
        'https://example.com/path?query=1',
        'https://subdomain.example.com',
      ];

      validURLs.forEach((url) => {
        const data = {
          type: 'article' as const,
          title: 'Test',
          url,
          authors: [],
          tags: [],
          collectionIds: [],
        };

        const result = ReferenceFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URL format', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        url: 'not-a-url',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid URL format');
      }
    });
  });

  describe('Year Validation', () => {
    it('should accept years in valid range (1000-2100)', () => {
      const validYears = [1000, 1500, 2000, 2024, 2100];

      validYears.forEach((year) => {
        const data = {
          type: 'article' as const,
          title: 'Test',
          year,
          authors: [],
          tags: [],
          collectionIds: [],
        };

        const result = ReferenceFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject year below minimum (< 1000)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        year: 999,
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Year must be at least 1000');
      }
    });

    it('should reject year above maximum (> 2100)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        year: 2101,
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Year must be no later than 2100');
      }
    });

    it('should reject non-integer year', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        year: 2024.5,
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Year must be a whole number');
      }
    });
  });

  describe('Author Validation', () => {
    it('should accept empty authors array', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept structured author (given/family)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: 'John', family: 'Doe', full: '' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept single-mode author (full name only)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: '', family: '', full: 'World Health Organization' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept mixed mode (both structured and full)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // Negative test cases
    it('should reject completely empty author object', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: '', family: '', full: '' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Author must have either full name or family name');
      }
    });

    it('should reject author with only given name (no family or full)', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: 'John', family: '', full: '' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Author must have either full name or family name');
      }
    });

    it('should reject author with whitespace-only family name', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: 'John', family: '   ', full: '' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Author must have either full name or family name');
      }
    });

    it('should reject author with whitespace-only full name', () => {
      const data = {
        type: 'article' as const,
        title: 'Test',
        authors: [{ given: '', family: '', full: '   ' }],
        tags: [],
        collectionIds: [],
      };

      const result = ReferenceFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Author must have either full name or family name');
      }
    });
  });

  describe('Helper Functions', () => {
    it('formDataToCreateInput should add sourceRaw field', () => {
      const formData = {
        type: 'article' as const,
        title: 'Test',
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = formDataToCreateInput(formData);

      expect(result).toHaveProperty('sourceRaw');
      expect(result.sourceRaw).toEqual({
        provider: 'manual',
        payload: formData,
      });
    });

    it('formDataToUpdateInput should filter out empty values', () => {
      const formData = {
        type: 'article' as const,
        title: 'Test',
        doi: '',
        url: undefined,
        authors: [],
        tags: [],
        collectionIds: [],
      };

      const result = formDataToUpdateInput(formData);

      expect(result).not.toHaveProperty('doi');
      expect(result).not.toHaveProperty('url');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('sourceRaw');
    });
  });
});
