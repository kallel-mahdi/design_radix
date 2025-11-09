import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('References API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/bibliography/references', () => {
    it('should create a reference with minimal fields', async () => {
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test Article',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        type: 'article',
        title: 'Test Article',
        deleted: false,
      });
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.citationKey).toBeDefined();
    });

    it('should create a reference with full metadata', async () => {
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Machine Learning Paper',
          authors: [
            { given: 'John', family: 'Doe', full: 'John Doe' },
            { given: 'Jane', family: 'Smith', full: 'Jane Smith' },
          ],
          year: 2024,
          venue: 'ICML',
          doi: '10.1234/test',
          tags: ['machine-learning', 'nlp'],
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/test' } },
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        title: 'Machine Learning Paper',
        year: 2024,
        venue: 'ICML',
        doi: '10.1234/test',
        tags: expect.arrayContaining(['machine-learning', 'nlp']),
      });
      expect(response.body.data.authors).toHaveLength(2);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          // Missing title
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'invalid-type',
          title: 'Test',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bibliography/references', () => {
    it('should list all references', async () => {
      // Create references
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper 1',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'book',
          title: 'Book 1',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get('/api/bibliography/references')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.references).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter references by collectionId', async () => {
      // Create collection
      const collectionResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'ML Papers' });

      const collectionId = collectionResponse.body.data._id;

      // Create reference with collection
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'In Collection',
          collectionIds: [collectionId],
          sourceRaw: { provider: 'manual', payload: {} },
        });

      // Create reference without collection
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Not In Collection',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get(`/api/bibliography/references?collectionId=${collectionId}`)
        .expect(200);

      expect(response.body.data.references).toHaveLength(1);
      expect(response.body.data.references[0].title).toBe('In Collection');
    });

    it('should filter references by tags', async () => {
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'ML Paper',
          tags: ['machine-learning'],
          sourceRaw: { provider: 'manual', payload: {} },
        });

      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'NLP Paper',
          tags: ['nlp'],
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get('/api/bibliography/references?tags=machine-learning')
        .expect(200);

      expect(response.body.data.references).toHaveLength(1);
      expect(response.body.data.references[0].title).toBe('ML Paper');
    });

    it('should exclude deleted references by default', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'To Delete',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const refId = createResponse.body.data._id;

      // Delete reference
      await request(app).delete(`/api/bibliography/references/${refId}`);

      const response = await request(app)
        .get('/api/bibliography/references')
        .expect(200);

      expect(response.body.data.references).toHaveLength(0);
    });

    it('should include deleted references when deleted=true', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Deleted',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      await request(app).delete(`/api/bibliography/references/${createResponse.body.data._id}`);

      const response = await request(app)
        .get('/api/bibliography/references?deleted=true')
        .expect(200);

      expect(response.body.data.references).toHaveLength(1);
      expect(response.body.data.references[0].deleted).toBe(true);
    });

    it('should paginate results', async () => {
      // Create 5 references
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/bibliography/references')
          .send({
            type: 'article',
            title: `Paper ${i}`,
            sourceRaw: { provider: 'manual', payload: {} },
          });
      }

      const response = await request(app)
        .get('/api/bibliography/references?limit=2&offset=0')
        .expect(200);

      expect(response.body.data.references).toHaveLength(2);
      expect(response.body.data.total).toBe(5);
    });
  });

  describe('PATCH /api/bibliography/references/:id', () => {
    it('should update reference title', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Original Title',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const refId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/references/${refId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should update reference tags', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Test',
          tags: ['old-tag'],
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const refId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/references/${refId}`)
        .send({ tags: ['new-tag1', 'new-tag2'] })
        .expect(200);

      expect(response.body.data.tags).toEqual(['new-tag1', 'new-tag2']);
    });

    it('should return 404 for non-existent reference', async () => {
      await request(app)
        .patch('/api/bibliography/references/507f1f77bcf86cd799439011')
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/bibliography/references/:id', () => {
    it('should soft delete a reference', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'To Delete',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const refId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/bibliography/references/${refId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify soft delete
      const getResponse = await request(app)
        .get(`/api/bibliography/references?deleted=true`)
        .expect(200);

      const deletedRef = getResponse.body.data.references.find((r: any) => r._id === refId);
      expect(deletedRef.deleted).toBe(true);
      expect(deletedRef.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent reference', async () => {
      await request(app)
        .delete('/api/bibliography/references/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('PATCH /api/bibliography/references/:id/restore', () => {
    it('should restore a deleted reference', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'To Restore',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const refId = createResponse.body.data._id;

      // Delete
      await request(app).delete(`/api/bibliography/references/${refId}`);

      // Restore
      const response = await request(app)
        .patch(`/api/bibliography/references/${refId}/restore`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify restoration
      const getResponse = await request(app)
        .get('/api/bibliography/references')
        .expect(200);

      const restoredRef = getResponse.body.data.references.find((r: any) => r._id === refId);
      expect(restoredRef.deleted).toBe(false);
      expect(restoredRef.deletedAt).toBe(null);
    });

    it('should return 404 for non-existent reference', async () => {
      await request(app)
        .patch('/api/bibliography/references/507f1f77bcf86cd799439011/restore')
        .expect(404);
    });
  });
});
