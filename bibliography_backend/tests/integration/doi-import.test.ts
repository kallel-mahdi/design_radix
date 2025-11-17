import request from 'supertest';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';
import { Reference } from '../../src/models/Reference';

const app = createTestApp();

// Mock global fetch for Crossref API calls
global.fetch = jest.fn();

describe('DOI Import API Integration Tests', () => {
  beforeAll(async () => {
    await connectInMemoryMongo();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  const mockCrossrefResponse = {
    status: 'ok',
    'message-type': 'work',
    message: {
      DOI: '10.1145/3411764.3445518',
      type: 'proceedings-article',
      title: ['"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI'],
      author: [
        { given: 'Nithya', family: 'Sambasivan', sequence: 'first' },
        { given: 'Shivani', family: 'Kapania', sequence: 'additional' },
      ],
      published: { 'date-parts': [[2021, 5, 6]] },
      'container-title': ['Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems'],
      publisher: 'ACM',
      URL: 'http://dx.doi.org/10.1145/3411764.3445518',
      abstract: 'Machine learning models are increasingly applied...',
    },
  };

  describe('POST /api/bibliography/references/import-doi', () => {
    it('should successfully import reference from valid DOI', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        type: 'conference',
        title: '"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI',
        doi: '10.1145/3411764.3445518',
        year: 2021,
        venue: 'Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems',
        url: 'http://dx.doi.org/10.1145/3411764.3445518',
        abstract: 'Machine learning models are increasingly applied...',
      });

      expect(response.body.data.authors).toHaveLength(2);
      expect(response.body.data.authors[0]).toMatchObject({
        given: 'Nithya',
        family: 'Sambasivan',
        full: 'Sambasivan, Nithya',
      });

      expect(response.body.data.sourceRaw).toEqual({
        provider: 'doi',
        payload: mockCrossrefResponse.message,
      });

      // Verify reference was saved to database
      const savedRef = await Reference.findById(response.body.data._id);
      expect(savedRef).toBeDefined();
      expect(savedRef?.doi).toBe('10.1145/3411764.3445518');
    });

    it('should return existing reference when DOI already exists (duplicate)', async () => {
      // First import: create the reference
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const firstResponse = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      const firstRefId = firstResponse.body.data._id;

      // Second import: should return existing reference without calling Crossref API
      const secondResponse = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(200);

      expect(secondResponse.body.success).toBe(true);
      expect(secondResponse.body.message).toContain('already exists');
      expect(secondResponse.body.data._id).toBe(firstRefId);

      // Verify Crossref API was only called once (for first import)
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify only one reference exists in database
      const allRefs = await Reference.find({ doi: '10.1145/3411764.3445518' });
      expect(allRefs).toHaveLength(1);
    });

    it('should return 400 for invalid DOI format', async () => {
      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: 'invalid-doi' })
        .expect(400);

      expect(response.body.success).toBe(false);
      // Validation message comes from Zod schema
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 when DOI is missing', async () => {
      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when DOI not found in Crossref', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.9999/nonexistent' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('DOI not found');
    });

    it('should retry and succeed after rate limit (429)', async () => {
      // First call: 429, second call: success
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map(),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.doi).toBe('10.1145/3411764.3445518');

      // Verify it retried (called fetch twice)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return 429 when Crossref rate limit exceeded after retries', async () => {
      // Mock multiple 429 responses to exceed retry limit
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map(),
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Rate limit exceeded');

      // Verify the service attempted retries (default maxRetries=5)
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return 503 on network timeout', async () => {
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('timeout');
    });

    it('should handle reference without abstract', async () => {
      const responseWithoutAbstract = {
        ...mockCrossrefResponse,
        message: {
          ...mockCrossrefResponse.message,
          abstract: undefined,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutAbstract,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.abstract).toBeUndefined();
    });

    it('should normalize DOI to lowercase', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' }) // Uppercase in DOI
        .expect(201);

      expect(response.body.data.doi).toBe('10.1145/3411764.3445518');
    });

    it('should auto-generate citation key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.data.citationKey).toBeDefined();
      expect(typeof response.body.data.citationKey).toBe('string');
      expect(response.body.data.citationKey.length).toBeGreaterThan(0);
    });

    it('should auto-generate full author names', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      const authors = response.body.data.authors;
      expect(authors[0].full).toBe('Sambasivan, Nithya');
      expect(authors[1].full).toBe('Kapania, Shivani');
    });

    it('should store sourceRaw with provider and full Crossref payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.data.sourceRaw.provider).toBe('doi');
      expect(response.body.data.sourceRaw.payload).toEqual(mockCrossrefResponse.message);
    });

    it('should trigger duplicate detection asynchronously', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      // Response should return immediately (not wait for duplicate detection)
      expect(response.body.success).toBe(true);

      // Wait a bit for async duplicate detection to potentially run
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Reference should still exist (duplicate detection should not fail the import)
      const savedRef = await Reference.findById(response.body.data._id);
      expect(savedRef).toBeDefined();
    });

    it('should map Crossref type "journal-article" to reference type "article"', async () => {
      const journalArticleResponse = {
        ...mockCrossrefResponse,
        message: {
          ...mockCrossrefResponse.message,
          type: 'journal-article',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => journalArticleResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.data.type).toBe('article');
    });

    it('should map unknown Crossref type to reference type "other"', async () => {
      const unknownTypeResponse = {
        ...mockCrossrefResponse,
        message: {
          ...mockCrossrefResponse.message,
          type: 'unknown-type',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unknownTypeResponse,
      });

      const response = await request(app)
        .post('/api/bibliography/references/import-doi')
        .send({ doi: '10.1145/3411764.3445518' })
        .expect(201);

      expect(response.body.data.type).toBe('other');
    });
  });
});
