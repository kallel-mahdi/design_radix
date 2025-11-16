/**
 * Zod Validation Schemas
 *
 * Runtime validation for API responses to catch malformed data early.
 * These schemas mirror the TypeScript types in common/types.ts but provide
 * runtime validation and type inference.
 */

import { z } from 'zod';

/**
 * Author Schema
 * Validates complete author objects from API responses
 */
export const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string(),
});

/**
 * Create Author Schema
 * Validates author input for create/update operations
 * The 'full' field is optional and auto-generated from given/family if not provided
 */
export const CreateAuthorSchema = z.object({
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
 * Validates reference objects from API responses
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
 * Validates collection objects from API responses
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
 * Validates tag objects from API responses
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
 * Validates project link objects from API responses
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
 * Validates duplicate detection results from API responses
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
 * Type inference for response schemas
 */
export type Reference = z.infer<typeof ReferenceSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Author = z.infer<typeof AuthorSchema>;
export type CreateAuthor = z.infer<typeof CreateAuthorSchema>;

/**
 * Array schemas for list responses
 */
export const ReferenceListSchema = z.array(ReferenceSchema);
export const CollectionListSchema = z.array(CollectionSchema);
export const TagListSchema = z.array(TagSchema);
export const DuplicateCandidateListSchema = z.array(DuplicateCandidateSchema);

/**
 * Request schemas for create/update operations
 */

// Create Reference Schema - only required fields for creating a reference
export const CreateReferenceSchema = z.object({
  type: ReferenceTypeSchema,
  title: z.string().min(1),
  authors: z.array(CreateAuthorSchema).optional(),
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

// Update Reference Schema - all fields optional
export const UpdateReferenceSchema = CreateReferenceSchema.partial();

// Create Collection Schema
export const CreateCollectionSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
  color: z.string().optional(),
});

// Update Collection Schema
export const UpdateCollectionSchema = CreateCollectionSchema.partial().extend({
  position: z.number().optional(),
});

// Create Tag Schema
export const CreateTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  position: z.number().optional(),
});

// Update Tag Schema
export const UpdateTagSchema = CreateTagSchema.partial();

// Tag Color Update Schema (for PATCH /:name/color)
export const TagColorUpdateSchema = z.object({
  color: z.string().nullable(),
  position: z.number().nullable().optional(),
});

// Project Link/Unlink Request Schemas
export const CreateProjectLinkSchema = z.object({
  projectId: z.string(),
  referenceId: z.string(),
});

export const DeleteProjectLinkSchema = z.object({
  projectId: z.string(),
  referenceId: z.string(),
});

export const CreateProjectLinkCollectionSchema = z.object({
  projectId: z.string(),
  collectionId: z.string(),
});

export const DeleteProjectLinkCollectionSchema = z.object({
  projectId: z.string(),
  collectionId: z.string(),
});

// Duplicate Resolution Schema
export const DuplicateResolutionSchema = z.object({
  resolution: z.enum(['keep-existing', 'merge', 'keep-both']),
});

// DOI Import Schema (Session 6)
// Uses Crossref-recommended regex (matches 99.3% of Crossref DOIs)
// See: docs/sessions/06-plan.md for validation rationale
export const ImportDoiSchema = z.object({
  doi: z.string()
    .min(1, 'DOI is required')
    .regex(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, 'Invalid DOI format'),
});

/**
 * Type inference for request schemas
 */
export type CreateReference = z.infer<typeof CreateReferenceSchema>;
export type UpdateReference = z.infer<typeof UpdateReferenceSchema>;
export type CreateCollection = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollection = z.infer<typeof UpdateCollectionSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
export type TagColorUpdate = z.infer<typeof TagColorUpdateSchema>;
export type CreateProjectLink = z.infer<typeof CreateProjectLinkSchema>;
export type DeleteProjectLink = z.infer<typeof DeleteProjectLinkSchema>;
export type CreateProjectLinkCollection = z.infer<typeof CreateProjectLinkCollectionSchema>;
export type DeleteProjectLinkCollection = z.infer<typeof DeleteProjectLinkCollectionSchema>;
export type DuplicateResolution = z.infer<typeof DuplicateResolutionSchema>;
export type ImportDoi = z.infer<typeof ImportDoiSchema>;
