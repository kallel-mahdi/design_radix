/**
 * Annotation Model - Zotero-inspired PDF annotations
 *
 * Stores highlight and note annotations for PDF references.
 * Follows Zotero's JSON-based storage pattern (not embedded in PDF).
 *
 * Reference: zotero/chrome/content/zotero/xpcom/data/annotations.js
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnotation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  referenceId: mongoose.Types.ObjectId;
  type: 'highlight' | 'note';
  pageIndex: number; // 0-based page index
  position: {
    rects: Array<[number, number, number, number]>; // [x1, y1, x2, y2]
  };
  content: {
    text?: string; // Highlighted text (extracted from PDF)
    comment?: string; // User's note/comment
  };
  color: string; // Hex color
  sortIndex: string; // Zotero-style: "XXXXX|YYYYY|ZZZZZ"
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    referenceId: { type: Schema.Types.ObjectId, ref: 'Reference', required: true, index: true },
    type: {
      type: String,
      enum: ['highlight', 'note'],
      required: true,
    },
    pageIndex: { type: Number, required: true, min: 0 },
    position: {
      rects: {
        type: [[Number]],
        required: true,
      },
    },
    content: {
      text: { type: String },
      comment: { type: String },
    },
    color: { type: String, required: true },
    sortIndex: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for efficient querying
AnnotationSchema.index({ userId: 1, referenceId: 1 });
AnnotationSchema.index({ referenceId: 1, pageIndex: 1 });
AnnotationSchema.index({ referenceId: 1, sortIndex: 1 });

export const Annotation = mongoose.model<IAnnotation>('Annotation', AnnotationSchema);
