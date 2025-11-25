import { TagService } from '../../../src/services/TagService';
import { Tag } from '../../../src/models/Tag';
import { Reference } from '../../../src/models/Reference';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../../utils/mongoMemoryServer';

describe('TagService Unit Tests', () => {
  let service: TagService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    service = new TagService();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('create', () => {
    it('should create a tag with name only', async () => {
      const tag = await service.create('user-123', { name: 'machine-learning' });

      expect(tag.name).toBe('machine-learning');
      expect(tag.userId).toBe('user-123');
      expect(tag.color).toBe(null);
      expect(tag.position).toBe(null);
      expect(tag.automatic).toBe(false);
    });

    it('should create a colored tag', async () => {
      const tag = await service.create('user-123', {
        name: 'important',
        color: '#FF0000',
        position: 1,
      });

      expect(tag.color).toBe('#FF0000');
      expect(tag.position).toBe(1);
    });
  });

  describe('getById', () => {
    it('should get tag by id', async () => {
      const created = await service.create('user-123', { name: 'test-tag' });
      const tag = await service.getById(created._id.toString(), 'user-123');

      expect(tag).toBeDefined();
      expect(tag?.name).toBe('test-tag');
    });

    it('should return null for non-existent tag', async () => {
      const tag = await service.getById('507f1f77bcf86cd799439011', 'user-123');

      expect(tag).toBe(null);
    });

    it('should return null for wrong user', async () => {
      const created = await service.create('user-123', { name: 'test-tag' });
      const tag = await service.getById(created._id.toString(), 'user-456');

      expect(tag).toBe(null);
    });
  });

  describe('getByName', () => {
    it('should get tag by name', async () => {
      await service.create('user-123', { name: 'my-tag' });
      const tag = await service.getByName('my-tag', 'user-123');

      expect(tag).toBeDefined();
      expect(tag?.name).toBe('my-tag');
    });

    it('should return null for non-existent tag name', async () => {
      const tag = await service.getByName('non-existent', 'user-123');

      expect(tag).toBe(null);
    });

    it('should be case-sensitive', async () => {
      await service.create('user-123', { name: 'MyTag' });
      const tag = await service.getByName('mytag', 'user-123');

      expect(tag).toBe(null);
    });
  });

  describe('list', () => {
    it('should list all tags for user', async () => {
      await service.create('user-123', { name: 'tag1' });
      await service.create('user-123', { name: 'tag2' });
      await service.create('user-456', { name: 'other-user-tag' });

      const tags = await service.list('user-123');

      expect(tags).toHaveLength(2);
      expect(tags.map(t => t.name)).toContain('tag1');
      expect(tags.map(t => t.name)).toContain('tag2');
    });

    it('should return all tags with usageCount field', async () => {
      await service.create('user-123', { name: 'zebra' });
      await service.create('user-123', { name: 'alpha', color: '#FF0000', position: 1 });
      await service.create('user-123', { name: 'beta', color: '#00FF00', position: 2 });

      const tags = await service.list('user-123');

      expect(tags).toHaveLength(3);
      // All tags should have usageCount field (all 0 since no references)
      tags.forEach(tag => {
        expect(tag.usageCount).toBeDefined();
        expect(tag.usageCount).toBe(0);
      });
    });

    it('should return correct usage count for tags with references', async () => {
      // Create tags
      await service.create('user-123', { name: 'machine-learning' });
      await service.create('user-123', { name: 'deep-learning' });
      await service.create('user-123', { name: 'unused-tag' });

      // Create references with tags
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        authors: [{ full: 'John Doe' }],
        citationKey: 'doe2023a',
        tags: ['machine-learning', 'deep-learning'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 2',
        authors: [{ full: 'Jane Smith' }],
        citationKey: 'smith2023a',
        tags: ['machine-learning'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      // Create deleted reference (should not count)
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 3 Deleted',
        authors: [{ full: 'Bob Jones' }],
        citationKey: 'jones2023a',
        tags: ['machine-learning'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: true,
        deletedAt: new Date()
      });

      // Get tags
      const tags = await service.list('user-123');

      // Verify usage counts
      const mlTag = tags.find(t => t.name === 'machine-learning');
      const dlTag = tags.find(t => t.name === 'deep-learning');
      const unusedTag = tags.find(t => t.name === 'unused-tag');

      expect(mlTag?.usageCount).toBe(2); // Used in 2 non-deleted references
      expect(dlTag?.usageCount).toBe(1); // Used in 1 reference
      expect(unusedTag?.usageCount).toBe(0); // Not used
    });

    it('should sort tags by usage count descending', async () => {
      // Create tags
      await service.create('user-123', { name: 'popular-tag' });
      await service.create('user-123', { name: 'medium-tag' });
      await service.create('user-123', { name: 'rare-tag' });

      // Create references with different tag usage
      for (let i = 0; i < 5; i++) {
        await Reference.create({
          userId: 'user-123',
          type: 'article',
          title: `Paper ${i}`,
          authors: [{ full: 'Author' }],
          citationKey: `key${i}`,
          tags: ['popular-tag'],
          collectionIds: [],
          hasPdf: false,
          sourceRaw: { provider: 'manual', payload: {} },
          deleted: false
        });
      }

      for (let i = 0; i < 2; i++) {
        await Reference.create({
          userId: 'user-123',
          type: 'article',
          title: `Paper Medium ${i}`,
          authors: [{ full: 'Author' }],
          citationKey: `keymedium${i}`,
          tags: ['medium-tag'],
          collectionIds: [],
          hasPdf: false,
          sourceRaw: { provider: 'manual', payload: {} },
          deleted: false
        });
      }

      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper Rare',
        authors: [{ full: 'Author' }],
        citationKey: 'keyrare',
        tags: ['rare-tag'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      // Get tags
      const tags = await service.list('user-123');

      // Verify sort order (most used first)
      expect(tags[0].name).toBe('popular-tag');
      expect(tags[0].usageCount).toBe(5);
      expect(tags[1].name).toBe('medium-tag');
      expect(tags[1].usageCount).toBe(2);
      expect(tags[2].name).toBe('rare-tag');
      expect(tags[2].usageCount).toBe(1);
    });

    it('should return empty array when no tags', async () => {
      const tags = await service.list('user-123');

      expect(tags).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update tag name', async () => {
      const created = await service.create('user-123', { name: 'original' });
      const updated = await service.update(created._id.toString(), 'user-123', {
        name: 'updated',
      });

      expect(updated?.name).toBe('updated');
    });

    it('should update tag color', async () => {
      const created = await service.create('user-123', { name: 'test-tag' });
      const updated = await service.update(created._id.toString(), 'user-123', {
        color: '#0000FF',
        position: 3,
      });

      expect(updated?.color).toBe('#0000FF');
      expect(updated?.position).toBe(3);
    });

    it('should return null for non-existent tag', async () => {
      const updated = await service.update('507f1f77bcf86cd799439011', 'user-123', {
        name: 'new-name',
      });

      expect(updated).toBe(null);
    });
  });

  describe('updateColor', () => {
    it('should update tag color by name', async () => {
      await service.create('user-123', { name: 'my-tag' });
      const updated = await service.updateColor('my-tag', 'user-123', '#FF0000', 1);

      expect(updated?.color).toBe('#FF0000');
      expect(updated?.position).toBe(1);
    });

    it('should enforce max 9 colored tags', async () => {
      // Create 9 colored tags
      for (let i = 1; i <= 9; i++) {
        await service.create('user-123', { name: `tag${i}`, color: '#FF0000', position: i });
      }

      // Create 10th tag without color
      await service.create('user-123', { name: 'tag10' });

      // Try to color the 10th tag with null position (let service auto-assign)
      // This triggers MAX_COLORED_TAGS because all 9 positions are taken
      await expect(
        service.updateColor('tag10', 'user-123', '#FF0000', null)
      ).rejects.toThrow('MAX_COLORED_TAGS');
    });

    it('should enforce position between 1 and 9', async () => {
      await service.create('user-123', { name: 'test-tag' });

      await expect(
        service.updateColor('test-tag', 'user-123', '#FF0000', 0)
      ).rejects.toThrow('INVALID_POSITION');

      await expect(
        service.updateColor('test-tag', 'user-123', '#FF0000', 10)
      ).rejects.toThrow('INVALID_POSITION');
    });

    it('should allow removing color', async () => {
      await service.create('user-123', { name: 'colored-tag', color: '#FF0000', position: 1 });
      const updated = await service.updateColor('colored-tag', 'user-123', null, null);

      expect(updated?.color).toBe(null);
      expect(updated?.position).toBe(null);
    });

    it('should not count current tag when checking colored tags limit', async () => {
      // Create tag with color
      await service.create('user-123', { name: 'my-tag', color: '#FF0000', position: 1 });

      // Create 8 more colored tags (total 9)
      for (let i = 2; i <= 9; i++) {
        await service.create('user-123', { name: `tag${i}`, color: '#00FF00', position: i });
      }

      // Should be able to change color of existing colored tag
      const updated = await service.updateColor('my-tag', 'user-123', '#0000FF', 1);
      expect(updated?.color).toBe('#0000FF');
    });

    it('should return null for non-existent tag', async () => {
      const updated = await service.updateColor('non-existent', 'user-123', '#FF0000', 1);

      expect(updated).toBe(null);
    });
  });

  describe('rename', () => {
    it('should rename tag and update all references', async () => {
      // Create tag
      await service.create('user-123', { name: 'old-name' });

      // Create references with this tag
      const ref1 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        authors: [{ full: 'John Doe' }],
        citationKey: 'doe2023b',
        tags: ['old-name', 'other-tag'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      const ref2 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 2',
        authors: [{ full: 'Jane Smith' }],
        citationKey: 'smith2023b',
        tags: ['old-name'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      // Rename tag
      const renamed = await service.rename('old-name', 'new-name', 'user-123');

      expect(renamed).not.toBe(null);
      expect(renamed?.name).toBe('new-name');

      // Verify references updated
      const updatedRef1 = await Reference.findById(ref1._id);
      const updatedRef2 = await Reference.findById(ref2._id);

      expect(updatedRef1?.tags).toContain('new-name');
      expect(updatedRef1?.tags).not.toContain('old-name');
      expect(updatedRef1?.tags).toContain('other-tag'); // Other tags preserved

      expect(updatedRef2?.tags).toContain('new-name');
      expect(updatedRef2?.tags).not.toContain('old-name');
    });

    it('should reject rename if new name already exists', async () => {
      await service.create('user-123', { name: 'existing-tag' });
      await service.create('user-123', { name: 'other-tag' });

      await expect(
        service.rename('other-tag', 'existing-tag', 'user-123')
      ).rejects.toThrow('DUPLICATE_TAG_NAME');
    });

    it('should return null when renaming non-existent tag', async () => {
      const renamed = await service.rename('non-existent', 'new-name', 'user-123');
      expect(renamed).toBe(null);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      const created = await service.create('user-123', { name: 'to-delete' });
      const deleted = await service.delete(created._id.toString(), 'user-123');

      expect(deleted).toBe(true);

      const found = await service.getById(created._id.toString(), 'user-123');
      expect(found).toBe(null);
    });

    it('should return false for non-existent tag', async () => {
      const deleted = await service.delete('507f1f77bcf86cd799439011', 'user-123');

      expect(deleted).toBe(false);
    });

    it('should return false for wrong user', async () => {
      const created = await service.create('user-123', { name: 'test-tag' });
      const deleted = await service.delete(created._id.toString(), 'user-456');

      expect(deleted).toBe(false);
    });

    it('should remove tag from all references when deleted', async () => {
      // Create tag
      const tag = await service.create('user-123', { name: 'to-remove' });

      // Create references with this tag
      const ref1 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        authors: [{ full: 'John Doe' }],
        citationKey: 'doe2023c',
        tags: ['to-remove', 'keep-tag'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      const ref2 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 2',
        authors: [{ full: 'Jane Smith' }],
        citationKey: 'smith2023c',
        tags: ['to-remove'],
        collectionIds: [],
        hasPdf: false,
        sourceRaw: { provider: 'manual', payload: {} },
        deleted: false
      });

      // Delete tag
      const deleted = await service.delete(tag._id.toString(), 'user-123');
      expect(deleted).toBe(true);

      // Verify tag removed from all references
      const updatedRef1 = await Reference.findById(ref1._id);
      const updatedRef2 = await Reference.findById(ref2._id);

      expect(updatedRef1?.tags).not.toContain('to-remove');
      expect(updatedRef1?.tags).toContain('keep-tag'); // Other tags preserved
      expect(updatedRef1?.tags).toHaveLength(1);

      expect(updatedRef2?.tags).not.toContain('to-remove');
      expect(updatedRef2?.tags).toHaveLength(0); // Empty array after removal
    });

    it('should handle deleting tag not used in any references', async () => {
      const tag = await service.create('user-123', { name: 'unused-tag' });

      const deleted = await service.delete(tag._id.toString(), 'user-123');
      expect(deleted).toBe(true);

      // Verify tag is deleted
      const found = await service.getById(tag._id.toString(), 'user-123');
      expect(found).toBe(null);
    });
  });
});
