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
      position
    });

    ApplicationLogger.info('Collection created', { userId, collectionId: collection._id.toString() });
    return collection;
  }

  async getById(id: string, userId: string): Promise<ICollection | null> {
    return Collection.findOne({ _id: id, userId });
  }

  async list(userId: string): Promise<ICollection[]> {
    return Collection.find({ userId }).sort({ parentId: 1, position: 1 });
  }

  async update(id: string, userId: string, data: UpdateCollectionInput): Promise<ICollection | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null;
    }

    return Collection.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await Collection.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  private async getNextPosition(userId: string, parentId: string | null): Promise<number> {
    const query: any = { userId, parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null };
    const maxPositionCollection = await Collection.findOne(query).sort({ position: -1 });
    return maxPositionCollection ? maxPositionCollection.position + 1 : 0;
  }
}
