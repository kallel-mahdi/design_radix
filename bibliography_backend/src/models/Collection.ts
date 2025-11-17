import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  position: number;
  color?: string | null;
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Collection', default: null },
    position: { type: Number, required: true, default: 0 },
    color: { type: String, default: null },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

// CRITICAL INDEXES
CollectionSchema.index({ userId: 1, deleted: 1 });
CollectionSchema.index({ userId: 1, parentId: 1, position: 1 });
CollectionSchema.index({ userId: 1, name: 1 });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
