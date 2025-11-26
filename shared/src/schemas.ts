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
 * Collection Schema
 * Validates collection objects from API responses
 * Defined early to allow ReferenceSchema to reference it
 */
export const CollectionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  position: z.number(),
  color: z.string().nullable(),
  deleted: z.boolean(),
  deletedAt: z.string().nullish(), // Session 9 fix: allow undefined when not soft-deleted
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Reference Schema
 * Validates reference objects from API responses
 *
 * Note: collections field is populated when fetching reference details
 * collectionIds is always present for backwards compatibility
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
  collections: z.array(CollectionSchema).optional(), // Populated in detail queries
  hasPdf: z.boolean(),
  pdf: PdfMetadataSchema.nullish(),
  sourceRaw: SourceRawSchema,
  deleted: z.boolean(),
  deletedAt: z.string().nullish(),
  createdAt: z.string(), // ISO 8601 string
  updatedAt: z.string(), // ISO 8601 string
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

/**
 * PDF Metadata Input Schema (for creating reference with PDF attached)
 * Used in unified architecture where PDF is uploaded first, then reference created
 */
const PdfMetadataInputSchema = z.object({
  storedPath: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.string(),
  uploadedAt: z.string(), // ISO 8601 string from frontend
});

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
  // Unified Architecture: PDF metadata from /pdf/extract endpoint
  hasPdf: z.boolean().optional(),
  pdf: PdfMetadataInputSchema.optional(),
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
// 'action' field changed from 'resolution' to align with status-based model
// 'keep-new' allows keeping the newly detected reference
// 'merged' indicates merge operation (not implemented in MVP, will throw error)
export const DuplicateResolutionSchema = z.object({
  action: z.enum(['keep-existing', 'keep-new', 'merged']),
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

/**
 * API Response Envelope Types
 * Used by both frontend and backend for consistent API responses
 */

/**
 * Standard API response envelope
 * All backend endpoints return this structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMetadata;
  code?: string;
  details?: any;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Error response structure
 */
export interface ApiError {
  success: false;
  message: string;
  code: string;
  details?: any;
}

/**
 * Type guard for API errors
 */
export function isApiError(response: ApiResponse<any> | ApiError): response is ApiError {
  return !response.success;
}

/**
 * Common error codes returned by the API
 */
export const ErrorCodes = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID: 'INVALID_ID',
  MAX_COLORED_TAGS: 'MAX_COLORED_TAGS',
  POSITION_TAKEN: 'POSITION_TAKEN',
  INVALID_POSITION: 'INVALID_POSITION',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',

  // Authentication/Authorization errors (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',

  // Conflict errors (409)
  DUPLICATE_DOI: 'DUPLICATE_DOI',
  DUPLICATE_ISBN: 'DUPLICATE_ISBN',
  DUPLICATE_KEY: 'DUPLICATE_KEY',
  DUPLICATE_CITATION_KEY: 'DUPLICATE_CITATION_KEY',
  DUPLICATE_TAG_NAME: 'DUPLICATE_TAG_NAME',
  CONFLICT: 'CONFLICT',

  // Server errors (500+)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',

  // Not implemented (501)
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  MERGE_NOT_IMPLEMENTED: 'MERGE_NOT_IMPLEMENTED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Annotation Schemas (Zotero-inspired PDF annotations)
 *
 * Zotero stores annotations in JSON format in the database.
 * We follow the same pattern for MongoDB.
 *
 * Reference: zotero/chrome/content/zotero/xpcom/data/annotations.js
 */

// Annotation types (MVP: highlight, note only)
export const AnnotationTypeSchema = z.enum(['highlight', 'note']);
export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;

// Zotero color palette (5 colors)
export const ZoteroColorSchema = z.enum([
  '#ffd400', // Yellow
  '#ff6666', // Red
  '#2ea8e5', // Blue
  '#a28ae5', // Purple
  '#5fb236', // Green
]);

// Position schema for highlights
const AnnotationPositionSchema = z.object({
  // Bounding rectangles: [x1, y1, x2, y2] in PDF coordinate space
  rects: z.array(z.tuple([z.number(), z.number(), z.number(), z.number()])),
});

// Content schema
const AnnotationContentSchema = z.object({
  text: z.string().optional(), // Highlighted text (extracted from PDF)
  comment: z.string().optional(), // User's note/comment
});

/**
 * Annotation Schema (response)
 */
export const AnnotationSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  referenceId: z.string(),
  type: AnnotationTypeSchema,
  pageIndex: z.number(), // 0-based page index
  position: AnnotationPositionSchema,
  content: AnnotationContentSchema,
  color: z.string(), // Hex color
  sortIndex: z.string(), // Zotero-style sort index: "XXXXX|YYYYY|ZZZZZ"
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Create Annotation Schema (request)
 */
export const CreateAnnotationSchema = z.object({
  type: AnnotationTypeSchema,
  pageIndex: z.number().min(0),
  position: AnnotationPositionSchema,
  content: AnnotationContentSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  sortIndex: z.string().optional(), // Auto-generated if not provided
});

/**
 * Update Annotation Schema (request)
 */
export const UpdateAnnotationSchema = z.object({
  content: AnnotationContentSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

/**
 * Type inference
 */
export type Annotation = z.infer<typeof AnnotationSchema>;
export type CreateAnnotation = z.infer<typeof CreateAnnotationSchema>;
export type UpdateAnnotation = z.infer<typeof UpdateAnnotationSchema>;

/**
 * Array schema for list responses
 */
export const AnnotationListSchema = z.array(AnnotationSchema);
