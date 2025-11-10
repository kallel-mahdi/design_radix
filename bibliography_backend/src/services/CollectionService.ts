import { injectable } from 'inversify';
import { ICollectionService, CreateCollectionInput, UpdateCollectionInput } from '../interfaces/ICollectionService';
import { Collection, ICollection } from '../models/Collection';
import { ApplicationLogger } from '../utils/logger';
import mongoose from 'mongoose';

@injectable()
export class CollectionService implements ICollectionService {
  async create(userId: string, data: CreateCollectionInput): Promise<ICollection> {
    ApplicationLogger.info('Creating collection', { userId, name: data.name });

    const position = await this.getNextPosition(userId, data.parentId || null);

    const collection = await Collection.create({
      userId,
      name: data.name,
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null,
      color: data.color || null,
      position
    });

    ApplicationLogger.info('Collection created', { userId, collectionId: collection._id.toString() });
    return collection;
  }

  async getById(id: string, userId: string): Promise<ICollection | null> {
    return Collection.findOne({ _id: id, userId, deleted: false });
  }

  async list(userId: string, includeDeleted: boolean = false): Promise<ICollection[]> {
    const query: any = { userId };
    if (!includeDeleted) {
      query.deleted = false;
    }
    return Collection.find(query).sort({ parentId: 1, position: 1 });
  }

  async update(id: string, userId: string, data: UpdateCollectionInput): Promise<ICollection | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null;
    }

    return Collection.findOneAndUpdate(
      { _id: id, userId, deleted: false },
      { $set: updateData },
      { new: true }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    ApplicationLogger.info('Soft deleting collection', { userId, collectionId: id });

    const result = await Collection.findOneAndUpdate(
      { _id: id, userId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (result) {
      ApplicationLogger.info('Collection soft deleted', { userId, collectionId: id });
      return true;
    }

    ApplicationLogger.warn('Collection not found for soft delete', { userId, collectionId: id });
    return false;
  }

  async restore(id: string, userId: string): Promise<ICollection | null> {
    ApplicationLogger.info('Restoring collection', { userId, collectionId: id });

    const collection = await Collection.findOneAndUpdate(
      { _id: id, userId, deleted: true },
      { $set: { deleted: false }, $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (collection) {
      ApplicationLogger.info('Collection restored', { userId, collectionId: id });
    } else {
      ApplicationLogger.warn('Collection not found for restore', { userId, collectionId: id });
    }

    return collection;
  }

  async permanentDelete(id: string, userId: string): Promise<boolean> {
    ApplicationLogger.warn('Permanently deleting collection', { userId, collectionId: id });

    const result = await Collection.deleteOne({ _id: id, userId });

    if (result.deletedCount > 0) {
      ApplicationLogger.info('Collection permanently deleted', { userId, collectionId: id });
      return true;
    }

    ApplicationLogger.warn('Collection not found for permanent delete', { userId, collectionId: id });
    return false;
  }

  private async getNextPosition(userId: string, parentId: string | null): Promise<number> {
    const query: any = { userId, parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null };
    const maxPositionCollection = await Collection.findOne(query).sort({ position: -1 });
    return maxPositionCollection ? maxPositionCollection.position + 1 : 0;
  }
}
