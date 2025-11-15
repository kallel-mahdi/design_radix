import { ReferenceService } from '../../../src/services/ReferenceService';
import { DuplicateService } from '../../../src/services/DuplicateService';
import { Reference } from '../../../src/models/Reference';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../../utils/mongoMemoryServer';

describe('ReferenceService Unit Tests', () => {
  let service: ReferenceService;
  let duplicateService: DuplicateService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    duplicateService = new DuplicateService();
    service = new ReferenceService(duplicateService);
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('create', () => {
    it('should create a reference with minimal fields', async () => {
      const reference = await service.create('user-123', {
        type: 'article',
        title: 'Test Article',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      expect(reference).toBeDefined();
      expect(reference.title).toBe('Test Article');
      expect(reference.userId).toBe('user-123');
      expect(reference.deleted).toBe(false);
      expect(reference.hasPdf).toBe(false);
      expect(reference.citationKey).toBeDefined();
    });

    it('should create a reference with full metadata', async () => {
      const reference = await service.create('user-123', {
        type: 'article',
        title: 'Machine Learning Paper',
        authors: [
          { given: 'John', family: 'Doe' },
          { given: 'Jane', family: 'Smith' },
        ],
        year: 2024,
        venue: 'ICML',
        doi: '10.1234/ml.2024',
        tags: ['machine-learning', 'ai'],
        sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
      });

      expect(reference.title).toBe('Machine Learning Paper');
      expect(reference.authors).toHaveLength(2);
      expect(reference.authors[0].given).toBe('John');
      expect(reference.authors[0].family).toBe('Doe');
      expect(reference.year).toBe(2024);
      expect(reference.venue).toBe('ICML');
      expect(reference.doi).toBe('10.1234/ml.2024');
      expect(reference.tags).toContain('machine-learning');
      expect(reference.tags).toContain('ai');
    });

    it('should generate unique citation keys', async () => {
      const ref1 = await service.create('user-123', {
        type: 'article',
        title: 'Paper One',
        authors: [{ given: 'John', family: 'Doe' }],
        year: 2024,
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const ref2 = await service.create('user-123', {
        type: 'article',
        title: 'Paper Two',
        authors: [{ given: 'John', family: 'Doe' }],
        year: 2024,
        sourceRaw: { provider: 'manual', payload: {} },
      });

      expect(ref1.citationKey).not.toBe(ref2.citationKey);
    });

    it('should handle authors array properly', async () => {
      const reference = await service.create('user-123', {
        type: 'article',
        title: 'Multi-Author Paper',
        authors: [
          { given: 'Alice', family: 'Anderson' },
          { given: 'Bob', family: 'Brown' },
          { given: 'Charlie', family: 'Clark' },
        ],
        sourceRaw: { provider: 'manual', payload: {} },
      });

      expect(reference.authors).toHaveLength(3);
      expect(reference.authors[0].full).toBe('Anderson, Alice');
      expect(reference.authors[1].full).toBe('Brown, Bob');
      expect(reference.authors[2].full).toBe('Clark, Charlie');
    });
  });

  describe('getById', () => {
    it('should get reference by id', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Find Me',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const found = await service.getById(created._id.toString(), 'user-123');

      expect(found).toBeDefined();
      expect(found?.title).toBe('Find Me');
      expect(found?._id.toString()).toBe(created._id.toString());
    });

    it('should return null for non-existent reference', async () => {
      const found = await service.getById('507f1f77bcf86cd799439011', 'user-123');

      expect(found).toBeNull();
    });

    it('should return null for wrong user', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Private Reference',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const found = await service.getById(created._id.toString(), 'user-456');

      expect(found).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all references for user', async () => {
      await service.create('user-123', {
        type: 'article',
        title: 'Paper 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.create('user-123', {
        type: 'book',
        title: 'Book 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.create('user-456', {
        type: 'article',
        title: 'Other User Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const result = await service.list('user-123', {});

      expect(result.references).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.references.map(r => r.title)).toContain('Paper 1');
      expect(result.references.map(r => r.title)).toContain('Book 1');
    });

    it('should exclude deleted references by default', async () => {
      const ref = await service.create('user-123', {
        type: 'article',
        title: 'To Delete',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.softDelete(ref._id.toString(), 'user-123');

      const result = await service.list('user-123', {});

      expect(result.references).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should include deleted references when requested', async () => {
      const ref = await service.create('user-123', {
        type: 'article',
        title: 'Deleted Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.softDelete(ref._id.toString(), 'user-123');

      const result = await service.list('user-123', { deleted: true });

      expect(result.references).toHaveLength(1);
      expect(result.references[0].title).toBe('Deleted Paper');
      expect(result.references[0].deleted).toBe(true);
    });

    it('should filter by collectionId', async () => {
      const validCollectionId = '507f1f77bcf86cd799439011';

      const ref1 = await service.create('user-123', {
        type: 'article',
        title: 'In Collection',
        collectionIds: [validCollectionId],
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.create('user-123', {
        type: 'article',
        title: 'Not In Collection',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const result = await service.list('user-123', { collectionId: validCollectionId });

      expect(result.references).toHaveLength(1);
      expect(result.references[0].title).toBe('In Collection');
    });

    it('should filter by tags', async () => {
      await service.create('user-123', {
        type: 'article',
        title: 'ML Paper',
        tags: ['machine-learning'],
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.create('user-123', {
        type: 'article',
        title: 'NLP Paper',
        tags: ['nlp'],
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const result = await service.list('user-123', { tags: ['machine-learning'] });

      expect(result.references).toHaveLength(1);
      expect(result.references[0].title).toBe('ML Paper');
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await service.create('user-123', {
          type: 'article',
          title: `Paper ${i}`,
          sourceRaw: { provider: 'manual', payload: {} },
        });
      }

      const page1 = await service.list('user-123', { limit: 2, offset: 0 });
      const page2 = await service.list('user-123', { limit: 2, offset: 2 });

      expect(page1.references).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page2.references).toHaveLength(2);
    });

    it('should filter by search query in title', async () => {
      await service.create('user-123', {
        type: 'article',
        title: 'A Study of Plasticity in Deep RL',
        abstract: 'Neural networks and learning',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.create('user-123', {
        type: 'article',
        title: 'Introduction to NLP',
        abstract: 'Natural language processing',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const result = await service.list('user-123', { search: 'plasticity' });

      expect(result.references).toHaveLength(1);
      expect(result.references[0].title).toContain('Plasticity');
    });

    it('should return empty array when search has no matches', async () => {
      await service.create('user-123', {
        type: 'article',
        title: 'Machine Learning Paper',
        abstract: 'Deep learning fundamentals',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const result = await service.list('user-123', { search: 'nonexistentterm123' });

      expect(result.references).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('update', () => {
    it('should update reference title', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Original Title',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const updated = await service.update(created._id.toString(), 'user-123', {
        title: 'Updated Title',
      });

      expect(updated?.title).toBe('Updated Title');
    });

    it('should update multiple fields', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Paper',
        year: 2023,
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const updated = await service.update(created._id.toString(), 'user-123', {
        title: 'Updated Paper',
        year: 2024,
        venue: 'ICML',
      });

      expect(updated?.title).toBe('Updated Paper');
      expect(updated?.year).toBe(2024);
      expect(updated?.venue).toBe('ICML');
    });

    it('should return null when updating non-existent reference', async () => {
      const updated = await service.update('507f1f77bcf86cd799439011', 'user-123', {
        title: 'New Title',
      });

      expect(updated).toBeNull();
    });

    it('should return null when updating with wrong user', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'My Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const updated = await service.update(created._id.toString(), 'user-456', {
        title: 'Hacked Title',
      });

      expect(updated).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'To Delete',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const deleted = await service.softDelete(created._id.toString(), 'user-123');

      expect(deleted).toBe(true);

      const found = await service.getById(created._id.toString(), 'user-123');
      expect(found?.deleted).toBe(true);
      expect(found?.deletedAt).toBeDefined();
    });

    it('should return false for non-existent reference', async () => {
      const deleted = await service.softDelete('507f1f77bcf86cd799439011', 'user-123');

      expect(deleted).toBe(false);
    });

    it('should return false when deleting with wrong user', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Protected',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const deleted = await service.softDelete(created._id.toString(), 'user-456');

      expect(deleted).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore a deleted reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Restore Me',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.softDelete(created._id.toString(), 'user-123');

      const restored = await service.restore(created._id.toString(), 'user-123');

      expect(restored).toBe(true);

      const found = await service.getById(created._id.toString(), 'user-123');
      expect(found?.deleted).toBe(false);
      expect(found?.deletedAt).toBeNull();
    });

    it('should return false for non-deleted reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Not Deleted',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const restored = await service.restore(created._id.toString(), 'user-123');

      expect(restored).toBe(false);
    });

    it('should return false for non-existent reference', async () => {
      const restored = await service.restore('507f1f77bcf86cd799439011', 'user-123');

      expect(restored).toBe(false);
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete a deleted reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Delete Forever',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.softDelete(created._id.toString(), 'user-123');

      const deleted = await service.permanentDelete(created._id.toString(), 'user-123');

      expect(deleted).toBe(true);

      const found = await service.getById(created._id.toString(), 'user-123');
      expect(found).toBeNull();
    });

    it('should return false for non-deleted reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Not Deleted',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const deleted = await service.permanentDelete(created._id.toString(), 'user-123');

      expect(deleted).toBe(false);
    });

    it('should return false for non-existent reference', async () => {
      const deleted = await service.permanentDelete('507f1f77bcf86cd799439011', 'user-123');

      expect(deleted).toBe(false);
    });
  });

  describe('attachPdf', () => {
    it('should attach pdf metadata to reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Paper with PDF',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const updated = await service.attachPdf(created._id.toString(), 'user-123', {
        storedPath: '/pdfs/paper.pdf',
        originalName: 'paper.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
      });

      expect(updated?.hasPdf).toBe(true);
      expect(updated?.pdf).toBeDefined();
      expect(updated?.pdf?.storedPath).toBe('/pdfs/paper.pdf');
      expect(updated?.pdf?.originalName).toBe('paper.pdf');
      expect(updated?.pdf?.size).toBe(1024000);
      expect(updated?.pdf?.uploadedAt).toBeDefined();
    });

    it('should return null when attaching to non-existent reference', async () => {
      const updated = await service.attachPdf('507f1f77bcf86cd799439011', 'user-123', {
        storedPath: '/pdfs/paper.pdf',
        originalName: 'paper.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
      });

      expect(updated).toBeNull();
    });
  });

  describe('detachPdf', () => {
    it('should detach pdf from reference', async () => {
      const created = await service.create('user-123', {
        type: 'article',
        title: 'Paper with PDF',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.attachPdf(created._id.toString(), 'user-123', {
        storedPath: '/pdfs/paper.pdf',
        originalName: 'paper.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
      });

      const detached = await service.detachPdf(created._id.toString(), 'user-123');

      expect(detached?.hasPdf).toBe(false);
      // Mongoose $unset returns empty object {}, not undefined
      expect(detached?.pdf).toEqual({});
    });

    it('should return null when detaching from non-existent reference', async () => {
      const detached = await service.detachPdf('507f1f77bcf86cd799439011', 'user-123');

      expect(detached).toBeNull();
    });
  });
});
