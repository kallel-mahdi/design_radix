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
 * Validates author objects with optional given/family names and required full name
 */
export const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string(),
});

/**
 * Reference Type Enum
 */
const ReferenceTypeSchema = z.enum([
  'article',
  'book',
  'chapter',
  'conference',
  'thesis',
  'other',
]);

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
const SourceProviderSchema = z.enum([
  'doi',
  'bibtex',
  'csl-json',
  'ris',
  'manual',
]);

/**
 * Source Raw Schema
 */
const SourceRawSchema = z.object({
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
  year: z.number().nullable(),
  venue: z.string().nullable(),
  doi: z.string().nullable(),
  isbn: z.string().nullable(),
  url: z.string().nullable(),
  abstract: z.string().nullable(),
  citationKey: z.string(),
  tags: z.array(z.string()),
  collectionIds: z.array(z.string()),
  hasPdf: z.boolean(),
  pdf: PdfMetadataSchema.nullable(),
  sourceRaw: SourceRawSchema,
  deleted: z.boolean(),
  deletedAt: z.string().nullable(),
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

/**
 * Array schemas for list responses
 */
export const ReferenceListSchema = z.array(ReferenceSchema);
export const CollectionListSchema = z.array(CollectionSchema);
export const TagListSchema = z.array(TagSchema);
export const DuplicateCandidateListSchema = z.array(DuplicateCandidateSchema);
