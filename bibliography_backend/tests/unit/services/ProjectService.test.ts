import { ProjectService } from '../../../src/services/ProjectService';
import { ReferenceService } from '../../../src/services/ReferenceService';
import { CollectionService } from '../../../src/services/CollectionService';
import { DuplicateService } from '../../../src/services/DuplicateService';
import { ProjectLink } from '../../../src/models/ProjectLink';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../../utils/mongoMemoryServer';

describe('ProjectService Unit Tests', () => {
  let service: ProjectService;
  let refService: ReferenceService;
  let colService: CollectionService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    service = new ProjectService();
    const dupService = new DuplicateService();
    colService = new CollectionService();
    refService = new ReferenceService(dupService, colService);
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('linkReference', () => {
    it('should link reference to project', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const link = await service.linkReference('user-123', 'proj-1', reference._id.toString());

      expect(link).toBeDefined();
      expect(link.userId).toBe('user-123');
      expect(link.projectId).toBe('proj-1');
      expect(link.referenceId?.toString()).toBe(reference._id.toString());
    });

    it('should create multiple links for same reference', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const link1 = await service.linkReference('user-123', 'proj-1', reference._id.toString());
      const link2 = await service.linkReference('user-123', 'proj-2', reference._id.toString());

      expect(link1.projectId).toBe('proj-1');
      expect(link2.projectId).toBe('proj-2');
    });

    it('should throw error when linking non-existent reference', async () => {
      // Service validates reference exists before creating link
      await expect(
        service.linkReference('user-123', 'proj-1', '507f1f77bcf86cd799439011')
      ).rejects.toThrow('Reference not found');
    });
  });

  describe('unlinkReference', () => {
    it('should unlink reference from project', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', reference._id.toString());

      const unlinked = await service.unlinkReference('user-123', 'proj-1', reference._id.toString());

      expect(unlinked).toBe(true);
    });

    it('should return false when unlinking non-existent link', async () => {
      const unlinked = await service.unlinkReference(
        'user-123',
        'proj-1',
        '507f1f77bcf86cd799439011'
      );

      expect(unlinked).toBe(false);
    });

    it('should not unlink for different user', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', reference._id.toString());

      const unlinked = await service.unlinkReference(
        'user-456',
        'proj-1',
        reference._id.toString()
      );

      expect(unlinked).toBe(false);
    });

    it('should be able to relink after unlinking', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', reference._id.toString());
      await service.unlinkReference('user-123', 'proj-1', reference._id.toString());

      const relinked = await service.linkReference('user-123', 'proj-1', reference._id.toString());

      expect(relinked).toBeDefined();
    });
  });

  describe('linkCollection', () => {
    it('should link collection to project', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      const link = await service.linkCollection('user-123', 'proj-1', collection._id.toString());

      expect(link).toBeDefined();
      expect(link.userId).toBe('user-123');
      expect(link.projectId).toBe('proj-1');
      expect(link.collectionId?.toString()).toBe(collection._id.toString());
    });

    it('should create multiple links for same collection', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      const link1 = await service.linkCollection('user-123', 'proj-1', collection._id.toString());
      const link2 = await service.linkCollection('user-123', 'proj-2', collection._id.toString());

      expect(link1.projectId).toBe('proj-1');
      expect(link2.projectId).toBe('proj-2');
    });

    it('should throw error when linking non-existent collection', async () => {
      // Service validates collection exists before creating link
      await expect(
        service.linkCollection('user-123', 'proj-1', '507f1f77bcf86cd799439011')
      ).rejects.toThrow('Collection not found');
    });
  });

  describe('unlinkCollection', () => {
    it('should unlink collection from project', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      await service.linkCollection('user-123', 'proj-1', collection._id.toString());

      const unlinked = await service.unlinkCollection('user-123', 'proj-1', collection._id.toString());

      expect(unlinked).toBe(true);
    });

    it('should return false when unlinking non-existent link', async () => {
      const unlinked = await service.unlinkCollection(
        'user-123',
        'proj-1',
        '507f1f77bcf86cd799439011'
      );

      expect(unlinked).toBe(false);
    });

    it('should not unlink for different user', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      await service.linkCollection('user-123', 'proj-1', collection._id.toString());

      const unlinked = await service.unlinkCollection(
        'user-456',
        'proj-1',
        collection._id.toString()
      );

      expect(unlinked).toBe(false);
    });
  });

  describe('getProjectReferences', () => {
    it('should get all references in a project', async () => {
      const ref1 = await refService.create('user-123', {
        type: 'article',
        title: 'Paper 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const ref2 = await refService.create('user-123', {
        type: 'book',
        title: 'Book 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-get-refs-1', ref1._id.toString());
      await service.linkReference('user-123', 'proj-get-refs-1', ref2._id.toString());

      const references = await service.getProjectReferences('user-123', 'proj-get-refs-1');

      expect(references).toHaveLength(2);
      expect(references.map(r => r.title)).toContain('Paper 1');
      expect(references.map(r => r.title)).toContain('Book 1');
    });

    it('should return empty array when project has no references', async () => {
      const references = await service.getProjectReferences('user-123', 'proj-empty');

      expect(references).toEqual([]);
    });

    it('should exclude deleted references', async () => {
      const ref1 = await refService.create('user-123', {
        type: 'article',
        title: 'Paper 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const ref2 = await refService.create('user-123', {
        type: 'article',
        title: 'Paper 2',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-exclude-deleted', ref1._id.toString());
      await service.linkReference('user-123', 'proj-exclude-deleted', ref2._id.toString());

      await refService.softDelete(ref2._id.toString(), 'user-123');

      const references = await service.getProjectReferences('user-123', 'proj-exclude-deleted');

      expect(references).toHaveLength(1);
      expect(references[0].title).toBe('Paper 1');
    });

    it('should not return references from other users', async () => {
      const ref1 = await refService.create('user-123', {
        type: 'article',
        title: 'Paper 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', ref1._id.toString());

      const references = await service.getProjectReferences('user-456', 'proj-1');

      expect(references).toHaveLength(0);
    });
  });

  describe('getProjectCollections', () => {
    it('should get all collections in a project', async () => {
      const col1 = await colService.create('user-123', { name: 'Collection 1' });
      const col2 = await colService.create('user-123', { name: 'Collection 2' });

      await service.linkCollection('user-123', 'proj-get-colls-1', col1._id.toString());
      await service.linkCollection('user-123', 'proj-get-colls-1', col2._id.toString());

      const collections = await service.getProjectCollections('user-123', 'proj-get-colls-1');

      expect(collections).toHaveLength(2);
      expect(collections.map(c => c.name)).toContain('Collection 1');
      expect(collections.map(c => c.name)).toContain('Collection 2');
    });

    it('should return empty array when project has no collections', async () => {
      const collections = await service.getProjectCollections('user-123', 'proj-empty');

      expect(collections).toEqual([]);
    });

    it('should not return collections from other users', async () => {
      const col1 = await colService.create('user-123', { name: 'Collection 1' });

      await service.linkCollection('user-123', 'proj-1', col1._id.toString());

      const collections = await service.getProjectCollections('user-456', 'proj-1');

      expect(collections).toHaveLength(0);
    });
  });

  describe('getReferenceProjects', () => {
    it('should get all projects containing a reference', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', reference._id.toString());
      await service.linkReference('user-123', 'proj-2', reference._id.toString());
      await service.linkReference('user-123', 'proj-3', reference._id.toString());

      const projectLinks = await service.getReferenceProjects('user-123', reference._id.toString());

      expect(projectLinks).toHaveLength(3);
      expect(projectLinks.map(l => l.projectId)).toContain('proj-1');
      expect(projectLinks.map(l => l.projectId)).toContain('proj-2');
      expect(projectLinks.map(l => l.projectId)).toContain('proj-3');
    });

    it('should return empty array when reference is not in any project', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Unlinked Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const projectLinks = await service.getReferenceProjects('user-123', reference._id.toString());

      expect(projectLinks).toEqual([]);
    });

    it('should throw when user queries reference they do not own', async () => {
      const reference = await refService.create('user-123', {
        type: 'article',
        title: 'Test Paper',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      await service.linkReference('user-123', 'proj-1', reference._id.toString());

      // user-456 doesn't own this reference, service validates ownership
      await expect(
        service.getReferenceProjects('user-456', reference._id.toString())
      ).rejects.toThrow('Reference not found');
    });
  });

  describe('getCollectionProjects', () => {
    it('should get all projects containing a collection', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      await service.linkCollection('user-123', 'proj-1', collection._id.toString());
      await service.linkCollection('user-123', 'proj-2', collection._id.toString());

      const projectLinks = await service.getCollectionProjects('user-123', collection._id.toString());

      expect(projectLinks).toHaveLength(2);
      expect(projectLinks.map(l => l.projectId)).toContain('proj-1');
      expect(projectLinks.map(l => l.projectId)).toContain('proj-2');
    });

    it('should return empty array when collection is not in any project', async () => {
      const collection = await colService.create('user-123', { name: 'Unlinked Collection' });

      const projectLinks = await service.getCollectionProjects('user-123', collection._id.toString());

      expect(projectLinks).toEqual([]);
    });

    it('should throw when user queries collection they do not own', async () => {
      const collection = await colService.create('user-123', { name: 'Test Collection' });

      await service.linkCollection('user-123', 'proj-1', collection._id.toString());

      // user-456 doesn't own this collection, service validates ownership
      await expect(
        service.getCollectionProjects('user-456', collection._id.toString())
      ).rejects.toThrow('Collection not found');
    });
  });
});
