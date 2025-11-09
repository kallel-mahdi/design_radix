import mongoose, { Schema, Document } from 'mongoose';

// CRITICAL: Updated schema with type, deleted, deletedAt, isbn fields

export interface IReference extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other';
  title: string;
  authors: Array<{
    given?: string;
    family?: string;
    full: string;
  }>;
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  citationKey: string;
  tags: string[];
  collectionIds: mongoose.Types.ObjectId[];
  hasPdf: boolean;
  pdf?: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  };
  sourceRaw: {
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual';
    payload: any;
  };
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferenceSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['article', 'book', 'chapter', 'conference', 'thesis', 'other'],
      required: true,
      default: 'article'
    },
    title: { type: String, required: true },
    authors: [{
      given: { type: String },
      family: { type: String },
      full: { type: String, required: true }
    }],
    year: { type: Number, min: 1000, max: 2100 },
    venue: { type: String },
    doi: { type: String },
    isbn: { type: String },
    url: { type: String },
    abstract: { type: String },
    citationKey: { type: String, required: true, unique: true },
    tags: [{ type: String }],
    collectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    hasPdf: { type: Boolean, default: false },
    pdf: {
      storedPath: { type: String },
      originalName: { type: String },
      size: { type: Number },
      mimeType: { type: String },
      uploadedAt: { type: Date }
    },
    sourceRaw: {
      provider: {
        type: String,
        enum: ['doi', 'bibtex', 'csl-json', 'ris', 'manual'],
        required: true
      },
      payload: { type: Schema.Types.Mixed }
    },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

// CRITICAL INDEXES for performance
ReferenceSchema.index({ userId: 1, deleted: 1 });
ReferenceSchema.index({ userId: 1, collectionIds: 1 });
ReferenceSchema.index({ userId: 1, tags: 1 });
ReferenceSchema.index({ doi: 1 });
ReferenceSchema.index({ isbn: 1 });
ReferenceSchema.index({ title: 'text', abstract: 'text' });

export const Reference = mongoose.model<IReference>('Reference', ReferenceSchema);
