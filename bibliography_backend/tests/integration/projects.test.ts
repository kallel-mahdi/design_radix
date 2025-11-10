import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('Projects API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/bibliography/projects/link', () => {
    it('should link reference to project', async () => {
      // Create reference
      const refResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const referenceId = refResponse.body.data._id;
      const projectId = 'proj-123';

      const response = await request(app)
        .post('/api/bibliography/projects/link')
        .send({
          projectId,
          referenceId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        referenceId,
      });
    });

    it('should return 404 for non-existent reference', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/link')
        .send({
          projectId: 'proj-123',
          referenceId: '507f1f77bcf86cd799439011',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/link')
        .send({
          projectId: 'proj-123',
          // Missing referenceId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle already linked reference', async () => {
      // Create reference
      const refResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const referenceId = refResponse.body.data._id;
      const projectId = 'proj-123';

      // Link first time
      await request(app)
        .post('/api/bibliography/projects/link')
        .send({ projectId, referenceId })
        .expect(200);

      // Link second time - should be idempotent
      const response = await request(app)
        .post('/api/bibliography/projects/link')
        .send({ projectId, referenceId })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/bibliography/projects/unlink', () => {
    it('should unlink reference from project', async () => {
      // Create reference
      const refResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const referenceId = refResponse.body.data._id;
      const projectId = 'proj-123';

      // Link reference
      await request(app)
        .post('/api/bibliography/projects/link')
        .send({ projectId, referenceId });

      // Unlink reference
      const response = await request(app)
        .post('/api/bibliography/projects/unlink')
        .send({
          projectId,
          referenceId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when unlinking non-existent link', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/unlink')
        .send({
          projectId: 'proj-123',
          referenceId: '507f1f77bcf86cd799439011',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/unlink')
        .send({
          projectId: 'proj-123',
          // Missing referenceId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bibliography/projects/:projectId/references', () => {
    it('should get all references in a project', async () => {
      // Create references
      const ref1Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper 1',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const ref2Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'book',
          title: 'Book 1',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const projectId = 'proj-123';

      // Link both to project
      await request(app)
        .post('/api/bibliography/projects/link')
        .send({
          projectId,
          referenceId: ref1Response.body.data._id,
        });

      await request(app)
        .post('/api/bibliography/projects/link')
        .send({
          projectId,
          referenceId: ref2Response.body.data._id,
        });

      // Get project references
      const response = await request(app)
        .get(`/api/bibliography/projects/${projectId}/references`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((r: any) => r.title)).toContain('Paper 1');
      expect(response.body.data.map((r: any) => r.title)).toContain('Book 1');
    });

    it('should return empty array when project has no references', async () => {
      const response = await request(app)
        .get('/api/bibliography/projects/proj-empty/references')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/bibliography/projects/references/:referenceId/projects', () => {
    it('should get all projects containing a reference', async () => {
      // Create reference
      const refResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const referenceId = refResponse.body.data._id;

      // Link to multiple projects
      await request(app)
        .post('/api/bibliography/projects/link')
        .send({ projectId: 'proj-1', referenceId });

      await request(app)
        .post('/api/bibliography/projects/link')
        .send({ projectId: 'proj-2', referenceId });

      // Get projects
      const response = await request(app)
        .get(`/api/bibliography/projects/references/${referenceId}/projects`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((p: any) => p.projectId)).toContain('proj-1');
      expect(response.body.data.map((p: any) => p.projectId)).toContain('proj-2');
    });

    it('should return empty array when reference is not in any project', async () => {
      const refResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Unlinked Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get(`/api/bibliography/projects/references/${refResponse.body.data._id}/projects`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 404 for non-existent reference', async () => {
      const response = await request(app)
        .get('/api/bibliography/projects/references/507f1f77bcf86cd799439011/projects')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/bibliography/projects/link-collection', () => {
    it('should link collection to project', async () => {
      // Create collection
      const colResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'ML Papers' });

      const collectionId = colResponse.body.data._id;
      const projectId = 'proj-123';

      const response = await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({
          projectId,
          collectionId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId,
        collectionId,
      });
    });

    it('should return 404 for non-existent collection', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({
          projectId: 'proj-123',
          collectionId: '507f1f77bcf86cd799439011',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({
          projectId: 'proj-123',
          // Missing collectionId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/bibliography/projects/unlink-collection', () => {
    it('should unlink collection from project', async () => {
      // Create collection
      const colResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'ML Papers' });

      const collectionId = colResponse.body.data._id;
      const projectId = 'proj-123';

      // Link collection
      await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({ projectId, collectionId });

      // Unlink collection
      const response = await request(app)
        .post('/api/bibliography/projects/unlink-collection')
        .send({
          projectId,
          collectionId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when unlinking non-existent link', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/unlink-collection')
        .send({
          projectId: 'proj-123',
          collectionId: '507f1f77bcf86cd799439011',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/bibliography/projects/unlink-collection')
        .send({
          projectId: 'proj-123',
          // Missing collectionId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bibliography/projects/:projectId/collections', () => {
    it('should get all collections in a project', async () => {
      // Create collections
      const col1Response = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'ML Papers' });

      const col2Response = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Books' });

      const projectId = 'proj-123';

      // Link both to project
      await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({
          projectId,
          collectionId: col1Response.body.data._id,
        });

      await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({
          projectId,
          collectionId: col2Response.body.data._id,
        });

      // Get project collections
      const response = await request(app)
        .get(`/api/bibliography/projects/${projectId}/collections`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((c: any) => c.name)).toContain('ML Papers');
      expect(response.body.data.map((c: any) => c.name)).toContain('Books');
    });

    it('should return empty array when project has no collections', async () => {
      const response = await request(app)
        .get('/api/bibliography/projects/proj-empty/collections')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/bibliography/projects/collections/:collectionId/projects', () => {
    it('should get all projects containing a collection', async () => {
      // Create collection
      const colResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'ML Papers' });

      const collectionId = colResponse.body.data._id;

      // Link to multiple projects
      await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({ projectId: 'proj-1', collectionId });

      await request(app)
        .post('/api/bibliography/projects/link-collection')
        .send({ projectId: 'proj-2', collectionId });

      // Get projects
      const response = await request(app)
        .get(`/api/bibliography/projects/collections/${collectionId}/projects`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((p: any) => p.projectId)).toContain('proj-1');
      expect(response.body.data.map((p: any) => p.projectId)).toContain('proj-2');
    });

    it('should return empty array when collection is not in any project', async () => {
      const colResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Unlinked Collection' });

      const response = await request(app)
        .get(`/api/bibliography/projects/collections/${colResponse.body.data._id}/projects`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 404 for non-existent collection', async () => {
      const response = await request(app)
        .get('/api/bibliography/projects/collections/507f1f77bcf86cd799439011/projects')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
