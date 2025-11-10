import { CollectionService } from '../../../src/services/CollectionService';
import { Collection } from '../../../src/models/Collection';
import { Reference } from '../../../src/models/Reference';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../../utils/mongoMemoryServer';

describe('CollectionService Unit Tests', () => {
  let service: CollectionService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    service = new CollectionService();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('create', () => {
    it('should create a collection with position 0 when first', async () => {
      const collection = await service.create('user-123', { name: 'First Collection' });

      expect(collection.name).toBe('First Collection');
      expect(collection.userId).toBe('user-123');
      expect(collection.position).toBe(0);
      expect(collection.parentId).toBe(null);
    });

    it('should increment position for subsequent collections', async () => {
      await service.create('user-123', { name: 'Collection 1' });
      const collection2 = await service.create('user-123', { name: 'Collection 2' });

      expect(collection2.position).toBe(1);
    });

    it('should create nested collection with correct position', async () => {
      const parent = await service.create('user-123', { name: 'Parent' });
      const child = await service.create('user-123', {
        name: 'Child',
        parentId: parent._id.toString(),
      });

      expect(child.parentId?.toString()).toBe(parent._id.toString());
      expect(child.position).toBe(0); // First child
    });

    it('should create multiple children with incremented positions', async () => {
      const parent = await service.create('user-123', { name: 'Parent' });
      const parentId = parent._id.toString();

      const child1 = await service.create('user-123', { name: 'Child 1', parentId });
      const child2 = await service.create('user-123', { name: 'Child 2', parentId });

      expect(child1.position).toBe(0);
      expect(child2.position).toBe(1);
    });
  });

  describe('depth validation', () => {
    it('should allow creating collection at depth 1 (root)', async () => {
      const collection = await service.create('user-123', { name: 'Root Collection' });

      expect(collection.name).toBe('Root Collection');
      expect(collection.parentId).toBe(null);
    });

    it('should allow creating collection at depth 5 (maximum)', async () => {
      // Create nested structure: Level 1 -> 2 -> 3 -> 4
      const level1 = await service.create('user-123', { name: 'Level 1' });
      const level2 = await service.create('user-123', {
        name: 'Level 2',
        parentId: level1._id.toString()
      });
      const level3 = await service.create('user-123', {
        name: 'Level 3',
        parentId: level2._id.toString()
      });
      const level4 = await service.create('user-123', {
        name: 'Level 4',
        parentId: level3._id.toString()
      });

      // This should succeed (depth 5)
      const level5 = await service.create('user-123', {
        name: 'Level 5',
        parentId: level4._id.toString()
      });

      expect(level5.name).toBe('Level 5');
      expect(level5.parentId?.toString()).toBe(level4._id.toString());
    });

    it('should reject creating collection at depth 6', async () => {
      // Create nested structure: Level 1 -> 2 -> 3 -> 4 -> 5
      const level1 = await service.create('user-123', { name: 'Level 1' });
      const level2 = await service.create('user-123', {
        name: 'Level 2',
        parentId: level1._id.toString()
      });
      const level3 = await service.create('user-123', {
        name: 'Level 3',
        parentId: level2._id.toString()
      });
      const level4 = await service.create('user-123', {
        name: 'Level 4',
        parentId: level3._id.toString()
      });
      const level5 = await service.create('user-123', {
        name: 'Level 5',
        parentId: level4._id.toString()
      });

      // This should fail (would be depth 6)
      await expect(
        service.create('user-123', {
          name: 'Level 6',
          parentId: level5._id.toString()
        })
      ).rejects.toThrow('MAX_DEPTH_EXCEEDED');
    });

    it('should reject moving collection if it would exceed max depth', async () => {
      // Create structure: Parent at depth 4, Child with 2-level subtree
      const level1 = await service.create('user-123', { name: 'Level 1' });
      const level2 = await service.create('user-123', {
        name: 'Level 2',
        parentId: level1._id.toString()
      });
      const level3 = await service.create('user-123', {
        name: 'Level 3',
        parentId: level2._id.toString()
      });
      const level4 = await service.create('user-123', {
        name: 'Level 4',
        parentId: level3._id.toString()
      });

      // Create separate branch with children
      const branchRoot = await service.create('user-123', { name: 'Branch Root' });
      const branchChild = await service.create('user-123', {
        name: 'Branch Child',
        parentId: branchRoot._id.toString()
      });

      // Try to move branchRoot under level4 (would make branchChild depth 6)
      await expect(
        service.update(branchRoot._id.toString(), 'user-123', {
          parentId: level4._id.toString()
        })
      ).rejects.toThrow('MAX_DEPTH_EXCEEDED');
    });
  });

  describe('getById', () => {
    it('should get collection by id', async () => {
      const created = await service.create('user-123', { name: 'Test Collection' });
      const collection = await service.getById(created._id.toString(), 'user-123');

      expect(collection).toBeDefined();
      expect(collection?.name).toBe('Test Collection');
    });

    it('should return null for non-existent collection', async () => {
      const collection = await service.getById('507f1f77bcf86cd799439011', 'user-123');

      expect(collection).toBe(null);
    });

    it('should return null for wrong user', async () => {
      const created = await service.create('user-123', { name: 'Test Collection' });
      const collection = await service.getById(created._id.toString(), 'user-456');

      expect(collection).toBe(null);
    });
  });

  describe('list', () => {
    it('should list all collections for user', async () => {
      await service.create('user-123', { name: 'Collection 1' });
      await service.create('user-123', { name: 'Collection 2' });
      await service.create('user-456', { name: 'Other User Collection' });

      const collections = await service.list('user-123');

      expect(collections).toHaveLength(2);
      expect(collections.map(c => c.name)).toContain('Collection 1');
      expect(collections.map(c => c.name)).toContain('Collection 2');
    });

    it('should return empty array when no collections', async () => {
      const collections = await service.list('user-123');

      expect(collections).toEqual([]);
    });

    it('should sort collections by position', async () => {
      const col1 = await service.create('user-123', { name: 'Collection 1' });
      const col2 = await service.create('user-123', { name: 'Collection 2' });

      // Manually update positions in reverse
      await Collection.updateOne({ _id: col1._id }, { position: 5 });
      await Collection.updateOne({ _id: col2._id }, { position: 2 });

      const collections = await service.list('user-123');

      expect(collections[0].position).toBe(2);
      expect(collections[1].position).toBe(5);
    });
  });

  describe('update', () => {
    it('should update collection name', async () => {
      const created = await service.create('user-123', { name: 'Original Name' });
      const updated = await service.update(created._id.toString(), 'user-123', {
        name: 'Updated Name',
      });

      expect(updated?.name).toBe('Updated Name');
    });

    it('should update collection position', async () => {
      const created = await service.create('user-123', { name: 'Test' });
      const updated = await service.update(created._id.toString(), 'user-123', {
        position: 10,
      });

      expect(updated?.position).toBe(10);
    });

    it('should update parent id', async () => {
      const parent = await service.create('user-123', { name: 'Parent' });
      const child = await service.create('user-123', { name: 'Child' });

      const updated = await service.update(child._id.toString(), 'user-123', {
        parentId: parent._id.toString(),
      });

      expect(updated?.parentId?.toString()).toBe(parent._id.toString());
    });

    it('should return null for non-existent collection', async () => {
      const updated = await service.update('507f1f77bcf86cd799439011', 'user-123', {
        name: 'New Name',
      });

      expect(updated).toBe(null);
    });

    it('should return null for wrong user', async () => {
      const created = await service.create('user-123', { name: 'Test' });
      const updated = await service.update(created._id.toString(), 'user-456', {
        name: 'New Name',
      });

      expect(updated).toBe(null);
    });

    it('should prevent collection from being its own parent', async () => {
      const collection = await service.create('user-123', { name: 'Self Reference Test' });

      await expect(
        service.update(collection._id.toString(), 'user-123', {
          parentId: collection._id.toString()
        })
      ).rejects.toThrow('CIRCULAR_REFERENCE');
    });

    it('should prevent circular reference through descendants', async () => {
      // Create chain: A -> B -> C
      const collectionA = await service.create('user-123', { name: 'Collection A' });
      const collectionB = await service.create('user-123', {
        name: 'Collection B',
        parentId: collectionA._id.toString()
      });
      const collectionC = await service.create('user-123', {
        name: 'Collection C',
        parentId: collectionB._id.toString()
      });

      // Try to make A a child of C (would create A -> B -> C -> A)
      // This test documents expected behavior - implementation may need enhancement
      await expect(
        service.update(collectionA._id.toString(), 'user-123', {
          parentId: collectionC._id.toString()
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a collection', async () => {
      const created = await service.create('user-123', { name: 'To Delete' });
      const deleted = await service.delete(created._id.toString(), 'user-123');

      expect(deleted).toBe(true);

      const found = await service.getById(created._id.toString(), 'user-123');
      expect(found).toBe(null);
    });

    it('should return false for non-existent collection', async () => {
      const deleted = await service.delete('507f1f77bcf86cd799439011', 'user-123');

      expect(deleted).toBe(false);
    });

    it('should return false for wrong user', async () => {
      const created = await service.create('user-123', { name: 'Test' });
      const deleted = await service.delete(created._id.toString(), 'user-456');

      expect(deleted).toBe(false);
    });
  });

  describe('cascade delete', () => {
    it('should soft delete parent and all descendants', async () => {
      // Create tree: Parent -> Child1, Child2 -> Grandchild
      const parent = await service.create('user-123', { name: 'Parent' });
      const child1 = await service.create('user-123', {
        name: 'Child 1',
        parentId: parent._id.toString()
      });
      const child2 = await service.create('user-123', {
        name: 'Child 2',
        parentId: parent._id.toString()
      });
      const grandchild = await service.create('user-123', {
        name: 'Grandchild',
        parentId: child2._id.toString()
      });

      // Delete parent
      const deleted = await service.delete(parent._id.toString(), 'user-123');
      expect(deleted).toBe(true);

      // Verify all are soft deleted (not in regular list)
      const collections = await service.list('user-123');
      expect(collections).toHaveLength(0);

      // Verify all exist with deleted flag
      const allCollections = await service.list('user-123', true);
      expect(allCollections).toHaveLength(4);
      expect(allCollections.every(c => c.deleted)).toBe(true);
    });

    it('should delete only specified subtree', async () => {
      // Create two separate trees
      const parent1 = await service.create('user-123', { name: 'Parent 1' });
      const child1 = await service.create('user-123', {
        name: 'Child 1',
        parentId: parent1._id.toString()
      });

      const parent2 = await service.create('user-123', { name: 'Parent 2' });
      const child2 = await service.create('user-123', {
        name: 'Child 2',
        parentId: parent2._id.toString()
      });

      // Delete first tree
      await service.delete(parent1._id.toString(), 'user-123');

      // Verify second tree still exists
      const remaining = await service.list('user-123');
      expect(remaining).toHaveLength(2);
      expect(remaining.map(c => c.name)).toContain('Parent 2');
      expect(remaining.map(c => c.name)).toContain('Child 2');
    });
  });

  describe('cascade restore', () => {
    it('should restore parent and all descendants', async () => {
      // Create tree: Parent -> Child -> Grandchild
      const parent = await service.create('user-123', { name: 'Parent' });
      const child = await service.create('user-123', {
        name: 'Child',
        parentId: parent._id.toString()
      });
      const grandchild = await service.create('user-123', {
        name: 'Grandchild',
        parentId: child._id.toString()
      });

      // Delete parent (cascade deletes all)
      await service.delete(parent._id.toString(), 'user-123');

      // Verify all deleted
      expect(await service.list('user-123')).toHaveLength(0);

      // Restore parent
      const restored = await service.restore(parent._id.toString(), 'user-123');
      expect(restored).not.toBe(null);

      // Verify all restored
      const collections = await service.list('user-123');
      expect(collections).toHaveLength(3);
      expect(collections.map(c => c.name)).toContain('Parent');
      expect(collections.map(c => c.name)).toContain('Child');
      expect(collections.map(c => c.name)).toContain('Grandchild');
    });

    it('should return null when restoring non-existent collection', async () => {
      const restored = await service.restore('507f1f77bcf86cd799439011', 'user-123');
      expect(restored).toBe(null);
    });
  });
});
