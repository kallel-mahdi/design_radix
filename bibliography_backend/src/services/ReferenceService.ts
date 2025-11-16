import { injectable, inject } from 'inversify';
import { IReferenceService, CreateReferenceInput, UpdateReferenceInput, ReferenceFilters } from '../interfaces/IReferenceService';
import { IDuplicateService } from '../interfaces/IDuplicateService';
import { Reference, IReference } from '../models/Reference';
import { ApplicationLogger } from '../utils/logger';
import { TYPES } from '../config/types';
import mongoose from 'mongoose';

@injectable()
export class ReferenceService implements IReferenceService {
  constructor(
    @inject(TYPES.IDuplicateService) private duplicateService: IDuplicateService
  ) {}

  async create(userId: string, data: CreateReferenceInput): Promise<IReference> {
    ApplicationLogger.info('Creating reference', { userId, title: data.title });

    // Normalize DOI to lowercase for consistent duplicate detection
    // Prevents duplicate creation due to case differences (e.g., "10.1145/ABC" vs "10.1145/abc")
    const normalizedDoi = data.doi ? data.doi.trim().toLowerCase() : undefined;

    // Normalize authors: auto-generate 'full' if not provided
    const authors = data.authors?.map(a => {
      // If full name is explicitly provided, use it as-is
      if (a.full) {
        return {
          given: a.given || '',
          family: a.family || '',
          full: a.full
        };
      }

      // Otherwise auto-generate from given/family
      // Pattern: "Family, Given" or just "Family" or just "Given"
      const fullName = [a.family || '', a.given || '']
        .filter(Boolean)
        .join(', ')
        .trim();

      return {
        given: a.given || '',
        family: a.family || '',
        full: fullName || 'Unknown Author' // Fallback if both are empty
      };
    }) || [];

    // Generate unique citation key
    const citationKey = await this.generateCitationKey(userId, data);

    const collectionIds = data.collectionIds
      ? data.collectionIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (error) {
            throw new Error(`Invalid collectionId format: ${id}`);
          }
        })
      : [];

    const reference = await Reference.create({
      ...data,
      doi: normalizedDoi,
      userId,
      authors,
      citationKey,
      collectionIds,
      deleted: false,
      hasPdf: false
    });

    ApplicationLogger.info('Reference created', { userId, referenceId: reference._id.toString(), citationKey });

    // Trigger duplicate detection asynchronously
    this.duplicateService.detectForReference(userId, reference._id.toString()).catch(error => {
      ApplicationLogger.error('Duplicate detection failed', error as Error);
    });

    return reference;
  }

  async getById(id: string, userId: string): Promise<IReference | null> {
    // Session 9: Populate virtual 'collections' field for DetailsPane enhancement
    // This keeps collectionIds as string[] and adds collections as Collection[]
    return Reference.findOne({ _id: id, userId }).populate('collections');
  }

  async list(userId: string, filters: ReferenceFilters): Promise<{ references: IReference[]; total: number }> {
    const query: any = { userId };

    if (filters.deleted !== undefined) {
      query.deleted = filters.deleted;
    } else {
      query.deleted = false;
    }

    if (filters.collectionId) {
      try {
        query.collectionIds = new mongoose.Types.ObjectId(filters.collectionId);
      } catch (error) {
        throw new Error(`Invalid collectionId format: ${filters.collectionId}`);
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const [references, total] = await Promise.all([
      Reference.find(query)
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 })
        .exec(),
      Reference.countDocuments(query)
    ]);

    return { references, total };
  }

  async update(id: string, userId: string, data: UpdateReferenceInput): Promise<IReference | null> {
    // Track which fields changed that affect duplicate detection
    const fieldsAffectingDuplicates = ['title', 'authors', 'doi', 'isbn'];
    const changedFields = Object.keys(data).filter(key =>
      fieldsAffectingDuplicates.includes(key)
    );

    const updateData: any = { ...data };

    // Normalize DOI to lowercase if being updated
    // Ensures consistency with create() method and prevents case-sensitive duplicates
    if (data.doi) {
      updateData.doi = data.doi.trim().toLowerCase();
    }

    // If authors updated, normalize full names (auto-generate if not provided)
    if (data.authors) {
      updateData.authors = data.authors.map(a => {
        // If full name is explicitly provided, use it as-is
        if (a.full) {
          return {
            given: a.given || '',
            family: a.family || '',
            full: a.full
          };
        }

        // Otherwise auto-generate from given/family
        // Pattern: "Family, Given" or just "Family" or just "Given"
        const fullName = [a.family || '', a.given || '']
          .filter(Boolean)
          .join(', ')
          .trim();

        return {
          given: a.given || '',
          family: a.family || '',
          full: fullName || 'Unknown Author'
        };
      });
    }

    if (data.collectionIds) {
      updateData.collectionIds = data.collectionIds.map(id => new mongoose.Types.ObjectId(id));
    }

    const reference = await Reference.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );

    if (!reference) {
      return null;
    }

    ApplicationLogger.info('Reference updated', { userId, referenceId: id });

    // If duplicate-relevant fields changed, re-run detection asynchronously
    if (changedFields.length > 0) {
      // Trigger duplicate detection asynchronously (don't await)
      this.duplicateService.detectForReference(userId, id).catch(err => {
        ApplicationLogger.error('Background duplicate detection failed', err, {
          referenceId: id,
          userId
        });
      });
    }

    return reference;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await Reference.updateOne(
      { _id: id, userId },
      { $set: { deleted: true, deletedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async restore(id: string, userId: string): Promise<boolean> {
    const result = await Reference.updateOne(
      { _id: id, userId, deleted: true },
      { $set: { deleted: false, deletedAt: null } }
    );
    return result.modifiedCount > 0;
  }

  async permanentDelete(id: string, userId: string): Promise<boolean> {
    const result = await Reference.deleteOne({ _id: id, userId, deleted: true });
    return result.deletedCount > 0;
  }

  async attachPdf(id: string, userId: string, pdfData: {
    storedPath: string;
    originalName: string;
    size: number;
    mimeType: string;
  }): Promise<IReference | null> {
    return Reference.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          hasPdf: true,
          pdf: {
            ...pdfData,
            uploadedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }

  async detachPdf(id: string, userId: string): Promise<IReference | null> {
    return Reference.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: { hasPdf: false },
        $unset: { pdf: 1 }
      },
      { new: true }
    );
  }

  private async generateCitationKey(userId: string, data: CreateReferenceInput): Promise<string> {
    const lastName = data.authors?.[0]?.family || 'unknown';
    const year = data.year || new Date().getFullYear();
    const titleWords = data.title.toLowerCase().split(/\s+/);
    const firstWord = titleWords.find(w => w.length > 2 && !['the', 'and', 'for'].includes(w)) || titleWords[0] || 'paper';

    // Generate random 3-char suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 5);
    const key = `${lastName}${year}${firstWord}${suffix}`.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check uniqueness (scoped by userId)
    const existing = await Reference.findOne({ userId, citationKey: key });
    if (existing) {
      return this.generateCitationKey(userId, data);
    }

    return key;
  }
}
