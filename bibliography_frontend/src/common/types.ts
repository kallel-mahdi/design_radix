// Core data models (from frontend Spec.md section 6)

export interface Reference {
  id: string;
  userId: string;
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other';
  title: string;
  authors: Author[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  isbn: string | null;
  url: string | null;
  abstract: string | null; // Phase 2
  citationKey: string;
  tags: string[];
  collectionIds: string[];
  hasPdf: boolean;
  pdf: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  } | null;
  sourceRaw: {
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual';
    payload: any;
  };
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  given?: string;
  family?: string;
  full: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  position: number;
  color: string | null;
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  position: number | null;
  automatic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  referenceId?: string;
  collectionId?: string;
  userId: string;
  createdAt: Date;
}

export interface DuplicateCandidate {
  id: string;
  userId: string;
  existingReferenceId: string;
  duplicateReferenceId: string;
  matchReason: 'isbn' | 'doi' | 'title-creator';
  confidence: number;
  resolved: boolean;
  resolution: 'keep-existing' | 'merge' | 'keep-both' | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

// Input types for create/update operations
export interface CreateReferenceInput {
  type: Reference['type'];
  title: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  tags?: string[];
  collectionIds?: string[];
}

export interface UpdateReferenceInput {
  title?: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  tags?: string[];
  collectionIds?: string[];
}
