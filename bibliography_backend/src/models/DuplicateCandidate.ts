import mongoose, { Schema, Document } from 'mongoose';

// CRITICAL: Updated schema with ISBN/DOI/title-creator matching support

export interface IDuplicateCandidate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  existingReferenceId: mongoose.Types.ObjectId;
  duplicateReferenceId: mongoose.Types.ObjectId;
  matchReason: 'isbn' | 'doi' | 'title-creator';
  confidence: number;
  resolved: boolean;
  resolution: 'keep-existing' | 'merge' | 'keep-both' | null;
  resolvedAt?: Date;
  createdAt: Date;
}

const DuplicateCandidateSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    existingReferenceId: { type: Schema.Types.ObjectId, ref: 'Reference', required: true },
    duplicateReferenceId: { type: Schema.Types.ObjectId, ref: 'Reference', required: true },
    matchReason: {
      type: String,
      enum: ['isbn', 'doi', 'title-creator'],
      required: true
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    resolved: { type: Boolean, default: false },
    resolution: {
      type: String,
      enum: ['keep-existing', 'merge', 'keep-both'],
      default: null
    },
    resolvedAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// CRITICAL INDEXES
DuplicateCandidateSchema.index({ userId: 1, resolved: 1 });
DuplicateCandidateSchema.index({ existingReferenceId: 1 });
DuplicateCandidateSchema.index({ duplicateReferenceId: 1 });

export const DuplicateCandidate = mongoose.model<IDuplicateCandidate>('DuplicateCandidate', DuplicateCandidateSchema);
