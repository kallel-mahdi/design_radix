import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('Collections API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/bibliography/collections', () => {
    it('should create a collection', async () => {
      const response = await request(app)
        .post('/api/bibliography/collections')
        .send({
          name: 'Machine Learning Papers',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Machine Learning Papers',
        parentId: null,
        position: 0,
      });
      expect(response.body.data._id).toBeDefined();
    });

    it('should create a nested collection', async () => {
      // Create parent
      const parentResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Parent Collection' });

      const parentId = parentResponse.body.data._id;

      // Create child
      const childResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({
          name: 'Child Collection',
          parentId: parentId,
        })
        .expect(201);

      expect(childResponse.body.data.parentId).toBe(parentId);
      expect(childResponse.body.data.name).toBe('Child Collection');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/bibliography/collections')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/bibliography/collections', () => {
    it('should list all collections', async () => {
      // Create multiple collections
      await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Collection 1' });

      await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Collection 2' });

      const response = await request(app)
        .get('/api/bibliography/collections')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Collection 1');
      expect(response.body.data[1].name).toBe('Collection 2');
    });

    it('should return empty array when no collections', async () => {
      const response = await request(app)
        .get('/api/bibliography/collections')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/bibliography/collections/:id', () => {
    it('should get a collection by id', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Test Collection' });

      const collectionId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/bibliography/collections/${collectionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Collection');
      expect(response.body.data._id).toBe(collectionId);
    });

    it('should return 404 for non-existent collection', async () => {
      const response = await request(app)
        .get('/api/bibliography/collections/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bibliography/collections/:id', () => {
    it('should update collection name', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Original Name' });

      const collectionId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/collections/${collectionId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data._id).toBe(collectionId);
    });

    it('should update collection position', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'Test Collection' });

      const collectionId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/collections/${collectionId}`)
        .send({ position: 5 })
        .expect(200);

      expect(response.body.data.position).toBe(5);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .patch('/api/bibliography/collections/507f1f77bcf86cd799439011')
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/bibliography/collections/:id', () => {
    it('should delete a collection', async () => {
      const createResponse = await request(app)
        .post('/api/bibliography/collections')
        .send({ name: 'To Delete' });

      const collectionId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/bibliography/collections/${collectionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await request(app)
        .get(`/api/bibliography/collections/${collectionId}`)
        .expect(404);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .delete('/api/bibliography/collections/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });
});
