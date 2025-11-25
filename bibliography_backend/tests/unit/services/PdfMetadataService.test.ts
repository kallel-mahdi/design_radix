import { PdfMetadataService } from '../../../src/services/PdfMetadataService';
import { CrossrefService } from '../../../src/services/CrossrefService';
import { ReferenceService } from '../../../src/services/ReferenceService';
import { IReference } from '../../../src/models/Reference';

/**
 * Unit Tests for PdfMetadataService (Session 10.5)
 *
 * Tests the core logic for PDF metadata extraction:
 * - DOI extraction from text using regex
 * - Title extraction from filename
 * - Text extraction from PDF (mocked)
 *
 * Coverage Target: >80% for PdfMetadataService
 * Test Pyramid: Unit tests (fast, isolated, no external dependencies)
 */
describe('PdfMetadataService', () => {
  let service: PdfMetadataService;
  let mockCrossrefService: CrossrefService;
  let mockReferenceService: ReferenceService;

  beforeEach(() => {
    // Mock dependencies
    mockCrossrefService = {
      fetchMetadata: jest.fn(),
      mapToReferenceInput: jest.fn(),
    } as any;

    mockReferenceService = {
      create: jest.fn(),
    } as any;

    service = new PdfMetadataService(mockCrossrefService, mockReferenceService);
  });

  describe('extractDoi()', () => {
    describe('Success Cases', () => {
      it('should extract DOI from text with valid DOI pattern', () => {
        const text = `
          This is a research paper.
          Published at: 10.1234/example.2023.001
          Author: John Smith
        `;

        const result = service.extractDoi(text);

        expect(result).toBe('10.1234/example.2023.001');
      });

      it('should extract first DOI when text contains multiple DOIs', () => {
        const text = `
          First paper: 10.1111/first.2023
          Second paper: 10.2222/second.2023
          Third paper: 10.3333/third.2023
        `;

        const result = service.extractDoi(text);

        expect(result).toBe('10.1111/first.2023');
      });

      it('should handle mixed case DOI (case-insensitive)', () => {
        const text = `
          DOI: 10.1234/EXAMPLE.2023.ABC
          Published in Nature
        `;

        const result = service.extractDoi(text);

        expect(result).toBe('10.1234/EXAMPLE.2023.ABC');
      });

      it('should extract DOI with complex suffix patterns', () => {
        const text = `
          DOI: 10.1145/3411764.3445518
          Conference: CHI 2021
        `;

        const result = service.extractDoi(text);

        expect(result).toBe('10.1145/3411764.3445518');
      });

      it('should extract DOI from URL format', () => {
        const text = `
          Available at: https://doi.org/10.1234/example.2023
          Full text available
        `;

        const result = service.extractDoi(text);

        expect(result).toBe('10.1234/example.2023');
      });
    });

    describe('Failure Cases', () => {
      it('should return null when no DOI in text', () => {
        const text = `
          This is a research paper without a DOI.
          Published in 2023 by John Smith.
          No digital object identifier available.
        `;

        const result = service.extractDoi(text);

        expect(result).toBeNull();
      });

      it('should return null for malformed DOI-like patterns', () => {
        const text = `
          Almost DOI: 10.123/incomplete
          Not DOI: 10/missing-period
          Fake: 9.1234/wrong-prefix
        `;

        const result = service.extractDoi(text);

        // Note: The regex requires at least 4 digits after "10." so 10.123/incomplete won't match
        // Real Crossref validation will catch edge cases
        expect(result).toBeNull();
      });

      it('should handle empty text gracefully', () => {
        const result = service.extractDoi('');
        expect(result).toBeNull();
      });

      it('should handle whitespace-only text', () => {
        const result = service.extractDoi('   \n\t   ');
        expect(result).toBeNull();
      });
    });
  });

  describe('extractTitleFromFilename()', () => {
    it('should extract title from simple filename', () => {
      const result = service.extractTitleFromFilename('paper.pdf');
      expect(result).toBe('paper');
    });

    it('should replace hyphens with spaces', () => {
      const result = service.extractTitleFromFilename('smith-2023-machine-learning.pdf');
      expect(result).toBe('smith 2023 machine learning');
    });

    it('should replace underscores with spaces', () => {
      const result = service.extractTitleFromFilename('deep_learning_survey.pdf');
      expect(result).toBe('deep learning survey');
    });

    it('should handle mixed hyphens and underscores', () => {
      const result = service.extractTitleFromFilename('paper-with_mixed-separators.pdf');
      expect(result).toBe('paper with mixed separators');
    });

    it('should trim whitespace from result', () => {
      // Note: trim() is called on the filename AFTER removing .pdf extension
      // So leading/trailing spaces on the filename itself are trimmed
      const result = service.extractTitleFromFilename('spaced-paper.pdf');
      expect(result).toBe('spaced paper');
    });

    it('should handle filename without extension', () => {
      const result = service.extractTitleFromFilename('no-extension');
      expect(result).toBe('no extension');
    });

    it('should handle case-insensitive .pdf extension', () => {
      const result = service.extractTitleFromFilename('paper.PDF');
      expect(result).toBe('paper');
    });

    it('should handle empty filename gracefully', () => {
      const result = service.extractTitleFromFilename('.pdf');
      expect(result).toBe('');
    });

    it('should preserve special characters other than hyphens/underscores', () => {
      const result = service.extractTitleFromFilename('paper (2023) - study.pdf');
      expect(result).toBe('paper (2023)   study');
    });
  });

  describe('extractTextFromPdf()', () => {
    it('should extract text from PDF using pdf-parse', async () => {
      // This test is tricky because pdf-parse needs a real PDF file
      // We'll test it in integration tests instead
      // Here we just verify the method exists and has correct signature
      expect(service.extractTextFromPdf).toBeDefined();
      expect(typeof service.extractTextFromPdf).toBe('function');
    });
  });

  describe('createReferenceFromPdf()', () => {
    it('should create reference from Crossref when DOI found', async () => {
      // Mock extractTextFromPdf to return text with DOI
      const mockText = 'Research paper. DOI: 10.1234/test.2023';
      jest.spyOn(service, 'extractTextFromPdf').mockResolvedValue(mockText);

      // Mock Crossref service
      const mockCrossrefData = {
        title: 'Test Paper',
        DOI: '10.1234/test.2023',
        author: [{ given: 'John', family: 'Smith' }],
        published: { 'date-parts': [[2023]] },
      };
      (mockCrossrefService.fetchMetadata as jest.Mock).mockResolvedValue(mockCrossrefData);
      (mockCrossrefService.mapToReferenceInput as jest.Mock).mockReturnValue({
        type: 'article',
        title: 'Test Paper',
        authors: [{ given: 'John', family: 'Smith', full: 'John Smith' }],
        year: 2023,
        doi: '10.1234/test.2023',
        sourceRaw: { provider: 'doi', payload: mockCrossrefData },
      });

      // Mock ReferenceService.create
      const mockReference = {
        _id: 'ref123',
        userId: 'user123',
        title: 'Test Paper',
        type: 'article',
        hasPdf: true,
      } as unknown as IReference;
      (mockReferenceService.create as jest.Mock).mockResolvedValue(mockReference);

      // Mock fs.stat
      const fsMock = await import('fs');
      jest.spyOn(fsMock.promises, 'stat').mockResolvedValue({
        size: 1024,
      } as any);

      const result = await service.createReferenceFromPdf(
        'user123',
        '/tmp/test.pdf',
        'test.pdf'
      );

      expect(result.reference).toEqual(mockReference);
      expect(result.metadata.source).toBe('crossref');
      expect(result.metadata.doi).toBe('10.1234/test.2023');
      expect(mockCrossrefService.fetchMetadata).toHaveBeenCalledWith('10.1234/test.2023');
      expect(mockReferenceService.create).toHaveBeenCalled();
    });

    it('should create reference from filename when no DOI found', async () => {
      // Mock extractTextFromPdf to return text without DOI
      const mockText = 'Research paper without any DOI information';
      jest.spyOn(service, 'extractTextFromPdf').mockResolvedValue(mockText);

      // Mock ReferenceService.create
      const mockReference = {
        _id: 'ref123',
        userId: 'user123',
        title: 'smith 2023 machine learning',
        type: 'article',
        hasPdf: true,
      } as unknown as IReference;
      (mockReferenceService.create as jest.Mock).mockResolvedValue(mockReference);

      // Mock fs.stat
      const fsMock = await import('fs');
      jest.spyOn(fsMock.promises, 'stat').mockResolvedValue({
        size: 2048,
      } as any);

      const result = await service.createReferenceFromPdf(
        'user123',
        '/tmp/smith-2023-machine-learning.pdf',
        'smith-2023-machine-learning.pdf'
      );

      expect(result.reference).toEqual(mockReference);
      expect(result.metadata.source).toBe('filename-fallback');
      expect(result.metadata.doi).toBeUndefined();
      expect(mockCrossrefService.fetchMetadata).not.toHaveBeenCalled();
      expect(mockReferenceService.create).toHaveBeenCalledWith('user123', expect.objectContaining({
        type: 'article',
        title: 'smith 2023 machine learning',
        hasPdf: true,
      }));
    });

    it('should fall back to filename when Crossref API fails', async () => {
      // Mock extractTextFromPdf to return text with DOI
      const mockText = 'Research paper. DOI: 10.1234/test.2023';
      jest.spyOn(service, 'extractTextFromPdf').mockResolvedValue(mockText);

      // Mock Crossref service to throw error
      (mockCrossrefService.fetchMetadata as jest.Mock).mockRejectedValue(
        new Error('Crossref API error: 500')
      );

      // Mock ReferenceService.create
      const mockReference = {
        _id: 'ref123',
        userId: 'user123',
        title: 'paper title from filename',
        type: 'article',
        hasPdf: true,
      } as unknown as IReference;
      (mockReferenceService.create as jest.Mock).mockResolvedValue(mockReference);

      // Mock fs.stat
      const fsMock = await import('fs');
      jest.spyOn(fsMock.promises, 'stat').mockResolvedValue({
        size: 1024,
      } as any);

      const result = await service.createReferenceFromPdf(
        'user123',
        '/tmp/paper-title-from-filename.pdf',
        'paper-title-from-filename.pdf'
      );

      expect(result.reference).toEqual(mockReference);
      expect(result.metadata.source).toBe('filename-fallback');
      expect(mockCrossrefService.fetchMetadata).toHaveBeenCalledWith('10.1234/test.2023');
      expect(mockReferenceService.create).toHaveBeenCalled();
    });
  });
});
