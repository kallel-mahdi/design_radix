/**
 * Core data models - Re-exported from @bibliography/shared
 *
 * Single source of truth for types across frontend and backend.
 * All types are inferred from Zod schemas for runtime validation.
 */

import type {
  ReferenceSchemaType,
  CollectionSchemaType,
  TagSchemaType,
  AuthorSchemaType,
  CreateReferenceInput as SharedCreateReferenceInput,
  UpdateReferenceInput as SharedUpdateReferenceInput,
  CreateCollectionInput as SharedCreateCollectionInput,
  UpdateCollectionInput as SharedUpdateCollectionInput,
  CreateTagInput as SharedCreateTagInput,
  UpdateTagInput as SharedUpdateTagInput,
} from '@bibliography/shared';

// Re-export types from shared package
export type Reference = ReferenceSchemaType;
export type Author = AuthorSchemaType;
export type Collection = CollectionSchemaType;
export type Tag = TagSchemaType;

// Re-export input types
export type CreateReferenceInput = SharedCreateReferenceInput;
export type UpdateReferenceInput = SharedUpdateReferenceInput;
export type CreateCollectionInput = SharedCreateCollectionInput;
export type UpdateCollectionInput = SharedUpdateCollectionInput;
export type CreateTagInput = SharedCreateTagInput;
export type UpdateTagInput = SharedUpdateTagInput;

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
