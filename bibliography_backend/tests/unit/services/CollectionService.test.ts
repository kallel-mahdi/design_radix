import { CollectionService } from '../../../src/services/CollectionService';
import { Collection } from '../../../src/models/Collection';
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
});
