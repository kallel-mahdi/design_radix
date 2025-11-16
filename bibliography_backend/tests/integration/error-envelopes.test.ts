import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';

const app = createTestApp();
const userId = 'test-user-123';

describe('Error Envelope Structure', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should return standard error format for validation errors', async () => {
    const response = await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', userId)
      .send({ title: '' }); // Invalid data - missing required fields

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: expect.any(String),
      code: 'VALIDATION_ERROR',
    });
    expect(response.body).toHaveProperty('details');
  });

  it('should return 404 with NOT_FOUND code', async () => {
    const response = await request(app)
      .get('/api/bibliography/references/000000000000000000000000')
      .set('x-user-id', userId)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body).toHaveProperty('message');
  });

  // TODO: Add test for DUPLICATE_KEY code once update method implements duplicate key handling
  // Currently the update method doesn't catch MongoDB unique index violations
  it.skip('should return DUPLICATE_KEY code for citation key conflicts', async () => {
    // Test skipped - duplicate key handling not fully implemented in update method
  });

  it('should return validation error for invalid ObjectId', async () => {
    const response = await request(app)
      .get('/api/bibliography/references/invalid-id')
      .set('x-user-id', userId)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.message).toContain('Invalid');
  });

  it('should return validation error for invalid query parameters', async () => {
    const response = await request(app)
      .get('/api/bibliography/references?limit=-5')
      .set('x-user-id', userId)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return validation error for invalid enum values', async () => {
    const response = await request(app)
      .post('/api/bibliography/duplicates/000000000000000000000000/resolve')
      .set('x-user-id', userId)
      .send({ action: 'invalid-action' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('should include error details array for validation errors', async () => {
    const response = await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', userId)
      .send({
        type: 'invalid-type',
        // Missing title and sourceRaw
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details.length).toBeGreaterThan(0);
    expect(response.body.details[0]).toHaveProperty('field');
    expect(response.body.details[0]).toHaveProperty('message');
  });
});
