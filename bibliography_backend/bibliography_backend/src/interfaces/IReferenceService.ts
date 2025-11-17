import { IReference } from '../models/Reference';
import mongoose from 'mongoose';

export interface CreateReferenceInput {
  type: IReference['type'];
  title: string;
  // Authors: 'full' is optional in input and will be auto-generated from given/family if not provided
  // Stored references always have 'full' populated
  authors?: Array<{
    given?: string;
    family?: string;
    full?: string; // Optional - will be auto-generated if not provided
  }>;
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  tags?: string[];
  collectionIds?: string[];
  sourceRaw: {
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual';
    payload: any;
  };
}

export interface UpdateReferenceInput {
  type?: IReference['type'];
  title?: string;
  // Authors: 'full' is optional in input and will be auto-generated from given/family if not provided
  authors?: Array<{
    given?: string;
    family?: string;
    full?: string; // Optional - will be auto-generated if not provided
  }>;
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  tags?: string[];
  collectionIds?: string[];
}

export interface ReferenceFilters {
  collectionId?: string;
  tags?: string[];
  deleted?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IReferenceService {
  create(userId: string, data: CreateReferenceInput): Promise<IReference>;
  getById(id: string, userId: string): Promise<IReference | null>;
  list(userId: string, filters: ReferenceFilters): Promise<{ references: IReference[]; total: number }>;
  update(id: string, userId: string, data: UpdateReferenceInput): Promise<IReference | null>;
  softDelete(id: string, userId: string): Promise<boolean>;
  restore(id: string, userId: string): Promise<boolean>;
  permanentDelete(id: string, userId: string): Promise<boolean>;
  attachPdf(id: string, userId: string, pdfData: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
  }): Promise<IReference | null>;
  detachPdf(id: string, userId: string): Promise<IReference | null>;
  // Session 10: PDF upload/download/delete
  uploadPdf(id: string, userId: string, file: Express.Multer.File): Promise<IReference | null>;
  getPdfPath(id: string, userId: string): Promise<{ storedPath: string; originalName: string } | null>;
  deletePdf(id: string, userId: string): Promise<boolean>;
}
