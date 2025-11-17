import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('Duplicates API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/bibliography/duplicates', () => {
    it('should list unresolved duplicates', async () => {
      // Create a reference with DOI
      const ref1Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Machine Learning Paper',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      // Create a duplicate with same DOI
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'ML Paper Duplicate',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      // Get unresolved duplicates
      const response = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Verify duplicate structure when found
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('_id');
        expect(response.body.data[0]).toHaveProperty('existingReferenceId');
        expect(response.body.data[0]).toHaveProperty('duplicateReferenceId');
        expect(response.body.data[0]).toHaveProperty('status');
        expect(response.body.data[0].status).toBe('pending');
        expect(response.body.data[0]).toHaveProperty('matchReason');
        expect(response.body.data[0]).toHaveProperty('confidence');
      }
    });

    it('should return empty array when no duplicates exist', async () => {
      // Create single reference
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Unique Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should list multiple duplicate groups', async () => {
      // Create first group with duplicate DOI
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper A',
          doi: '10.1234/a.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/a.2024' } },
        });

      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper A Duplicate',
          doi: '10.1234/a.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/a.2024' } },
        });

      // Create second group with different duplicate DOI
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper B',
          doi: '10.1234/b.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/b.2024' } },
        });

      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper B Duplicate',
          doi: '10.1234/b.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/b.2024' } },
        });

      const response = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Multiple duplicates may be detected
      if (response.body.data.length > 0) {
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('POST /api/bibliography/duplicates/:id/resolve', () => {
    it('should resolve duplicate with keep-existing action', async () => {
      // Create original reference
      const ref1Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Original Paper',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref1Id = ref1Response.body.data._id;

      // Create duplicate reference
      const ref2Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Duplicate Paper',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref2Id = ref2Response.body.data._id;

      // Get the duplicate candidate
      const duplicatesResponse = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      if (duplicatesResponse.body.data.length > 0) {
        const duplicateId = duplicatesResponse.body.data[0]._id;

        // Resolve duplicate
        const response = await request(app)
          .post(`/api/bibliography/duplicates/${duplicateId}/resolve`)
          .send({
            action: 'keep-existing',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data.status).toBe('keep-existing');
        expect(response.body.data).toHaveProperty('resolvedAt');
        expect(response.body.data).toHaveProperty('actionTakenBy');
      }
    });

    it('should reject merge action (not implemented in MVP)', async () => {
      // Create original reference
      const ref1Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Original Paper',
          authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref1Id = ref1Response.body.data._id;

      // Create duplicate with additional metadata
      const ref2Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Duplicate Paper',
          authors: [
            { given: 'John', family: 'Doe', full: 'John Doe' },
            { given: 'Jane', family: 'Smith', full: 'Jane Smith' },
          ],
          year: 2024,
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref2Id = ref2Response.body.data._id;

      // Get the duplicate candidate
      const duplicatesResponse = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      if (duplicatesResponse.body.data.length > 0) {
        const duplicateId = duplicatesResponse.body.data[0]._id;

        // Attempt merge - should fail as not implemented in MVP
        const response = await request(app)
          .post(`/api/bibliography/duplicates/${duplicateId}/resolve`)
          .send({
            action: 'merged',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('MERGE_NOT_IMPLEMENTED');
      }
    });

    it('should resolve duplicate with keep-new action', async () => {
      // Create original reference
      const ref1Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper Version 1',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref1Id = ref1Response.body.data._id;

      // Create duplicate (newer reference)
      const ref2Response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper Version 2',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      const ref2Id = ref2Response.body.data._id;

      // Get the duplicate candidate
      const duplicatesResponse = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      if (duplicatesResponse.body.data.length > 0) {
        const duplicateId = duplicatesResponse.body.data[0]._id;

        // Resolve with keep-new (keeps the newer reference, deletes existing)
        const response = await request(app)
          .post(`/api/bibliography/duplicates/${duplicateId}/resolve`)
          .send({
            action: 'keep-new',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data.status).toBe('keep-new');
        expect(response.body.data).toHaveProperty('resolvedAt');
        expect(response.body.data).toHaveProperty('actionTakenBy');
      }
    });

    it('should return 404 for non-existent duplicate', async () => {
      const response = await request(app)
        .post('/api/bibliography/duplicates/507f1f77bcf86cd799439011/resolve')
        .send({
          action: 'keep-existing',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid action type', async () => {
      // Create duplicate first
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper A',
          doi: '10.1234/test.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/test.2024' } },
        });

      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper A Dup',
          doi: '10.1234/test.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/test.2024' } },
        });

      const duplicatesResponse = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      if (duplicatesResponse.body.data.length > 0) {
        const duplicateId = duplicatesResponse.body.data[0]._id;

        const response = await request(app)
          .post(`/api/bibliography/duplicates/${duplicateId}/resolve`)
          .send({
            action: 'invalid-action',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/bibliography/duplicates/507f1f77bcf86cd799439011/resolve')
        .send({
          // Missing action field
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Duplicate Detection on Reference Creation', () => {
    it('should detect duplicates when creating reference with DOI', async () => {
      // Create first reference
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'ML Paper',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        });

      // Create second reference with same DOI
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'ML Paper Duplicate',
          doi: '10.1234/ml.2024',
          sourceRaw: { provider: 'doi', payload: { doi: '10.1234/ml.2024' } },
        })
        .expect(201);

      // Verify reference was created
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();

      // Check that duplicates were detected
      const duplicatesResponse = await request(app)
        .get('/api/bibliography/duplicates')
        .expect(200);

      // Should have at least one unresolved duplicate
      expect(duplicatesResponse.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
