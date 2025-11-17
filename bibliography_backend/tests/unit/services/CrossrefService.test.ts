import 'reflect-metadata';
import { CrossrefService } from '../../../src/services/CrossrefService';
import { ApplicationLogger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  ApplicationLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('CrossrefService', () => {
  let service: CrossrefService;

  beforeEach(() => {
    service = new CrossrefService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchMetadata', () => {
    const mockDoi = '10.1145/3411764.3445518';
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
        abstract: 'Machine learning models...',
      },
    };

    it('should successfully fetch metadata from Crossref API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      const result = await service.fetchMetadata(mockDoi);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.crossref.org/works/${encodeURIComponent(mockDoi)}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('BibliographyManager'),
            'Accept': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockCrossrefResponse.message);
      expect(ApplicationLogger.info).toHaveBeenCalledWith(
        'Fetching Crossref metadata',
        expect.objectContaining({ doi: mockDoi })
      );
    });

    it('should throw error when DOI not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.fetchMetadata(mockDoi)).rejects.toThrow('DOI not found');

      expect(ApplicationLogger.warn).toHaveBeenCalledWith(
        'DOI not found',
        expect.objectContaining({ doi: mockDoi })
      );
    });

    it('should throw error when rate limit exceeded (429)', async () => {
      // Mock multiple 429 responses (exceeding default maxRetries=5)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map(),
      });

      await expect(service.fetchMetadata(mockDoi, 3)).rejects.toThrow('Rate limit exceeded');

      // Should attempt 3 times before throwing
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(ApplicationLogger.warn).toHaveBeenCalledWith(
        'Max retries exceeded',
        expect.objectContaining({ doi: mockDoi, status: 429 })
      );
    });

    it('should throw error on other HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.fetchMetadata(mockDoi)).rejects.toThrow('Crossref API error: Internal Server Error');
    });

    it('should throw error on network timeout', async () => {
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      await expect(service.fetchMetadata(mockDoi)).rejects.toThrow('Request timeout');
      expect(ApplicationLogger.error).toHaveBeenCalled();
    });

    it('should throw error on network failure', async () => {
      // Mock multiple network failures (exceeding maxRetries)
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(service.fetchMetadata(mockDoi, 3)).rejects.toThrow('Network failure');

      // Should attempt 3 times before throwing
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(ApplicationLogger.error).toHaveBeenCalled();
    });

    it('should use polite pool with mailto in User-Agent', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCrossrefResponse,
      });

      await service.fetchMetadata(mockDoi);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['User-Agent']).toContain('mailto:');
    });
  });

  describe('mapToReferenceInput', () => {
    it('should correctly map Crossref data to CreateReferenceInput', () => {
      const crossrefData = {
        DOI: '10.1145/3411764.3445518',
        type: 'proceedings-article',
        title: ['"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI'],
        author: [
          { given: 'Nithya', family: 'Sambasivan' },
          { given: 'Shivani', family: 'Kapania' },
        ],
        published: { 'date-parts': [[2021, 5, 6]] },
        'container-title': ['Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems'],
        URL: 'http://dx.doi.org/10.1145/3411764.3445518',
        abstract: 'Machine learning models...',
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result).toEqual({
        type: 'conference',
        title: '"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI',
        authors: [
          { given: 'Nithya', family: 'Sambasivan' },
          { given: 'Shivani', family: 'Kapania' },
        ],
        year: 2021,
        venue: 'Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems',
        doi: '10.1145/3411764.3445518',
        url: 'http://dx.doi.org/10.1145/3411764.3445518',
        abstract: 'Machine learning models...',
        tags: [],
        collectionIds: [],
        sourceRaw: {
          provider: 'doi',
          payload: crossrefData,
        },
      });
    });

    it('should map type "journal-article" to "article"', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test Article'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.type).toBe('article');
    });

    it('should map type "book-chapter" to "chapter"', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'book-chapter',
        title: ['Test Chapter'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.type).toBe('chapter');
    });

    it('should map unknown type to "other"', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'unknown-type',
        title: ['Test'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.type).toBe('other');
    });

    it('should handle missing optional fields', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Minimal Data'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.type).toBe('article');
      expect(result.title).toBe('Minimal Data');
      expect(result.authors).toEqual([]);
      expect(result.year).toBeUndefined();
      expect(result.venue).toBeUndefined();
      expect(result.abstract).toBeUndefined();
      expect(result.url).toBeUndefined();
    });

    it('should save abstract when Crossref provides it', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test'],
        abstract: 'This is a test abstract',
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.abstract).toBe('This is a test abstract');
    });

    it('should not include abstract when Crossref does not provide it', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.abstract).toBeUndefined();
    });

    it('should lowercase DOI', () => {
      const crossrefData = {
        DOI: '10.1234/TEST',
        type: 'journal-article',
        title: ['Test'],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.doi).toBe('10.1234/test');
    });

    it('should store full Crossref response in sourceRaw.payload', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test'],
        customField: 'custom value',
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.sourceRaw.provider).toBe('doi');
      expect(result.sourceRaw.payload).toEqual(crossrefData);
    });

    it('should handle authors with missing given or family names', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test'],
        author: [
          { given: 'John', family: 'Doe' },
          { family: 'Smith' }, // Missing given
          { given: 'Jane' }, // Missing family
          {}, // Both missing
        ],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.authors).toEqual([
        { given: 'John', family: 'Doe' },
        { given: '', family: 'Smith' },
        { given: 'Jane', family: '' },
        { given: '', family: '' },
      ]);
    });

    it('should use "Untitled" when title is missing', () => {
      const crossrefData = {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: [],
      };

      const result = service.mapToReferenceInput(crossrefData);

      expect(result.title).toBe('Untitled');
    });
  });

  describe('Retry Logic', () => {
    const mockCrossrefResponse = {
      status: 'ok',
      'message-type': 'work',
      message: {
        DOI: '10.1234/test',
        type: 'journal-article',
        title: ['Test Article'],
        author: [{ given: 'John', family: 'Doe' }],
        published: { 'date-parts': [[2024, 1, 1]] },
      },
    };

    it('should retry on 429 rate limit and succeed', async () => {
      // First call: 429, second call: success
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map(),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        } as any);

      const result = await service.fetchMetadata('10.1234/test', 2);

      expect(result).toEqual(mockCrossrefResponse.message);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect Retry-After header with integer seconds', async () => {
      const startTime = Date.now();

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: {
            get: (name: string) => name === 'Retry-After' ? '1' : null,
          },
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        } as any);

      await service.fetchMetadata('10.1234/test', 2);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(900); // Allow some tolerance
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect Retry-After header with HTTP-date format', async () => {
      const futureDate = new Date(Date.now() + 1000);

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: {
            get: (name: string) => name === 'Retry-After' ? futureDate.toUTCString() : null,
          },
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        } as any);

      await service.fetchMetadata('10.1234/test', 2);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries on 429', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Map(),
      } as any);

      await expect(service.fetchMetadata('10.1234/test', 3)).rejects.toThrow('Rate limit exceeded');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 404', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as any);

      await expect(service.fetchMetadata('10.9999/nonexistent')).rejects.toThrow('DOI not found');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 503 service unavailable', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          headers: new Map(),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        } as any);

      const result = await service.fetchMetadata('10.1234/test', 2);

      expect(result).toEqual(mockCrossrefResponse.message);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on network error', async () => {
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCrossrefResponse,
        } as any);

      const result = await service.fetchMetadata('10.1234/test', 2);

      expect(result).toEqual(mockCrossrefResponse.message);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
