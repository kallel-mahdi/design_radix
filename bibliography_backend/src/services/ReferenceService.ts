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

    const citationKey = this.generateCitationKey(data);

    const collectionIds = data.collectionIds
      ? data.collectionIds.map(id => new mongoose.Types.ObjectId(id))
      : [];

    const reference = await Reference.create({
      ...data,
      userId,
      citationKey,
      collectionIds,
      deleted: false,
      hasPdf: false
    });

    ApplicationLogger.info('Reference created', { userId, referenceId: reference._id.toString() });

    // Trigger duplicate detection asynchronously
    this.duplicateService.detectForReference(userId, reference._id.toString()).catch(error => {
      ApplicationLogger.error('Duplicate detection failed', error as Error);
    });

    return reference;
  }

  async getById(id: string, userId: string): Promise<IReference | null> {
    return Reference.findOne({ _id: id, userId });
  }

  async list(userId: string, filters: ReferenceFilters): Promise<IReference[]> {
    const query: any = { userId };

    if (filters.deleted !== undefined) {
      query.deleted = filters.deleted;
    } else {
      query.deleted = false;
    }

    if (filters.collectionId) {
      query.collectionIds = new mongoose.Types.ObjectId(filters.collectionId);
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    return Reference.find(query)
      .limit(filters.limit || 100)
      .skip(filters.offset || 0)
      .sort({ createdAt: -1 });
  }

  async update(id: string, userId: string, data: UpdateReferenceInput): Promise<IReference | null> {
    const updateData: any = { ...data };

    if (data.collectionIds) {
      updateData.collectionIds = data.collectionIds.map(id => new mongoose.Types.ObjectId(id));
    }

    return Reference.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );
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
      { $set: { deleted: false }, $unset: { deletedAt: 1 } }
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

  private generateCitationKey(data: CreateReferenceInput): string {
    const lastName = data.authors?.[0]?.family || 'unknown';
    const year = data.year || new Date().getFullYear();
    const titleWord = data.title.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'ref';

    const base = `${lastName}${year}${titleWord}`;
    const random = Math.random().toString(36).substring(2, 5);

    return `${base}${random}`;
  }
}
