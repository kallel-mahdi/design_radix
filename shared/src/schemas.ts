/**
 * Zod Validation Schemas
 *
 * Runtime validation for API responses to catch malformed data early.
 * These schemas mirror the TypeScript types in common/types.ts but provide
 * runtime validation and type inference.
 */

import { z } from 'zod';

/**
 * Author Schema (for stored references)
 * Validates complete author objects with full name
 */
export const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string(),
});

/**
 * Author Input Schema (for API requests)
 * Validates author input where 'full' is optional and auto-generated from given/family
 * If full is provided, it will be used as-is
 */
export const AuthorInputSchema = z.object({
  given: z.string().trim().optional(),
  family: z.string().trim().optional(),
  full: z.string().trim().optional(),
  // Either full OR family must be provided (after trimming)
}).refine(
  (data) => {
    const hasFullName = data.full && data.full.length > 0;
    const hasFamilyName = data.family && data.family.length > 0;
    return hasFullName || hasFamilyName;
  },
  { message: 'Author must have either full name or family name' }
);

/**
 * Reference Type Enum
 */
export const ReferenceTypeSchema = z.enum([
  'article',
  'book',
  'chapter',
  'conference',
  'thesis',
  'other',
]);

export type ReferenceType = z.infer<typeof ReferenceTypeSchema>;

/**
 * PDF Metadata Schema
 */
const PdfMetadataSchema = z.object({
  storedPath: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.string(),
  uploadedAt: z.string(), // ISO 8601 string
});

/**
 * Source Provider Enum
 */
export const SourceProviderSchema = z.enum([
  'doi',
  'bibtex',
  'csl-json',
  'ris',
  'manual',
]);

/**
 * Source Raw Schema
 */
export const SourceRawSchema = z.object({
  provider: SourceProviderSchema,
  payload: z.unknown(), // Backend-specific data, don't validate structure
});

/**
 * Reference Schema
 * Complete validation for reference objects from API
 */
export const ReferenceSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: ReferenceTypeSchema,
  title: z.string(),
  authors: z.array(AuthorSchema),
  year: z.number().nullish(),
  venue: z.string().nullish(),
  doi: z.string().nullish(),
  isbn: z.string().nullish(),
  url: z.string().nullish(),
  abstract: z.string().nullish(),
  citationKey: z.string(),
  tags: z.array(z.string()),
  collectionIds: z.array(z.string()),
  hasPdf: z.boolean(),
  pdf: PdfMetadataSchema.nullish(),
  sourceRaw: SourceRawSchema,
  deleted: z.boolean(),
  deletedAt: z.string().nullish(),
  createdAt: z.string(), // ISO 8601 string
  updatedAt: z.string(), // ISO 8601 string
});

/**
 * Collection Schema
 * Validates collection objects from API
 */
export const CollectionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  position: z.number(),
  color: z.string().nullable(),
  deleted: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Tag Schema
 * Validates tag objects from API
 */
export const TagSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  position: z.number().nullable(),
  automatic: z.boolean(),
  usageCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Project Link Schema
 * Validates project link objects from API
 */
export const ProjectLinkSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  referenceId: z.string().optional(),
  collectionId: z.string().optional(),
  userId: z.string(),
  createdAt: z.string(),
});

/**
 * Duplicate Candidate Schema
 * Validates duplicate detection results from API
 */
export const DuplicateCandidateSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  existingReferenceId: z.string(),
  duplicateReferenceId: z.string(),
  matchReason: z.enum(['isbn', 'doi', 'title-creator']),
  confidence: z.number(),
  resolved: z.boolean(),
  resolution: z
    .enum(['keep-existing', 'merge', 'keep-both'])
    .nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * Type inference helpers
 * Use these to get TypeScript types from Zod schemas
 */
export type ReferenceSchemaType = z.infer<typeof ReferenceSchema>;
export type CollectionSchemaType = z.infer<typeof CollectionSchema>;
export type TagSchemaType = z.infer<typeof TagSchema>;
export type AuthorSchemaType = z.infer<typeof AuthorSchema>;
export type AuthorInputType = z.infer<typeof AuthorInputSchema>;

/**
 * Array schemas for list responses
 */
export const ReferenceListSchema = z.array(ReferenceSchema);
export const CollectionListSchema = z.array(CollectionSchema);
export const TagListSchema = z.array(TagSchema);
export const DuplicateCandidateListSchema = z.array(DuplicateCandidateSchema);

/**
 * Input schemas for create/update operations
 */

// Create Reference Input - only required fields from ReferenceSchema
export const CreateReferenceInputSchema = z.object({
  type: ReferenceTypeSchema,
  title: z.string().min(1),
  authors: z.array(AuthorInputSchema).optional(),
  year: z.number().optional(),
  venue: z.string().optional(),
  doi: z.string().optional(),
  isbn: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  tags: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
  sourceRaw: SourceRawSchema,
});

// Update Reference Input - all fields optional
export const UpdateReferenceInputSchema = CreateReferenceInputSchema.partial();

// Create Collection Input
export const CreateCollectionInputSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
  color: z.string().optional(),
});

// Update Collection Input
export const UpdateCollectionInputSchema = CreateCollectionInputSchema.partial().extend({
  position: z.number().optional(),
});

// Create Tag Input
export const CreateTagInputSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  position: z.number().optional(),
});

// Update Tag Input
export const UpdateTagInputSchema = CreateTagInputSchema.partial();

// Tag Color Update Input (for PATCH /:name/color)
export const TagColorUpdateInputSchema = z.object({
  color: z.string().nullable(),
  position: z.number().nullable().optional(),
});

// Project Link/Unlink Input
export const ProjectLinkInputSchema = z.object({
  projectId: z.string(),
  referenceId: z.string(),
});

export const ProjectUnlinkInputSchema = z.object({
  projectId: z.string(),
  referenceId: z.string(),
});

export const ProjectLinkCollectionInputSchema = z.object({
  projectId: z.string(),
  collectionId: z.string(),
});

export const ProjectUnlinkCollectionInputSchema = z.object({
  projectId: z.string(),
  collectionId: z.string(),
});

// Duplicate Resolution Input
export const DuplicateResolutionInputSchema = z.object({
  resolution: z.enum(['keep-existing', 'merge', 'keep-both']),
});

// DOI Import Input (Session 6)
// Uses Crossref-recommended regex (matches 99.3% of Crossref DOIs)
// See: docs/sessions/06-plan.md for validation rationale
export const ImportDoiInputSchema = z.object({
  doi: z.string()
    .min(1, 'DOI is required')
    .regex(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, 'Invalid DOI format'),
});

/**
 * Type exports for input schemas
 */
export type CreateReferenceInput = z.infer<typeof CreateReferenceInputSchema>;
export type UpdateReferenceInput = z.infer<typeof UpdateReferenceInputSchema>;
export type CreateCollectionInput = z.infer<typeof CreateCollectionInputSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionInputSchema>;
export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagInputSchema>;
export type TagColorUpdateInput = z.infer<typeof TagColorUpdateInputSchema>;
export type ProjectLinkInput = z.infer<typeof ProjectLinkInputSchema>;
export type ProjectUnlinkInput = z.infer<typeof ProjectUnlinkInputSchema>;
export type ProjectLinkCollectionInput = z.infer<typeof ProjectLinkCollectionInputSchema>;
export type ProjectUnlinkCollectionInput = z.infer<typeof ProjectUnlinkCollectionInputSchema>;
export type DuplicateResolutionInput = z.infer<typeof DuplicateResolutionInputSchema>;
export type ImportDoiInput = z.infer<typeof ImportDoiInputSchema>;
