/**
 * Core data models - Re-exported from @bibliography/shared
 *
 * Single source of truth for types across frontend and backend.
 * All types are inferred from Zod schemas for runtime validation.
 */

import type {
  Reference as SharedReference,
  Collection as SharedCollection,
  Tag as SharedTag,
  Author as SharedAuthor,
  CreateReference,
  UpdateReference,
  CreateCollection,
  UpdateCollection,
  CreateTag,
  UpdateTag,
} from '@bibliography/shared';

// Re-export types from shared package
export type Reference = SharedReference;
export type Author = SharedAuthor;
export type Collection = SharedCollection;
export type Tag = SharedTag;

// Re-export request types
export type CreateReferenceInput = CreateReference;
export type UpdateReferenceInput = UpdateReference;
export type CreateCollectionInput = CreateCollection;
export type UpdateCollectionInput = UpdateCollection;
export type CreateTagInput = CreateTag;
export type UpdateTagInput = UpdateTag;

// Frontend-specific types that don't have backend equivalents yet
export interface ProjectLink {
  _id: string;
  projectId: string;
  referenceId?: string;
  collectionId?: string;
  userId: string;
  createdAt: string;
}

export interface DuplicateCandidate {
  _id: string;
  userId: string;
  existingReferenceId: string;
  duplicateReferenceId: string;
  matchReason: 'isbn' | 'doi' | 'title-creator';
  confidence: number;
  resolved: boolean;
  resolution: 'keep-existing' | 'merge' | 'keep-both' | null;
  resolvedAt: string | null;
  createdAt: string;
}
