import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

/**
 * User Scoping Integration Tests
 *
 * Verifies that users can only access their own data:
 * - References: CRUD operations isolated by userId
 * - Collections: CRUD operations isolated by userId
 * - Tags: CRUD operations isolated by userId
 * - Missing auth headers return 401
 * - Bypass auth works in development
 *
 * Security-critical: Ensures users cannot access/modify other users' data
 */

describe('User Scoping Integration Tests', () => {
  const USER_A_ID = 'user-a-123';
  const USER_B_ID = 'user-b-456';

  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Reference Scoping', () => {
    it('should isolate references by userId - User A cannot see User B references', async () => {
      // User A creates a reference
      const refA = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_A_ID)
        .send({
          type: 'article',
          title: 'User A Reference',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      // User B creates a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'User B Reference',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      // User A lists references - should only see their own
      const listA = await request(app)
        .get('/api/bibliography/references')
        .set('x-user-id', USER_A_ID)
        .expect(200);

      expect(listA.body.data).toHaveLength(1);
      expect(listA.body.data[0]._id).toBe(refA.body.data._id);
      expect(listA.body.data[0].title).toBe('User A Reference');

      // User B lists references - should only see their own
      const listB = await request(app)
        .get('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(listB.body.data).toHaveLength(1);
      expect(listB.body.data[0]._id).toBe(refB.body.data._id);
      expect(listB.body.data[0].title).toBe('User B Reference');
    });

    it('should prevent User A from getting User B reference by ID', async () => {
      // User B creates a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'book',
          title: 'User B Secret Book',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      const refBId = refB.body.data._id;

      // User A tries to get User B's reference by ID - should return 404
      const response = await request(app)
        .get(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_A_ID)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should prevent User A from updating User B reference', async () => {
      // User B creates a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'Original Title',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      const refBId = refB.body.data._id;

      // User A tries to update User B's reference - should return 404
      await request(app)
        .patch(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_A_ID)
        .send({ title: 'Hacked Title' })
        .expect(404);

      // Verify reference was not modified
      const checkRef = await request(app)
        .get(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkRef.body.data.title).toBe('Original Title');
    });

    it('should prevent User A from deleting User B reference', async () => {
      // User B creates a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'Important Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      const refBId = refB.body.data._id;

      // User A tries to delete User B's reference - should return 404
      await request(app)
        .delete(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_A_ID)
        .expect(404);

      // Verify reference still exists
      const checkRef = await request(app)
        .get(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkRef.body.data.deleted).toBe(false);
    });

    it('should prevent User A from restoring User B deleted reference', async () => {
      // User B creates and deletes a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'Deleted Paper',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      const refBId = refB.body.data._id;

      await request(app)
        .delete(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(204);

      // User A tries to restore User B's deleted reference - should return 404
      await request(app)
        .patch(`/api/bibliography/references/${refBId}/restore`)
        .set('x-user-id', USER_A_ID)
        .expect(404);

      // Verify reference is still deleted
      const checkRef = await request(app)
        .get('/api/bibliography/references?deleted=true')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkRef.body.data[0].deleted).toBe(true);
    });
  });

  describe('Collection Scoping', () => {
    it('should isolate collections by userId', async () => {
      // User A creates a collection
      const colA = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_A_ID)
        .send({
          name: 'User A Collection',
        })
        .expect(201);

      // User B creates a collection
      const colB = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_B_ID)
        .send({
          name: 'User B Collection',
        })
        .expect(201);

      // User A lists collections - should only see their own
      const listA = await request(app)
        .get('/api/bibliography/collections')
        .set('x-user-id', USER_A_ID)
        .expect(200);

      expect(listA.body.data).toHaveLength(1);
      expect(listA.body.data[0]._id).toBe(colA.body.data._id);

      // User B lists collections - should only see their own
      const listB = await request(app)
        .get('/api/bibliography/collections')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(listB.body.data).toHaveLength(1);
      expect(listB.body.data[0]._id).toBe(colB.body.data._id);
    });

    it('should prevent User A from accessing User B collection by ID', async () => {
      // User B creates a collection
      const colB = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_B_ID)
        .send({
          name: 'Private Collection',
        })
        .expect(201);

      const colBId = colB.body.data._id;

      // User A tries to get User B's collection - should return 404
      await request(app)
        .get(`/api/bibliography/collections/${colBId}`)
        .set('x-user-id', USER_A_ID)
        .expect(404);
    });

    it('should prevent User A from updating User B collection', async () => {
      // User B creates a collection
      const colB = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_B_ID)
        .send({
          name: 'Original Name',
        })
        .expect(201);

      const colBId = colB.body.data._id;

      // User A tries to update User B's collection - should return 404
      await request(app)
        .patch(`/api/bibliography/collections/${colBId}`)
        .set('x-user-id', USER_A_ID)
        .send({ name: 'Hacked Name' })
        .expect(404);

      // Verify collection was not modified
      const checkCol = await request(app)
        .get(`/api/bibliography/collections/${colBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkCol.body.data.name).toBe('Original Name');
    });

    it('should prevent User A from deleting User B collection', async () => {
      // User B creates a collection
      const colB = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_B_ID)
        .send({
          name: 'Important Collection',
        })
        .expect(201);

      const colBId = colB.body.data._id;

      // User A tries to delete User B's collection - should return 404
      await request(app)
        .delete(`/api/bibliography/collections/${colBId}`)
        .set('x-user-id', USER_A_ID)
        .expect(404);

      // Verify collection still exists
      const checkCol = await request(app)
        .get(`/api/bibliography/collections/${colBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkCol.body.data.deleted).toBe(false);
    });
  });

  describe('Tag Scoping', () => {
    it('should isolate tags by userId', async () => {
      // User A creates tags and references
      await request(app)
        .post('/api/bibliography/tags')
        .set('x-user-id', USER_A_ID)
        .send({ name: 'machine-learning' })
        .expect(201);

      await request(app)
        .post('/api/bibliography/tags')
        .set('x-user-id', USER_A_ID)
        .send({ name: 'ai' })
        .expect(201);

      await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_A_ID)
        .send({
          type: 'article',
          title: 'Paper A',
          tags: ['machine-learning', 'ai'],
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      // User B creates tags and references
      await request(app)
        .post('/api/bibliography/tags')
        .set('x-user-id', USER_B_ID)
        .send({ name: 'deep-learning' })
        .expect(201);

      await request(app)
        .post('/api/bibliography/tags')
        .set('x-user-id', USER_B_ID)
        .send({ name: 'nlp' })
        .expect(201);

      await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'Paper B',
          tags: ['deep-learning', 'nlp'],
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      // User A lists tags - should only see their own
      const listA = await request(app)
        .get('/api/bibliography/tags')
        .set('x-user-id', USER_A_ID)
        .expect(200);

      const tagNamesA = listA.body.data.map((t: any) => t.name);
      expect(tagNamesA).toEqual(expect.arrayContaining(['machine-learning', 'ai']));
      expect(tagNamesA).not.toContain('deep-learning');
      expect(tagNamesA).not.toContain('nlp');

      // User B lists tags - should only see their own
      const listB = await request(app)
        .get('/api/bibliography/tags')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      const tagNamesB = listB.body.data.map((t: any) => t.name);
      expect(tagNamesB).toEqual(expect.arrayContaining(['deep-learning', 'nlp']));
      expect(tagNamesB).not.toContain('machine-learning');
      expect(tagNamesB).not.toContain('ai');
    });

    it('should prevent User A from updating User B tag color', async () => {
      // User B creates a tag explicitly
      await request(app)
        .post('/api/bibliography/tags')
        .set('x-user-id', USER_B_ID)
        .send({ name: 'important-tag' })
        .expect(201);

      await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'Paper B',
          tags: ['important-tag'],
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      // User A tries to set color on User B's tag - should return 404
      await request(app)
        .patch('/api/bibliography/tags/important-tag/color')
        .set('x-user-id', USER_A_ID)
        .send({ color: '#FF0000', position: 1 })
        .expect(404);

      // Verify tag was not modified
      const listB = await request(app)
        .get('/api/bibliography/tags')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      const importantTag = listB.body.data.find((t: any) => t.name === 'important-tag');
      expect(importantTag.color).toBeNull();
    });
  });

  // Note: Authentication header validation tests are skipped because the test app
  // uses bypassGatewayAuth middleware which provides defaults.
  // The trustGatewayAuth middleware itself is responsible for auth validation
  // and would be tested separately if needed.

  describe('Development Bypass Auth', () => {
    it('should use default dev user when bypass auth is enabled', async () => {
      // Create a reference (bypass auth should set user-id automatically)
      const response = await request(app)
        .post('/api/bibliography/references')
        .send({
          type: 'article',
          title: 'Dev Test Reference',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('dev-user-123');
    });

    it('should override bypass auth when explicit x-user-id is provided', async () => {
      // Explicit user ID should override the default dev user
      const response = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', 'specific-user-456')
        .send({
          type: 'article',
          title: 'Specific User Reference',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('specific-user-456');
    });
  });

  describe('Cross-Resource Scoping', () => {
    it('should prevent User A from adding User B reference to User A collection', async () => {
      // User A creates a collection
      const colA = await request(app)
        .post('/api/bibliography/collections')
        .set('x-user-id', USER_A_ID)
        .send({
          name: 'User A Collection',
        })
        .expect(201);

      const colAId = colA.body.data._id;

      // User B creates a reference
      const refB = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .send({
          type: 'article',
          title: 'User B Reference',
          sourceRaw: { provider: 'manual', payload: {} },
        })
        .expect(201);

      const refBId = refB.body.data._id;

      // User A tries to update User B's reference to add it to User A's collection
      await request(app)
        .patch(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_A_ID)
        .send({ collectionIds: [colAId] })
        .expect(404);

      // Verify reference was not modified
      const checkRef = await request(app)
        .get(`/api/bibliography/references/${refBId}`)
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(checkRef.body.data.collectionIds).toHaveLength(0);
    });

    it('should scope DOI import by userId', async () => {
      // User A imports a reference via DOI
      const refA = await request(app)
        .post('/api/bibliography/references/import-doi')
        .set('x-user-id', USER_A_ID)
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      // User B should not see User A's imported reference
      const listB = await request(app)
        .get('/api/bibliography/references')
        .set('x-user-id', USER_B_ID)
        .expect(200);

      expect(listB.body.data).toHaveLength(0);

      // User A should see their imported reference
      const listA = await request(app)
        .get('/api/bibliography/references')
        .set('x-user-id', USER_A_ID)
        .expect(200);

      expect(listA.body.data).toHaveLength(1);
      expect(listA.body.data[0]._id).toBe(refA.body.data._id);
    });
  });
});
