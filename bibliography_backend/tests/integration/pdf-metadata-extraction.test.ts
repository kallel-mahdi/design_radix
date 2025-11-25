import request from 'supertest';
import path from 'path';
import fs from 'fs';
import nock from 'nock';
import { connectInMemoryMongo, clearDatabase, disconnectInMemoryMongo } from '../utils/mongoMemoryServer';
import { createTestApp } from '../utils/testApp';
import { FIXTURE_PATHS, FIXTURE_METADATA } from '../fixtures/paths';

const app = createTestApp();

/**
 * Session 10.5: PDF Metadata Extraction Integration Tests
 *
 * Tests the automatic reference creation from PDF workflow:
 * - POST /references/from-pdf (DOI path with Crossref enrichment)
 * - POST /references/from-pdf (filename fallback path)
 * - Error handling (invalid files, corrupt PDFs)
 *
 * Strategy (following Zotero's approach):
 * - Use REAL PDF fixtures (copied from Zotero or downloaded from open-access sources)
 * - Mock external APIs (Crossref, arXiv) to avoid network dependencies
 * - Don't mock PDF parsing (use real pdf-parse extraction)
 *
 * Fixtures are in tests/fixtures/pdfs/ - see README.md for sources and licenses
 */
describe('PDF Metadata Extraction Integration Tests', () => {
  const userId = 'test-user-metadata-123';

  // Upload directory for test files
  const uploadDir = path.join(process.cwd(), 'data', 'bibliography', 'uploads');

  beforeAll(async () => {
    await connectInMemoryMongo();

    // Ensure upload directory exists for tests
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();

    // Clean up test upload directory
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });

  beforeEach(async () => {
    await clearDatabase();
    nock.cleanAll(); // Clean up any previous nock mocks
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /api/bibliography/references/from-pdf', () => {
    describe('DOI Path (Crossref Enrichment)', () => {
      it('should create reference from Crossref when DOI found in PDF', async () => {
        // Mock Crossref API response (Zotero pattern: mock external APIs, not PDF parsing)
        const doi = FIXTURE_METADATA.withDoiZotero.doi;
        const encodedDoi = encodeURIComponent(doi);
        nock('https://api.crossref.org')
          .get(`/works/${encodedDoi}`)
          .reply(200, {
            status: 'ok',
            message: {
              DOI: doi,
              title: ['Shaping the Research Agenda'],
              author: [{ given: 'Nithya', family: 'Sambasivan' }],
              published: { 'date-parts': [[2014]] },
              type: 'journal-article',
              'container-title': ['PLOS Neglected Tropical Diseases'],
            },
          });

        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.withDoiZotero)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Reference created from PDF');
        expect(response.body.data).toBeDefined();

        // Verify reference structure (now nested inside data.reference)
        const reference = response.body.data.reference;
        expect(reference._id).toBeDefined();
        expect(reference.userId).toBe(userId);
        expect(reference.hasPdf).toBe(true);
        expect(reference.pdf).toBeDefined();
        expect(reference.pdf.originalName).toBe('with-doi-zotero.pdf');

        // Verify extractedMetadata (now nested inside data)
        expect(response.body.data.extractedMetadata).toBeDefined();
        expect(response.body.data.extractedMetadata.source).toBe('crossref');
        expect(response.body.data.extractedMetadata.doi).toBe(doi);
      });
    });

    describe('Filename Fallback Path', () => {
      it('should create reference from filename when no DOI found', async () => {
        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.noDoiDescriptive)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Reference created from PDF');
        expect(response.body.data).toBeDefined();

        // Verify reference structure (now nested inside data.reference)
        const reference = response.body.data.reference;
        expect(reference._id).toBeDefined();
        expect(reference.userId).toBe(userId);
        expect(reference.title).toBe('smith 2023 machine learning'); // Extracted from filename
        expect(reference.type).toBe('article');
        expect(reference.hasPdf).toBe(true);
        expect(reference.pdf).toBeDefined();
        expect(reference.pdf.originalName).toBe('smith-2023-machine-learning.pdf');
        expect(reference.pdf.storedPath).toBeDefined();

        // Verify extractedMetadata (now nested inside data)
        expect(response.body.data.extractedMetadata).toBeDefined();
        expect(response.body.data.extractedMetadata.source).toBe('filename-fallback');
        expect(response.body.data.extractedMetadata.doi).toBeUndefined();
      });

      it('should handle filename with hyphens and underscores', async () => {
        // Copy test PDF with a descriptive filename
        const descriptiveName = 'smith-2023-machine_learning.pdf';
        const testPdfPath = path.join(uploadDir, descriptiveName);
        fs.copyFileSync(FIXTURE_PATHS.minimalEmpty, testPdfPath);

        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', testPdfPath)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reference.title).toBe('smith 2023 machine learning');
        expect(response.body.data.reference.pdf.originalName).toBe(descriptiveName);

        // Cleanup
        fs.unlinkSync(testPdfPath);
      });

      it('should create separate references for multiple PDFs', async () => {
        // Mock Crossref for first PDF (with DOI)
        const doi = FIXTURE_METADATA.withDoiAcm.doi;
        const encodedDoi = encodeURIComponent(doi);
        nock('https://api.crossref.org')
          .get(`/works/${encodedDoi}`)
          .reply(200, {
            status: 'ok',
            message: {
              DOI: doi,
              title: ['Data Cascades in High-Stakes AI'],
              author: [{ given: 'Nithya', family: 'Sambasivan' }],
              published: { 'date-parts': [[2021]] },
              type: 'journal-article',
            },
          });

        // Upload first PDF (with DOI)
        const response1 = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.withDoiAcm)
          .expect(201);

        // Upload second PDF (without DOI)
        const response2 = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.noDoiDescriptive)
          .expect(201);

        expect(response1.body.data.reference._id).toBeDefined();
        expect(response2.body.data.reference._id).toBeDefined();
        expect(response1.body.data.reference._id).not.toBe(response2.body.data.reference._id);

        // Verify both references exist
        const listResponse = await request(app)
          .get('/api/bibliography/references')
          .set('x-user-id', userId)
          .expect(200);

        expect(listResponse.body.data.length).toBe(2);
      });
    });

    describe('Error Handling', () => {
      it('should return 400 when no file provided', async () => {
        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('NO_FILE');
        expect(response.body.message).toBe('No PDF provided');
      });

      it('should return 400 for invalid file (non-PDF)', async () => {
        // Create a text file
        const textFilePath = path.join(uploadDir, 'test-invalid.txt');
        fs.writeFileSync(textFilePath, 'This is not a PDF file');

        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', textFilePath)
          .expect(400);

        expect(response.body.success).toBe(false);
        // Note: Multer should reject non-PDF files based on MIME type
        // or pdf-parse will throw an error

        // Cleanup
        fs.unlinkSync(textFilePath);
      });

      it('should return 400 for corrupt PDF', async () => {
        const response = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.corrupt)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('INVALID_PDF');
      });
    });

    describe('User Isolation', () => {
      it('should create reference for correct user', async () => {
        const user1 = 'user-1';
        const user2 = 'user-2';

        // Mock Crossref for user 1's PDF
        const doi = FIXTURE_METADATA.withDoiZotero.doi;
        const encodedDoi = encodeURIComponent(doi);
        nock('https://api.crossref.org')
          .get(`/works/${encodedDoi}`)
          .reply(200, {
            status: 'ok',
            message: {
              DOI: doi,
              title: ['Shaping the Research Agenda'],
              author: [{ given: 'Nithya', family: 'Sambasivan' }],
              published: { 'date-parts': [[2014]] },
              type: 'journal-article',
            },
          });

        // User 1 uploads PDF (with DOI)
        await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', user1)
          .attach('file', FIXTURE_PATHS.withDoiZotero)
          .expect(201);

        // User 2 uploads PDF (without DOI)
        await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', user2)
          .attach('file', FIXTURE_PATHS.noDoiDescriptive)
          .expect(201);

        // Verify user 1 only sees their reference
        const user1Response = await request(app)
          .get('/api/bibliography/references')
          .set('x-user-id', user1)
          .expect(200);

        expect(user1Response.body.data.length).toBe(1);
        expect(user1Response.body.data[0].userId).toBe(user1);
        expect(user1Response.body.data[0].hasPdf).toBe(true);

        // Verify user 2 only sees their reference
        const user2Response = await request(app)
          .get('/api/bibliography/references')
          .set('x-user-id', user2)
          .expect(200);

        expect(user2Response.body.data.length).toBe(1);
        expect(user2Response.body.data[0].userId).toBe(user2);
        expect(user2Response.body.data[0].title).toBe('smith 2023 machine learning');
      });
    });

    describe('PDF Attachment Verification', () => {
      it('should verify uploaded PDF is accessible', async () => {
        // Create reference from PDF
        const createResponse = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.minimalEmpty)
          .expect(201);

        const referenceId = createResponse.body.data.reference._id;

        // Verify PDF can be downloaded
        const downloadResponse = await request(app)
          .get(`/api/bibliography/references/${referenceId}/pdf`)
          .set('x-user-id', userId)
          .expect(200);

        expect(downloadResponse.headers['content-type']).toBe('application/pdf');
        expect(downloadResponse.headers['content-disposition']).toContain('minimal-empty.pdf');
      });

      it('should verify PDF can be deleted', async () => {
        // Create reference from PDF
        const createResponse = await request(app)
          .post('/api/bibliography/references/from-pdf')
          .set('x-user-id', userId)
          .attach('file', FIXTURE_PATHS.minimalEmpty)
          .expect(201);

        const referenceId = createResponse.body.data.reference._id;

        // Delete PDF
        await request(app)
          .delete(`/api/bibliography/references/${referenceId}/pdf`)
          .set('x-user-id', userId)
          .expect(204);

        // Verify hasPdf flag is false
        const getResponse = await request(app)
          .get(`/api/bibliography/references/${referenceId}`)
          .set('x-user-id', userId)
          .expect(200);

        expect(getResponse.body.data.hasPdf).toBe(false);
        expect(getResponse.body.data.pdf).toBeUndefined();
      });
    });
  });
});
