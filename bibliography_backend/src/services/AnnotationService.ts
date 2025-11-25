/**
 * AnnotationService - PDF annotation business logic
 *
 * Handles CRUD operations for Zotero-style PDF annotations.
 * Annotations are stored in MongoDB (not embedded in PDF).
 */
import { injectable } from 'inversify';
import { IAnnotationService, CreateAnnotationInput, UpdateAnnotationInput } from '../interfaces/IAnnotationService';
import { Annotation, IAnnotation } from '../models/Annotation';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class AnnotationService implements IAnnotationService {
  /**
   * Generate Zotero-style sortIndex
   *
   * Format: "XXXXX|YYYYY|ZZZZZ"
   * - XXXXX: Page number (5 digits, zero-padded)
   * - YYYYY: Y position from top (5 digits, zero-padded)
   * - ZZZZZ: Character offset within page (5 digits, zero-padded)
   *
   * Reference: zotero/chrome/content/zotero/xpcom/data/annotations.js:getSortIndex()
   */
  private generateSortIndex(pageIndex: number, position: { rects: Array<[number, number, number, number]> }): string {
    // Get the first rect's y-coordinate (top of highlight)
    const firstRect = position.rects[0];
    const yPosition = firstRect ? Math.round(firstRect[1]) : 0;

    // Character offset is estimated from x position
    const xPosition = firstRect ? Math.round(firstRect[0]) : 0;

    // Format as 5-digit zero-padded strings
    const pageStr = String(pageIndex).padStart(5, '0');
    const yStr = String(yPosition).padStart(5, '0');
    const xStr = String(xPosition).padStart(5, '0');

    return `${pageStr}|${yStr}|${xStr}`;
  }

  async create(userId: string, referenceId: string, data: CreateAnnotationInput): Promise<IAnnotation> {
    ApplicationLogger.info('Creating annotation', {
      userId,
      referenceId,
      type: data.type,
      pageIndex: data.pageIndex,
    });

    // Generate sortIndex if not provided
    const sortIndex = data.sortIndex || this.generateSortIndex(data.pageIndex, data.position);

    const annotation = await Annotation.create({
      userId,
      referenceId,
      type: data.type,
      pageIndex: data.pageIndex,
      position: data.position,
      content: data.content,
      color: data.color,
      sortIndex,
    });

    ApplicationLogger.info('Annotation created', {
      userId,
      annotationId: annotation._id.toString(),
    });

    return annotation;
  }

  async getById(id: string, userId: string): Promise<IAnnotation | null> {
    return Annotation.findOne({ _id: id, userId });
  }

  async listByReference(referenceId: string, userId: string): Promise<IAnnotation[]> {
    return Annotation.find({ referenceId, userId }).sort({ sortIndex: 1 });
  }

  async update(id: string, userId: string, data: UpdateAnnotationInput): Promise<IAnnotation | null> {
    ApplicationLogger.info('Updating annotation', { userId, annotationId: id });

    const updateData: Record<string, any> = {};

    if (data.content) {
      updateData.content = data.content;
    }
    if (data.color) {
      updateData.color = data.color;
    }

    const annotation = await Annotation.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );

    if (annotation) {
      ApplicationLogger.info('Annotation updated', { userId, annotationId: id });
    }

    return annotation;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    ApplicationLogger.info('Deleting annotation', { userId, annotationId: id });

    const result = await Annotation.deleteOne({ _id: id, userId });
    const success = result.deletedCount > 0;

    if (success) {
      ApplicationLogger.info('Annotation deleted', { userId, annotationId: id });
    }

    return success;
  }

  async deleteByReference(referenceId: string, userId: string): Promise<number> {
    ApplicationLogger.info('Deleting all annotations for reference', { userId, referenceId });

    const result = await Annotation.deleteMany({ referenceId, userId });

    ApplicationLogger.info('Annotations deleted', {
      userId,
      referenceId,
      deletedCount: result.deletedCount,
    });

    return result.deletedCount;
  }
}
