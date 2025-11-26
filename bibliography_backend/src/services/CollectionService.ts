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

  /**
   * Get all descendant collection IDs (including the collection itself)
   * Used for recursive filtering: when a parent collection is selected,
   * show references from all child collections too
   *
   * @param userId - User ID for ownership verification
   * @param collectionId - The parent collection ID
   * @returns Array of collection IDs (parent + all descendants)
   */
  async getAllDescendantIds(userId: string, collectionId: string): Promise<string[]> {
    const descendants: string[] = [collectionId]; // Include self

    const result = await Collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(collectionId), userId, deleted: false } },
      {
        $graphLookup: {
          from: 'collections',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          maxDepth: 5,
          restrictSearchWithMatch: { userId, deleted: false }
        }
      },
      { $unwind: { path: '$descendants', preserveNullAndEmptyArrays: true } },
      { $replaceRoot: { newRoot: { $ifNull: ['$descendants', { _id: null }] } } },
      { $match: { _id: { $ne: null } } }
    ]);

    // Add descendant IDs to result array
    for (const doc of result) {
      descendants.push(doc._id.toString());
    }

    return descendants;
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
   * Find all descendants of a collection using $graphLookup
   * PERF: Single aggregation query instead of recursive N+1 queries
   */
  private async findAllDescendants(userId: string, parentId: string): Promise<ICollection[]> {
    const result = await Collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(parentId), userId, deleted: false } },
      {
        $graphLookup: {
          from: 'collections',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          maxDepth: 5,
          restrictSearchWithMatch: { userId, deleted: false }
        }
      },
      { $unwind: { path: '$descendants', preserveNullAndEmptyArrays: true } },
      { $replaceRoot: { newRoot: { $ifNull: ['$descendants', { _id: null }] } } },
      { $match: { _id: { $ne: null } } }
    ]);
    return result;
  }

  /**
   * Find all deleted descendants of a collection using $graphLookup
   * PERF: Single aggregation query instead of recursive N+1 queries
   */
  private async findAllDeletedDescendants(userId: string, parentId: string): Promise<ICollection[]> {
    const result = await Collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(parentId), userId, deleted: true } },
      {
        $graphLookup: {
          from: 'collections',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          maxDepth: 5,
          restrictSearchWithMatch: { userId, deleted: true }
        }
      },
      { $unwind: { path: '$descendants', preserveNullAndEmptyArrays: true } },
      { $replaceRoot: { newRoot: { $ifNull: ['$descendants', { _id: null }] } } },
      { $match: { _id: { $ne: null } } }
    ]);
    return result;
  }

  private async getNextPosition(userId: string, parentId: string | null): Promise<number> {
    const query: any = { userId, parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null };
    const maxPositionCollection = await Collection.findOne(query).sort({ position: -1 });
    return maxPositionCollection ? maxPositionCollection.position + 1 : 0;
  }

  /**
   * Calculate the depth of a collection (how many levels from root)
   * Root collections have depth 1
   * PERF: Uses $graphLookup to traverse ancestors in one query
   */
  private async calculateDepth(userId: string, collectionId: string): Promise<number> {
    const result = await Collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(collectionId), userId, deleted: false } },
      {
        $graphLookup: {
          from: 'collections',
          startWith: '$parentId',
          connectFromField: 'parentId',
          connectToField: '_id',
          as: 'ancestors',
          maxDepth: 5,
          restrictSearchWithMatch: { userId, deleted: false }
        }
      },
      { $project: { depth: { $add: [{ $size: '$ancestors' }, 1] } } }
    ]);

    if (result.length === 0) {
      throw new Error('COLLECTION_NOT_FOUND: Collection does not exist');
    }

    return result[0].depth;
  }

  /**
   * Calculate the maximum depth of a subtree rooted at collectionId
   * (how many levels deep the deepest descendant is)
   * PERF: Uses $graphLookup with depthField to find max depth in one query
   */
  private async calculateSubtreeDepth(userId: string, collectionId: string): Promise<number> {
    const result = await Collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(collectionId), userId, deleted: false } },
      {
        $graphLookup: {
          from: 'collections',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          maxDepth: 5,
          depthField: 'level',
          restrictSearchWithMatch: { userId, deleted: false }
        }
      },
      {
        $project: {
          maxDepth: {
            $cond: {
              if: { $eq: [{ $size: '$descendants' }, 0] },
              then: 1,
              else: { $add: [{ $max: '$descendants.level' }, 2] }
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return 1; // Collection doesn't exist or is deleted
    }

    return result[0].maxDepth;
  }
}
