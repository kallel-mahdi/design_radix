import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';
import { Tag } from '../../src/models/Tag';

const app = createTestApp();
const userId = 'test-user-123';

describe('Tag Color Slot Management', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  // Helper to create a colored tag
  async function createColoredTag(name: string, color: string, position?: number): Promise<any> {
    // First create the tag
    await request(app)
      .post('/api/bibliography/tags')
      .set('x-user-id', userId)
      .send({ name });

    // Then set its color
    const payload: any = { color };
    if (position !== undefined) {
      payload.position = position;
    }

    const response = await request(app)
      .patch(`/api/bibliography/tags/${name}/color`)
      .set('x-user-id', userId)
      .send(payload);

    return response.body.data;
  }

  it('should auto-assign first available position', async () => {
    // Create tags at positions 1, 2, 4, 5
    await createColoredTag('Tag1', '#FF0000', 1);
    await createColoredTag('Tag2', '#00FF00', 2);
    await createColoredTag('Tag4', '#0000FF', 4);
    await createColoredTag('Tag5', '#FFFF00', 5);

    // Create tag for new color assignment
    await request(app)
      .post('/api/bibliography/tags')
      .set('x-user-id', userId)
      .send({ name: 'NewTag' });

    // Assign color without position (should auto-assign to position 3)
    const response = await request(app)
      .patch('/api/bibliography/tags/NewTag/color')
      .set('x-user-id', userId)
      .send({ color: '#FF00FF' })
      .expect(200);

    expect(response.body.data.position).toBe(3); // First gap
    expect(response.body.data.color).toBe('#FF00FF');
  });

  it('should renumber positions when color removed', async () => {
    // Create tags at positions 1-5
    await createColoredTag('Tag1', '#111000', 1);
    await createColoredTag('Tag2', '#222000', 2);
    await createColoredTag('Tag3', '#333000', 3);
    await createColoredTag('Tag4', '#444000', 4);
    await createColoredTag('Tag5', '#555000', 5);

    // Remove color from position 3
    await request(app)
      .patch('/api/bibliography/tags/Tag3/color')
      .set('x-user-id', userId)
      .send({ color: null })
      .expect(200);

    // Verify positions 4,5 shifted down to 3,4
    const updated = await Tag.find({ userId, color: { $ne: null } })
      .sort('position');

    expect(updated.length).toBe(4);
    expect(updated.map(t => t.position)).toEqual([1, 2, 3, 4]);
    expect(updated.map(t => t.name)).toEqual(['Tag1', 'Tag2', 'Tag4', 'Tag5']);
  });

  it('should enforce max 9 colored tags', async () => {
    // Create 9 colored tags
    for (let i = 0; i < 9; i++) {
      await createColoredTag(`Tag${i}`, `#${i}${i}${i}000`, i + 1);
    }

    // Create 10th tag
    await request(app)
      .post('/api/bibliography/tags')
      .set('x-user-id', userId)
      .send({ name: 'Tag10' });

    // Try to assign color to 10th tag
    const response = await request(app)
      .patch('/api/bibliography/tags/Tag10/color')
      .set('x-user-id', userId)
      .send({ color: '#FFFFFF' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('MAX_COLORED_TAGS');
  });

  it('should allow reassigning position of existing colored tag', async () => {
    // Create tags at positions 1, 2, 3
    await createColoredTag('Tag1', '#FF0000', 1);
    await createColoredTag('Tag2', '#00FF00', 2);
    await createColoredTag('Tag3', '#0000FF', 3);

    // Try to move Tag1 to position 5 (should succeed)
    const response = await request(app)
      .patch('/api/bibliography/tags/Tag1/color')
      .set('x-user-id', userId)
      .send({ color: '#FF0000', position: 5 })
      .expect(200);

    expect(response.body.data.position).toBe(5);
  });

  it('should reject position assignment to occupied slot', async () => {
    // Create tags at positions 1, 2
    await createColoredTag('Tag1', '#FF0000', 1);
    await createColoredTag('Tag2', '#00FF00', 2);

    // Create third tag
    await request(app)
      .post('/api/bibliography/tags')
      .set('x-user-id', userId)
      .send({ name: 'Tag3' });

    // Try to assign color at position 1 (occupied)
    const response = await request(app)
      .patch('/api/bibliography/tags/Tag3/color')
      .set('x-user-id', userId)
      .send({ color: '#0000FF', position: 1 })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('POSITION_TAKEN');
  });

  it('should reject position outside 1-9 range', async () => {
    // Create tag
    await request(app)
      .post('/api/bibliography/tags')
      .set('x-user-id', userId)
      .send({ name: 'Tag1' });

    // Try to assign position 10
    const response = await request(app)
      .patch('/api/bibliography/tags/Tag1/color')
      .set('x-user-id', userId)
      .send({ color: '#FF0000', position: 10 })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('INVALID_POSITION');
  });

  it('should clear position when color is removed', async () => {
    // Create colored tag
    const tag = await createColoredTag('Tag1', '#FF0000', 1);
    expect(tag.position).toBe(1);

    // Remove color
    const response = await request(app)
      .patch('/api/bibliography/tags/Tag1/color')
      .set('x-user-id', userId)
      .send({ color: null })
      .expect(200);

    expect(response.body.data.color).toBeNull();
    expect(response.body.data.position).toBeNull();
  });
});
