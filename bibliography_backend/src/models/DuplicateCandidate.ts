import mongoose, { Schema, Document } from 'mongoose';

// CRITICAL: Updated schema with ISBN/DOI/title-creator matching support

export interface IDuplicateCandidate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  existingReferenceId: mongoose.Types.ObjectId;
  duplicateReferenceId: mongoose.Types.ObjectId;
  matchReason: 'isbn' | 'doi' | 'title-creator';
  confidence: number;
  status: 'pending' | 'keep-existing' | 'keep-new' | 'merged';
  actionTakenBy?: string;
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
    status: {
      type: String,
      enum: ['pending', 'keep-existing', 'keep-new', 'merged'],
      default: 'pending',
      required: true
    },
    actionTakenBy: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// CRITICAL INDEXES
DuplicateCandidateSchema.index({ userId: 1, status: 1 });
DuplicateCandidateSchema.index({ existingReferenceId: 1 });
DuplicateCandidateSchema.index({ duplicateReferenceId: 1 });

// Prevent duplicate pairs - compound unique index
// Ensures we don't create multiple duplicate candidates for the same reference pair
DuplicateCandidateSchema.index(
  {
    userId: 1,
    existingReferenceId: 1,
    duplicateReferenceId: 1
  },
  { unique: true }
);

export const DuplicateCandidate = mongoose.model<IDuplicateCandidate>('DuplicateCandidate', DuplicateCandidateSchema);
