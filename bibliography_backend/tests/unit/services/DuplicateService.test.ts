import { DuplicateService } from '../../../src/services/DuplicateService';
import { Reference } from '../../../src/models/Reference';
import { DuplicateCandidate } from '../../../src/models/DuplicateCandidate';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../../utils/mongoMemoryServer';

describe('DuplicateService Unit Tests', () => {
  let service: DuplicateService;

  beforeAll(async () => {
    await connectInMemoryMongo();
    service = new DuplicateService();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('detectForReference - ISBN matching', () => {
    it('should detect duplicate by ISBN', async () => {
      // Create existing reference with ISBN
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'book',
        title: 'Machine Learning Book',
        isbn: '978-0-123456-78-9',
        citationKey: 'ml2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      // Create new reference with same ISBN
      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'book',
        title: 'ML Book (Different Title)',
        isbn: '978-0-123456-78-9',
        citationKey: 'ml2024new',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(1);
      expect(candidates[0].matchReason).toBe('isbn');
      expect(candidates[0].confidence).toBe(0.95);
      expect(candidates[0].existingReferenceId.toString()).toBe(existing._id.toString());
    });

    it('should not detect duplicates with different ISBN', async () => {
      await Reference.create({
        userId: 'user-123',
        type: 'book',
        title: 'Book 1',
        isbn: '978-0-111111-11-1',
        citationKey: 'book1',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'book',
        title: 'Book 2',
        isbn: '978-0-222222-22-2',
        citationKey: 'book2',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(0);
    });
  });

  describe('detectForReference - DOI matching', () => {
    it('should detect duplicate by DOI', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Research Paper',
        doi: '10.1234/test',
        citationKey: 'paper2024',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Same Paper',
        doi: '10.1234/test',
        citationKey: 'paper2024new',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(1);
      expect(candidates[0].matchReason).toBe('doi');
      expect(candidates[0].confidence).toBe(0.9);
    });

    it('should not detect duplicates with different DOI', async () => {
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        doi: '10.1111/paper1',
        citationKey: 'paper1',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 2',
        doi: '10.2222/paper2',
        citationKey: 'paper2',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(0);
    });
  });

  describe('detectForReference - Title + Author matching', () => {
    it('should detect duplicate by title and first author', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Deep Learning for NLP',
        authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
        citationKey: 'doe2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Deep Learning for NLP',
        authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
        citationKey: 'doe2024new',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(1);
      expect(candidates[0].matchReason).toBe('title-creator');
      expect(candidates[0].confidence).toBeGreaterThan(0.85);
    });

    it('should detect near-duplicate titles with same author', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Machine Learning: A Comprehensive Guide',
        authors: [{ given: 'Jane', family: 'Smith', full: 'Jane Smith' }],
        citationKey: 'smith2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Machine Learning A Comprehensive Guide',
        authors: [{ given: 'Jane', family: 'Smith', full: 'Jane Smith' }],
        citationKey: 'smith2024new',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(1);
      expect(candidates[0].matchReason).toBe('title-creator');
    });

    it('should not detect duplicates with different authors', async () => {
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Neural Networks',
        authors: [{ given: 'John', family: 'Doe', full: 'John Doe' }],
        citationKey: 'doe2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Neural Networks',
        authors: [{ given: 'Jane', family: 'Smith', full: 'Jane Smith' }],
        citationKey: 'smith2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(0);
    });

    it('should handle titles with diacritics', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Étude sur l\'apprentissage automatique',
        authors: [{ given: 'François', family: 'Dupont', full: 'François Dupont' }],
        citationKey: 'dupont2024',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Etude sur l apprentissage automatique',
        authors: [{ given: 'François', family: 'Dupont', full: 'François Dupont' }],
        citationKey: 'dupont2024new',
        sourceRaw: { provider: 'manual', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(1);
      expect(candidates[0].matchReason).toBe('title-creator');
    });
  });

  describe('detectForReference - Edge cases', () => {
    it('should not create duplicate candidates', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Test Paper',
        doi: '10.1234/test',
        citationKey: 'test2024',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Test Paper',
        doi: '10.1234/test',
        citationKey: 'test2024new',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      // Run detection twice
      await service.detectForReference('user-123', newRef._id.toString());
      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      // Should still only have one candidate
      expect(candidates).toHaveLength(1);
    });

    it('should not detect deleted references as duplicates', async () => {
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Deleted Paper',
        doi: '10.1234/deleted',
        citationKey: 'deleted2024',
        deleted: true,
        deletedAt: new Date(),
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Same Paper',
        doi: '10.1234/deleted',
        citationKey: 'same2024',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', newRef._id.toString());

      expect(candidates).toHaveLength(0);
    });

    it('should not detect duplicates across different users', async () => {
      await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/test',
        citationKey: 'test2024',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const newRef = await Reference.create({
        userId: 'user-456',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/test',
        citationKey: 'test2024',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const candidates = await service.detectForReference('user-456', newRef._id.toString());

      expect(candidates).toHaveLength(0);
    });
  });

  describe('listUnresolved', () => {
    it('should list unresolved duplicate candidates', async () => {
      const ref1 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        doi: '10.1234/paper1',
        citationKey: 'paper1',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const ref2 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper 1',
        doi: '10.1234/paper1',
        citationKey: 'paper1dup',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      await service.detectForReference('user-123', ref2._id.toString());

      const unresolved = await service.listUnresolved('user-123');

      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].resolved).toBe(false);
    });

    it('should not list resolved candidates', async () => {
      const ref1 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paper',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const ref2 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paperdup',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', ref2._id.toString());
      await service.resolve('user-123', candidates[0]._id.toString(), 'keep-existing');

      const unresolved = await service.listUnresolved('user-123');

      expect(unresolved).toHaveLength(0);
    });
  });

  describe('resolve', () => {
    it('should resolve duplicate with keep-existing', async () => {
      const existing = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paper',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const duplicate = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paperdup',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', duplicate._id.toString());
      const resolved = await service.resolve('user-123', candidates[0]._id.toString(), 'keep-existing');

      expect(resolved?.resolved).toBe(true);
      expect(resolved?.resolution).toBe('keep-existing');
      expect(resolved?.resolvedAt).toBeDefined();

      // Duplicate should be soft deleted
      const deletedRef = await Reference.findById(duplicate._id);
      expect(deletedRef?.deleted).toBe(true);
    });

    it('should resolve duplicate with keep-both', async () => {
      const ref1 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paper',
        sourceRaw: { provider: 'doi', payload: {} },
      });

      const ref2 = await Reference.create({
        userId: 'user-123',
        type: 'article',
        title: 'Paper',
        doi: '10.1234/paper',
        citationKey: 'paperdup',
        sourceRaw: { provider: 'bibtex', payload: {} },
      });

      const candidates = await service.detectForReference('user-123', ref2._id.toString());
      const resolved = await service.resolve('user-123', candidates[0]._id.toString(), 'keep-both');

      expect(resolved?.resolution).toBe('keep-both');

      // Both references should still exist
      const existingRef = await Reference.findById(ref1._id);
      const duplicateRef = await Reference.findById(ref2._id);
      expect(existingRef?.deleted).toBe(false);
      expect(duplicateRef?.deleted).toBe(false);
    });

    it('should return null for non-existent candidate', async () => {
      const resolved = await service.resolve('user-123', '507f1f77bcf86cd799439011', 'keep-existing');

      expect(resolved).toBe(null);
    });
  });
});
