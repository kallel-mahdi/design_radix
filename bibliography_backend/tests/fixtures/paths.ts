import path from 'path';

/**
 * Test Fixture Paths (Session 10.5)
 *
 * Centralized paths to PDF test fixtures for easy imports.
 * All PDFs are real academic papers (not synthetic) following Zotero's approach.
 *
 * Usage:
 * ```typescript
 * import { FIXTURE_PATHS } from '../fixtures/paths';
 *
 * await request(app)
 *   .post('/api/bibliography/references/from-pdf')
 *   .attach('file', FIXTURE_PATHS.withDoiZotero);
 * ```
 */

const FIXTURES_DIR = path.join(__dirname, 'pdfs');

export const FIXTURE_PATHS = {
  // DOI extraction tests
  withDoiZotero: path.join(FIXTURES_DIR, 'with-doi-zotero.pdf'), // 9.4KB, DOI: 10.1371/journal.pntd.0003350
  withDoiAcm: path.join(FIXTURES_DIR, 'with-doi-acm.pdf'), // 665KB, DOI: 10.1145/3411764.3445518
  withDoiPlos: path.join(FIXTURES_DIR, 'with-doi-plos.pdf'), // 395KB, DOI: 10.1371/journal.pone.0240505

  // arXiv extraction (future feature)
  withArxivId: path.join(FIXTURES_DIR, 'with-arxiv-id.pdf'), // 90KB

  // Filename fallback tests
  noDoiDescriptive: path.join(FIXTURES_DIR, 'smith-2023-machine-learning.pdf'), // 22KB, no DOI

  // Generic fixtures
  test: path.join(FIXTURES_DIR, 'test.pdf'), // 22KB
  minimalEmpty: path.join(FIXTURES_DIR, 'minimal-empty.pdf'), // 78KB

  // Error handling
  corrupt: path.join(FIXTURES_DIR, 'corrupt.pdf'), // 500 bytes, truncated PDF
} as const;

/**
 * Known metadata for test fixtures
 */
export const FIXTURE_METADATA = {
  withDoiZotero: {
    doi: '10.1371/journal.pntd.0003350',
    title: 'Shaping the Research Agenda',
    source: 'crossref',
  },
  withDoiAcm: {
    doi: '10.1145/3411764.3445518',
    title: 'Everyone wants to do the model work, not the data work',
    source: 'crossref',
  },
  withDoiPlos: {
    doi: '10.1371/journal.pone.0240505',
    title: 'Introducing the PLOS ONE Collection',
    source: 'crossref',
  },
  noDoiDescriptive: {
    doi: null,
    title: 'smith 2023 machine learning', // Extracted from filename
    source: 'filename-fallback',
  },
} as const;
