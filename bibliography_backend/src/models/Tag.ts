import mongoose, { Schema, Document } from 'mongoose';

// CRITICAL: Updated schema with color, position, automatic, updatedAt fields

export interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  color: string | null;
  position: number | null;
  automatic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: null },
    position: { type: Number, default: null, min: 1, max: 9 },
    automatic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// CRITICAL: Compound unique index
TagSchema.index({ userId: 1, name: 1 }, { unique: true });
TagSchema.index({ userId: 1, color: 1 });

export const Tag = mongoose.model<ITag>('Tag', TagSchema);
