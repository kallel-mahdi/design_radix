import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectLink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  projectId: string;
  referenceId?: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProjectLinkSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    referenceId: { type: Schema.Types.ObjectId, ref: 'Reference' },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Validation: Exactly one of referenceId or collectionId must be set
ProjectLinkSchema.pre('save', function(next) {
  const hasRef = !!this.referenceId;
  const hasColl = !!this.collectionId;

  if (hasRef === hasColl) {
    next(new Error('ProjectLink must have exactly one of referenceId or collectionId'));
  } else {
    next();
  }
});

// CRITICAL INDEXES
ProjectLinkSchema.index({ userId: 1, projectId: 1 });
ProjectLinkSchema.index({ referenceId: 1 });
ProjectLinkSchema.index({ collectionId: 1 });
ProjectLinkSchema.index({ userId: 1, projectId: 1, referenceId: 1 }, { unique: true, sparse: true });
ProjectLinkSchema.index({ userId: 1, projectId: 1, collectionId: 1 }, { unique: true, sparse: true });

export const ProjectLink = mongoose.model<IProjectLink>('ProjectLink', ProjectLinkSchema);
