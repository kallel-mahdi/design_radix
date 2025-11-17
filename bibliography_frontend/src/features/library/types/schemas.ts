/**
 * Form Validation Schemas for Library Feature
 *
 * Extends shared schemas from @bibliography/shared for form-specific validation.
 * Used with react-hook-form + Zod resolver for runtime validation.
 *
 * Referenced patterns:
 * - Zotero dual-mode author entry: zotero/chrome/content/zotero/xpcom/data/creators.js:176-242
 * - Shared schemas: shared/src/schemas.ts
 */

import { z } from 'zod';
import {
  ReferenceTypeSchema,
  CreateAuthorSchema,
} from '@bibliography/shared';

/**
 * DOI Validation Pattern
 * Uses Crossref-recommended regex (matches 99.3% of Crossref DOIs)
 * See: docs/sessions/06-plan.md for validation rationale
 */
const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

/**
 * Reference Form Schema
 *
 * Form-specific validation extending shared schemas.
 * Differences from CreateReferenceSchema:
 * - Authors array can be empty (users can add incrementally)
 * - Year validation range: 1000-2100
 * - DOI/URL format validation with helpful error messages
 * - Default values for type, authors, tags, collectionIds
 * - sourceRaw automatically set to 'manual' for form submissions
 */
export const ReferenceFormSchema = z.object({
  type: ReferenceTypeSchema,
  title: z.string().min(1, 'Title is required'),
  authors: z.array(CreateAuthorSchema),
  year: z.preprocess(
    (val) => {
      // Convert NaN from empty number inputs to undefined
      if (typeof val === 'number' && isNaN(val)) return undefined;
      return val;
    },
    z
      .number()
      .int('Year must be a whole number')
      .min(1000, 'Year must be at least 1000')
      .max(2100, 'Year must be no later than 2100')
      .optional()
  ),
  venue: z.string().optional(),
  doi: z
    .string()
    .regex(DOI_REGEX, 'Invalid DOI format (e.g., 10.1234/example)')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  url: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  abstract: z.string().optional(),
  tags: z.array(z.string()),
  collectionIds: z.array(z.string()),
});

/**
 * Inferred TypeScript type for form data
 */
export type ReferenceFormData = z.infer<typeof ReferenceFormSchema>;

/**
 * Transform form data to CreateReferenceInput for API submission
 *
 * Adds required sourceRaw field with 'manual' provider and original form data as payload.
 * Filters out empty author entries to allow title-only reference creation.
 */
export function formDataToCreateInput(data: ReferenceFormData) {
  // Filter out authors where all fields are empty/whitespace
  // This allows title-only reference creation (Session 7 acceptance criteria)
  const validAuthors = data.authors?.filter(author => {
    const hasGiven = author.given && author.given.trim().length > 0;
    const hasFamily = author.family && author.family.trim().length > 0;
    const hasFull = author.full && author.full.trim().length > 0;
    return hasGiven || hasFamily || hasFull;
  }) || [];

  return {
    ...data,
    authors: validAuthors,
    sourceRaw: {
      provider: 'manual' as const,
      payload: data,
    },
  };
}

/**
 * Transform form data to UpdateReferenceInput for API submission
 *
 * Filters out empty/undefined fields and adds sourceRaw.
 * Filters out empty author entries for consistency with create flow.
 */
export function formDataToUpdateInput(data: Partial<ReferenceFormData>) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
  );

  // Filter out empty authors if authors array is being updated
  if (data.authors) {
    const validAuthors = data.authors.filter(author => {
      const hasGiven = author.given && author.given.trim().length > 0;
      const hasFamily = author.family && author.family.trim().length > 0;
      const hasFull = author.full && author.full.trim().length > 0;
      return hasGiven || hasFamily || hasFull;
    });
    filtered.authors = validAuthors;
  }

  return {
    ...filtered,
    sourceRaw: {
      provider: 'manual' as const,
      payload: data,
    },
  };
}
