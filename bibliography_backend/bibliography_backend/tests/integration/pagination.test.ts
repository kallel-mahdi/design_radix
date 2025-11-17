import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();
const userId = 'test-user-123';

describe('Pagination Guardrails', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should reject limit above 1000', async () => {
    const response = await request(app)
      .get('/api/bibliography/references?limit=5000')
      .set('x-user-id', userId)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('should enforce minimum limit of 1', async () => {
    const response = await request(app)
      .get('/api/bibliography/references?limit=0')
      .set('x-user-id', userId)
      .expect(400); // Validation should reject 0

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return pagination metadata', async () => {
    // Create a few references
    await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', userId)
      .send({
        type: 'article',
        title: 'Test Article 1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

    await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', userId)
      .send({
        type: 'article',
        title: 'Test Article 2',
        sourceRaw: { provider: 'manual', payload: {} },
      });

    const response = await request(app)
      .get('/api/bibliography/references')
      .set('x-user-id', userId)
      .expect(200);

    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toMatchObject({
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number),
      hasMore: expect.any(Boolean)
    });
    expect(response.body.pagination.total).toBe(2);
  });

  it('should handle offset pagination correctly', async () => {
    // Create 5 references
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', userId)
        .send({
          type: 'article',
          title: `Test Article ${i}`,
          sourceRaw: { provider: 'manual', payload: {} },
        });
    }

    // Get page 2 with limit 2
    const response = await request(app)
      .get('/api/bibliography/references?limit=2&offset=2')
      .set('x-user-id', userId)
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.offset).toBe(2);
    expect(response.body.pagination.hasMore).toBe(true);
  });

  it('should indicate no more pages when at end', async () => {
    // Create 3 references
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/bibliography/references')
        .set('x-user-id', userId)
        .send({
          type: 'article',
          title: `Test Article ${i}`,
          sourceRaw: { provider: 'manual', payload: {} },
        });
    }

    // Get all with limit 10
    const response = await request(app)
      .get('/api/bibliography/references?limit=10')
      .set('x-user-id', userId)
      .expect(200);

    expect(response.body.pagination.hasMore).toBe(false);
    expect(response.body.data).toHaveLength(3);
  });
});
