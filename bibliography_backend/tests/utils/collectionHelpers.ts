import { Collection } from '../../src/models/Collection';
import mongoose from 'mongoose';

/**
 * Create a collection hierarchy with specified depth
 * Returns array of collection IDs from root to deepest level
 */
export async function createCollectionHierarchy(
  userId: string,
  depth: number,
  baseName: string = 'Level'
): Promise<string[]> {
  const ids: string[] = [];
  let parentId: string | null = null;

  for (let i = 1; i <= depth; i++) {
    const collection = await Collection.create({
      userId,
      name: `${baseName} ${i}`,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      position: 0,
      deleted: false
    });
    ids.push(collection._id.toString());
    parentId = collection._id.toString();
  }

  return ids;
}

/**
 * Create multiple child collections under a parent
 */
export async function createChildCollections(
  userId: string,
  parentId: string | null,
  count: number,
  baseName: string = 'Child'
): Promise<string[]> {
  const ids: string[] = [];

  for (let i = 1; i <= count; i++) {
    const collection = await Collection.create({
      userId,
      name: `${baseName} ${i}`,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      position: i - 1,
      deleted: false
    });
    ids.push(collection._id.toString());
  }

  return ids;
}
