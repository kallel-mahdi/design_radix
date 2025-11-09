import { IReference } from '../models/Reference';
import mongoose from 'mongoose';

export interface CreateReferenceInput {
  type: IReference['type'];
  title: string;
  authors?: IReference['authors'];
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
  authors?: IReference['authors'];
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
  limit?: number;
  offset?: number;
}

export interface IReferenceService {
  create(userId: string, data: CreateReferenceInput): Promise<IReference>;
  getById(id: string, userId: string): Promise<IReference | null>;
  list(userId: string, filters: ReferenceFilters): Promise<IReference[]>;
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
}
