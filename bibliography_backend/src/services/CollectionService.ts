import { injectable } from 'inversify';
import { ICollectionService, CreateCollectionInput, UpdateCollectionInput } from '../interfaces/ICollectionService';
import { Collection, ICollection } from '../models/Collection';
import { ApplicationLogger } from '../utils/logger';
import mongoose from 'mongoose';

@injectable()
export class CollectionService implements ICollectionService {
  async create(userId: string, data: CreateCollectionInput): Promise<ICollection> {
    ApplicationLogger.info('Creating collection', { userId, name: data.name });

    // Validate depth: max 5 levels
    if (data.parentId) {
      const parentDepth = await this.calculateDepth(userId, data.parentId);
      if (parentDepth >= 5) {
        throw new Error('MAX_DEPTH_EXCEEDED: Collections can only be nested up to 5 levels deep');
      }
    }

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

    // Validate depth when moving collection to new parent
    if (data.parentId !== undefined) {
      // Prevent circular reference
      if (data.parentId === id) {
        throw new Error('CIRCULAR_REFERENCE: Collection cannot be its own parent');
      }

      // Check if new parent would exceed max depth
      if (data.parentId) {
        const parentDepth = await this.calculateDepth(userId, data.parentId);
        const collectionDepth = await this.calculateSubtreeDepth(userId, id);

        if (parentDepth + collectionDepth >= 5) {
          throw new Error('MAX_DEPTH_EXCEEDED: Moving this collection would exceed maximum depth of 5 levels');
        }
      }

      updateData.parentId = data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null;
    }

    return Collection.findOneAndUpdate(
      { _id: id, userId, deleted: false },
      { $set: updateData },
      { new: true }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    ApplicationLogger.info('Soft deleting collection with cascade', { userId, collectionId: id });

    // Find all descendants recursively
    const descendants = await this.findAllDescendants(userId, id);
    const idsToDelete = [new mongoose.Types.ObjectId(id), ...descendants.map(d => d._id)];

    // Soft delete all collections in one operation
    const result = await Collection.updateMany(
      { _id: { $in: idsToDelete }, userId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date() } }
    );

    if (result.modifiedCount > 0) {
      ApplicationLogger.info('Collection and descendants soft deleted', {
        userId,
        collectionId: id,
        deletedCount: result.modifiedCount
      });
      return true;
    }

    ApplicationLogger.warn('Collection not found for soft delete', { userId, collectionId: id });
    return false;
  }

  async restore(id: string, userId: string): Promise<ICollection | null> {
    ApplicationLogger.info('Restoring collection with cascade', { userId, collectionId: id });

    // Find all deleted descendants recursively
    const descendants = await this.findAllDeletedDescendants(userId, id);
    const idsToRestore = [new mongoose.Types.ObjectId(id), ...descendants.map(d => d._id)];

    // Restore all collections in one operation
    const result = await Collection.updateMany(
      { _id: { $in: idsToRestore }, userId, deleted: true },
      { $set: { deleted: false }, $unset: { deletedAt: 1 } }
    );

    // Return the root collection
    const collection = await Collection.findOne({ _id: id, userId, deleted: false });

    if (collection) {
      ApplicationLogger.info('Collection and descendants restored', {
        userId,
        collectionId: id,
        restoredCount: result.modifiedCount
      });
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

  /**
   * Recursively find all descendants of a collection
   */
  private async findAllDescendants(userId: string, parentId: string): Promise<any[]> {
    const children = await Collection.find({
      userId,
      parentId: new mongoose.Types.ObjectId(parentId),
      deleted: false
    });

    const allDescendants: any[] = [...children];

    // Recursively find descendants of each child
    for (const child of children) {
      const grandchildren = await this.findAllDescendants(userId, child._id.toString());
      allDescendants.push(...grandchildren);
    }

    return allDescendants;
  }

  /**
   * Recursively find all deleted descendants of a collection
   */
  private async findAllDeletedDescendants(userId: string, parentId: string): Promise<any[]> {
    const children = await Collection.find({
      userId,
      parentId: new mongoose.Types.ObjectId(parentId),
      deleted: true
    });

    const allDescendants: any[] = [...children];

    // Recursively find descendants of each child
    for (const child of children) {
      const grandchildren = await this.findAllDeletedDescendants(userId, child._id.toString());
      allDescendants.push(...grandchildren);
    }

    return allDescendants;
  }

  private async getNextPosition(userId: string, parentId: string | null): Promise<number> {
    const query: any = { userId, parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null };
    const maxPositionCollection = await Collection.findOne(query).sort({ position: -1 });
    return maxPositionCollection ? maxPositionCollection.position + 1 : 0;
  }

  /**
   * Calculate the depth of a collection (how many levels from root)
   * Root collections have depth 1
   */
  private async calculateDepth(userId: string, collectionId: string): Promise<number> {
    const collection = await Collection.findOne({ _id: collectionId, userId, deleted: false });

    if (!collection) {
      throw new Error('COLLECTION_NOT_FOUND: Collection does not exist');
    }

    if (!collection.parentId) {
      return 1; // Root level
    }

    // Recursively calculate parent depth
    return 1 + await this.calculateDepth(userId, collection.parentId.toString());
  }

  /**
   * Calculate the maximum depth of a subtree rooted at collectionId
   * (how many levels deep the deepest descendant is)
   */
  private async calculateSubtreeDepth(userId: string, collectionId: string): Promise<number> {
    const children = await Collection.find({
      userId,
      parentId: new mongoose.Types.ObjectId(collectionId),
      deleted: false
    });

    if (children.length === 0) {
      return 1; // Leaf node
    }

    // Recursively find max depth among children
    const childDepths = await Promise.all(
      children.map(child => this.calculateSubtreeDepth(userId, child._id.toString()))
    );

    return 1 + Math.max(...childDepths);
  }
}
