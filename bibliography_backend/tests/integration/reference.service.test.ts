import { ReferenceService } from '../../src/services/ReferenceService';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { Reference } from '../../src/models/Reference';

const duplicateServiceMock = {
  detectForReference: jest.fn().mockResolvedValue(undefined)
};

describe('ReferenceService (integration)', () => {
  let service: ReferenceService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    service = new ReferenceService(duplicateServiceMock as any);
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  const basePayload = {
    type: 'article' as const,
    title: 'Test Reference',
    sourceRaw: { provider: 'manual' as const, payload: {} }
  };

  it('creates references and triggers duplicate detection', async () => {
    const reference = await service.create('user-123', basePayload);

    expect(reference._id).toBeDefined();
    expect(reference.citationKey).toEqual(expect.any(String));
    expect(duplicateServiceMock.detectForReference).toHaveBeenCalledWith(
      'user-123',
      reference._id.toString()
    );
  });

  it('lists references with pagination metadata', async () => {
    await service.create('user-123', { ...basePayload, title: 'Paper A' });
    await service.create('user-123', { ...basePayload, title: 'Paper B' });

    const result = await service.list('user-123', { limit: 1, offset: 0 });

    expect(result.total).toBe(2);
    expect(result.references).toHaveLength(1);
    expect(result.references[0].title).toBe('Paper B');
  });

  it('soft deletes, restores, and permanently deletes references', async () => {
    const created = await service.create('user-123', basePayload);
    const id = created._id.toString();

    const softDeleted = await service.softDelete(id, 'user-123');
    expect(softDeleted).toBe(true);

    const trashed = await Reference.findById(id);
    expect(trashed?.deleted).toBe(true);

    const restored = await service.restore(id, 'user-123');
    expect(restored).toBe(true);

    const restoredDoc = await Reference.findById(id);
    expect(restoredDoc?.deleted).toBe(false);

    await service.softDelete(id, 'user-123');
    const permanentlyDeleted = await service.permanentDelete(id, 'user-123');
    expect(permanentlyDeleted).toBe(true);

    const missing = await Reference.findById(id);
    expect(missing).toBeNull();
  });
});
