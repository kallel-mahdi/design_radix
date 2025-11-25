/**
 * Centralized Fixture Paths
 *
 * Type-safe fixture paths for E2E tests. Use these constants instead of
 * hardcoding relative paths throughout tests.
 *
 * Usage:
 * ```typescript
 * import { FIXTURE_PATHS } from './fixtures/paths';
 *
 * await fileInput.setInputFiles(FIXTURE_PATHS.pdfs.small);
 * ```
 */

import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDF Test Fixtures
 */
export const FIXTURE_PATHS = {
  /**
   * PDF files for upload testing
   */
  pdfs: {
    /**
     * Minimal valid PDF (291 bytes)
     * Use for: Fast smoke tests, basic upload validation
     */
    minimal: path.join(__dirname, 'pdfs/minimal.pdf'),

    /**
     * Small test PDF with text (630 bytes)
     * Use for: Fast tests with visible content
     */
    smallTest: path.join(__dirname, 'pdfs/small-test.pdf'),

    /**
     * Small academic paper from arXiv (~500KB)
     * arXiv ID: 2302.12854 - "The Micro-Paper"
     * Use for: Realistic small file uploads
     */
    small: path.join(__dirname, 'pdfs/small-paper.pdf'),

    /**
     * Medium academic paper from arXiv (~2MB)
     * arXiv ID: 1706.03762 - "Attention Is All You Need"
     * Use for: Standard workflow testing
     */
    medium: path.join(__dirname, 'pdfs/medium-paper.pdf'),

    /**
     * Large academic paper from arXiv (~1-2MB)
     * arXiv ID: 1301.3781 - "Efficient Estimation of Word Representations"
     * Use for: Performance testing, edge cases
     */
    large: path.join(__dirname, 'pdfs/large-paper.pdf'),

    /**
     * PDF with embedded DOI (9.4KB)
     * DOI: 10.1371/journal.pntd.0003350
     * Use for: Crossref enrichment tests (Session 10.5)
     */
    withDoiZotero: path.join(__dirname, 'pdfs/with-doi-zotero.pdf'),

    /**
     * PDF without DOI - descriptive filename (22KB)
     * Filename: smith-2023-machine-learning.pdf
     * Use for: Filename fallback tests (Session 10.5)
     */
    noDoiDescriptive: path.join(__dirname, 'pdfs/smith-2023-machine-learning.pdf'),

    /**
     * Corrupt/invalid PDF (500 bytes)
     * Use for: Error handling tests
     */
    corrupt: path.join(__dirname, 'pdfs/corrupt.pdf'),
  },

  /**
   * BibTeX files for import testing (Session 11+)
   */
  bibtex: {
    /**
     * Single BibTeX entry
     * Use for: Basic import tests
     */
    singleEntry: path.join(__dirname, 'bibtex/single-entry.bib'),

    /**
     * Multiple BibTeX entries
     * Use for: Batch import tests
     */
    multipleEntries: path.join(__dirname, 'bibtex/multiple-entries.bib'),

    /**
     * Malformed BibTeX file
     * Use for: Error handling tests
     */
    malformed: path.join(__dirname, 'bibtex/malformed.bib'),
  },
} as const;

/**
 * Type for PDF fixture keys
 */
export type PdfFixtureKey = keyof typeof FIXTURE_PATHS.pdfs;

/**
 * Type for BibTeX fixture keys
 */
export type BibtexFixtureKey = keyof typeof FIXTURE_PATHS.bibtex;
