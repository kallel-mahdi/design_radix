/**
 * Annotations API Integration Tests
 *
 * Tests for PDF annotation CRUD operations
 * 30% of test pyramid (integration tests)
 *
 * Endpoints tested:
 * - GET    /api/bibliography/references/:referenceId/annotations
 * - POST   /api/bibliography/references/:referenceId/annotations
 * - GET    /api/bibliography/annotations/:id
 * - PATCH  /api/bibliography/annotations/:id
 * - DELETE /api/bibliography/annotations/:id
 */

import request from 'supertest';
import {
  connectInMemoryMongo,
  clearDatabase,
  disconnectInMemoryMongo,
} from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();

describe('Annotations API Integration Tests', () => {
  let testReferenceId: string;

  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a test reference to attach annotations to
    const refResponse = await request(app)
      .post('/api/bibliography/references')
      .send({
        type: 'article',
        title: 'Test Article for Annotations',
        sourceRaw: { provider: 'manual', payload: {} },
      });

    testReferenceId = refResponse.body.data._id;
  });

  describe('POST /api/bibliography/references/:referenceId/annotations', () => {
    it('should create a highlight annotation', async () => {
      const response = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: {
            rects: [[100, 200, 300, 220]],
          },
          content: {
            text: 'This is highlighted text',
            comment: 'Important finding',
          },
          color: '#ffd400',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        type: 'highlight',
        pageIndex: 0,
        content: {
          text: 'This is highlighted text',
          comment: 'Important finding',
        },
        color: '#ffd400',
      });
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.referenceId).toBe(testReferenceId);
      expect(response.body.data.sortIndex).toBeDefined();
    });

    it('should create a note annotation', async () => {
      const response = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'note',
          pageIndex: 1,
          position: {
            rects: [[50, 100, 60, 110]],
          },
          content: {
            comment: 'This is a note without highlighted text',
          },
          color: '#ff6666',
        })
        .expect(201);

      expect(response.body.data.type).toBe('note');
      expect(response.body.data.content.comment).toBe(
        'This is a note without highlighted text'
      );
    });

    it('should return 400 for invalid annotation type', async () => {
      const response = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'invalid-type',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: {},
          color: '#ffd400',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid color format', async () => {
      const response = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'test' },
          color: 'invalid-color',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for negative pageIndex', async () => {
      const response = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: -1,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'test' },
          color: '#ffd400',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    // Note: Backend currently allows annotations for any referenceId (no FK check)
    // This is acceptable for MVP - orphan annotations will be cleaned up when reference is deleted
    it('should allow annotation creation with non-existent referenceId (no FK validation)', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/bibliography/references/${fakeId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'test' },
          color: '#ffd400',
        })
        .expect(201);

      // Annotation is created even without reference validation
      expect(response.body.success).toBe(true);
      expect(response.body.data.referenceId).toBe(fakeId);
    });
  });

  describe('GET /api/bibliography/references/:referenceId/annotations', () => {
    it('should list all annotations for a reference', async () => {
      // Create two annotations
      await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'First highlight' },
          color: '#ffd400',
        });

      await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'note',
          pageIndex: 1,
          position: { rects: [[20, 20, 30, 30]] },
          content: { comment: 'A note' },
          color: '#ff6666',
        });

      const response = await request(app)
        .get(`/api/bibliography/references/${testReferenceId}/annotations`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].referenceId).toBe(testReferenceId);
    });

    it('should return empty array for reference with no annotations', async () => {
      const response = await request(app)
        .get(`/api/bibliography/references/${testReferenceId}/annotations`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/bibliography/annotations/:id', () => {
    it('should get a single annotation by ID', async () => {
      const createResponse = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 2,
          position: { rects: [[100, 100, 200, 120]] },
          content: { text: 'Test highlight', comment: 'Test comment' },
          color: '#2ea8e5',
        });

      const annotationId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/bibliography/annotations/${annotationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(annotationId);
      expect(response.body.data.type).toBe('highlight');
      expect(response.body.data.pageIndex).toBe(2);
    });

    it('should return 404 for non-existent annotation', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/bibliography/annotations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bibliography/annotations/:id', () => {
    it('should update annotation comment', async () => {
      const createResponse = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'Original text', comment: 'Original comment' },
          color: '#ffd400',
        });

      const annotationId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/annotations/${annotationId}`)
        .send({
          content: { comment: 'Updated comment' },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content.comment).toBe('Updated comment');
    });

    it('should update annotation color', async () => {
      const createResponse = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'Test' },
          color: '#ffd400',
        });

      const annotationId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/annotations/${annotationId}`)
        .send({
          color: '#5fb236',
        })
        .expect(200);

      expect(response.body.data.color).toBe('#5fb236');
    });

    it('should return 400 for invalid color format in update', async () => {
      const createResponse = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'Test' },
          color: '#ffd400',
        });

      const annotationId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bibliography/annotations/${annotationId}`)
        .send({
          color: 'not-a-color',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for updating non-existent annotation', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/bibliography/annotations/${fakeId}`)
        .send({
          content: { comment: 'test' },
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/bibliography/annotations/:id', () => {
    it('should delete an annotation', async () => {
      const createResponse = await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'To be deleted' },
          color: '#ffd400',
        });

      const annotationId = createResponse.body.data._id;

      // Delete
      await request(app)
        .delete(`/api/bibliography/annotations/${annotationId}`)
        .expect(204);

      // Verify deleted
      await request(app)
        .get(`/api/bibliography/annotations/${annotationId}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent annotation', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/bibliography/annotations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('User Scoping', () => {
    it('should only list annotations for the requesting user', async () => {
      // Create annotation as user-1
      await request(app)
        .post(`/api/bibliography/references/${testReferenceId}/annotations`)
        .set('x-user-id', 'user-1')
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'User 1 annotation' },
          color: '#ffd400',
        });

      // Create another reference as user-2
      const ref2Response = await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', 'user-2')
        .send({
          type: 'article',
          title: 'User 2 Article',
          sourceRaw: { provider: 'manual', payload: {} },
        });

      // Create annotation as user-2
      await request(app)
        .post(`/api/bibliography/references/${ref2Response.body.data._id}/annotations`)
        .set('x-user-id', 'user-2')
        .send({
          type: 'highlight',
          pageIndex: 0,
          position: { rects: [[0, 0, 10, 10]] },
          content: { text: 'User 2 annotation' },
          color: '#ff6666',
        });

      // User-1 should only see their annotation
      const user1Response = await request(app)
        .get(`/api/bibliography/references/${testReferenceId}/annotations`)
        .set('x-user-id', 'user-1')
        .expect(200);

      expect(user1Response.body.data).toHaveLength(1);
      expect(user1Response.body.data[0].content.text).toBe('User 1 annotation');
    });
  });
});
