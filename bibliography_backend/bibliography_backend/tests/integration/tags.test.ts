import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('Tags API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/bibliography/tags', () => {
    it('should create a tag', async () => {
      const response = await request(app)
        .post('/api/bibliography/tags')
        .send({
          name: 'machine-learning',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'machine-learning',
        color: null,
        position: null,
        automatic: false,
      });
      expect(response.body.data._id).toBeDefined();
    });

    it('should create a colored tag', async () => {
      const response = await request(app)
        .post('/api/bibliography/tags')
        .send({
          name: 'important',
          color: '#FF0000',
          position: 1,
        })
        .expect(201);

      expect(response.body.data.color).toBe('#FF0000');
      expect(response.body.data.position).toBe(1);
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/bibliography/tags')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/bibliography/tags', () => {
    it('should list all tags', async () => {
      // Create multiple tags
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'tag1' });

      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'tag2' });

      const response = await request(app)
        .get('/api/bibliography/tags')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no tags', async () => {
      const response = await request(app)
        .get('/api/bibliography/tags')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should sort tags by usageCount descending', async () => {
      // Create tags
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'zebra' });

      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'alpha', color: '#FF0000', position: 1 });

      // Create references to use the tags
      // 'alpha' tag used in 3 references
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/bibliography/references')
          .send({
            type: 'article',
            title: `Paper ${i}`,
            tags: ['alpha'],
            sourceRaw: { provider: 'manual', payload: {} },
          });
      }

      // 'zebra' tag used in 1 reference
      await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Paper 4',
          tags: ['zebra'],
          sourceRaw: { provider: 'manual', payload: {} },
        });

      const response = await request(app)
        .get('/api/bibliography/tags')
        .expect(200);

      // Tags should be sorted by usageCount descending (alpha: 3, zebra: 1)
      expect(response.body.data[0].name).toBe('alpha');
      expect(response.body.data[0].usageCount).toBe(3);
      expect(response.body.data[1].name).toBe('zebra');
      expect(response.body.data[1].usageCount).toBe(1);
    });
  });

  describe('PATCH /api/bibliography/tags/:id', () => {
    it('should update tag name', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'original' });

      const tagId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/tags/${tagId}`)
        .send({ name: 'updated' })
        .expect(200);

      expect(response.body.data.name).toBe('updated');
    });

    it('should update tag color', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'test-tag' });

      const tagId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/tags/${tagId}`)
        .send({ color: '#00FF00', position: 2 })
        .expect(200);

      expect(response.body.data.color).toBe('#00FF00');
      expect(response.body.data.position).toBe(2);
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app)
        .patch('/api/bibliography/tags/507f1f77bcf86cd799439011')
        .send({ name: 'new-name' })
        .expect(404);
    });
  });

  describe('PATCH /api/bibliography/tags/:name/color', () => {
    it('should update tag color by name', async () => {
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'my-tag' });

      const response = await request(app)
        .patch('/api/bibliography/tags/my-tag/color')
        .send({ color: '#0000FF', position: 3 })
        .expect(200);

      expect(response.body.data.name).toBe('my-tag');
      expect(response.body.data.color).toBe('#0000FF');
      expect(response.body.data.position).toBe(3);
    });

    it('should enforce max 9 colored tags', async () => {
      // Create 9 colored tags
      for (let i = 1; i <= 9; i++) {
        await request(app)
          .post('/api/bibliography/tags')
          .send({ name: `tag${i}`, color: '#FF0000', position: i });
      }

      // Try to create 10th colored tag
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'tag10' });

      const response = await request(app)
        .patch('/api/bibliography/tags/tag10/color')
        .send({ color: '#FF0000', position: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('MAX_COLORED_TAGS');
    });

    it('should enforce position between 1 and 9', async () => {
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'test-tag' });

      const response = await request(app)
        .patch('/api/bibliography/tags/test-tag/color')
        .send({ color: '#FF0000', position: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('INVALID_POSITION');
    });

    it('should allow removing color', async () => {
      await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'colored-tag', color: '#FF0000', position: 1 });

      const response = await request(app)
        .patch('/api/bibliography/tags/colored-tag/color')
        .send({ color: null, position: null })
        .expect(200);

      expect(response.body.data.color).toBe(null);
      expect(response.body.data.position).toBe(null);
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app)
        .patch('/api/bibliography/tags/non-existent/color')
        .send({ color: '#FF0000', position: 1 })
        .expect(404);
    });
  });

  describe('DELETE /api/bibliography/tags/:id', () => {
    it('should delete a tag', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/tags')
        .send({ name: 'to-delete' });

      const tagId = createResponse.body.data._id;

      await request(app)
        .delete(`/api/bibliography/tags/${tagId}`)
        .expect(204);

      // Verify tag is deleted
      const listResponse = await request(app).get('/api/bibliography/tags');
      expect(listResponse.body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app)
        .delete('/api/bibliography/tags/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });
});
