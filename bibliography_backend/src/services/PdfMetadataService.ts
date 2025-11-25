import { injectable, inject } from 'inversify';
import { promises as fs } from 'fs';
import { TYPES } from '../config/types';
import { CrossrefService } from './CrossrefService';
import { ReferenceService } from './ReferenceService';
import { CreateReferenceInput } from '../interfaces/IReferenceService';
import { IReference } from '../models/Reference';
import { ApplicationLogger } from '../utils/logger';
import { pdfParse } from '../utils/pdfParseLoader';

/**
 * PdfMetadataService (Session 10.5)
 *
 * Handles PDF metadata extraction and automatic reference creation from PDF files.
 * Implements simplified version of Zotero's 3-stage pipeline (itemTree.jsx:2242-2675).
 *
 * Our approach:
 * 1. Text extraction from first 5 pages (pdf-parse)
 * 2. DOI parsing via regex (simplified from Zotero's server-side recognition)
 * 3. Metadata enrichment via Crossref API (existing Session 6 integration)
 *
 * Deviations from Zotero:
 * - No proprietary recognition server (we use regex DOI parsing instead)
 * - GROBID ML-powered extraction deferred to Phase 2
 * - ~70% success rate vs Zotero's ~90% (acceptable for MVP)
 *
 * See: docs/sessions/10.5-plan.md for architecture decisions
 */
@injectable()
export class PdfMetadataService {
  constructor(
    @inject(TYPES.ICrossrefService) private crossrefService: CrossrefService,
    @inject(TYPES.IReferenceService) private referenceService: ReferenceService
  ) {}

  /**
   * Extract text from PDF (first 5 pages only)
   *
   * Zotero pattern: Uses first 5 pages for performance (pdfWorker/manager.js:690-724).
   * DOI typically appears on page 1 (title page) or page 2 (abstract).
   *
   * Performance: ~100ms for 10-page PDF.
   */
  async extractTextFromPdf(filePath: string): Promise<string> {
    ApplicationLogger.info('Extracting text from PDF', { filePath });

    const dataBuffer = await fs.readFile(filePath);

    // Extract text from first 5 pages only (Zotero pattern)
    const data = await pdfParse(dataBuffer, { max: 5 });

    ApplicationLogger.info('PDF text extracted', {
      filePath,
      textLength: data.text.length,
      numPages: data.numpages
    });

    return data.text;
  }

  /**
   * Extract DOI from text using regex
   *
   * Strategy: Look for "DOI:" prefix first, then fall back to bare DOI pattern
   * Pattern: /doi:?\s*10\.\d{4,}\/[a-z0-9._\-()]+/i (with DOI: prefix)
   * Fallback: /\b10\.\d{4,}\/[a-z0-9._\-]+\b/i (word boundaries)
   *
   * Source: DOI Handbook (https://www.doi.org/doi_handbook/2_Numbering.html)
   *
   * Deviation from Zotero: We use simple regex instead of ML-based recognition server.
   * Trade-off: Lower accuracy (~70%) but much simpler implementation.
   *
   * Returns: First DOI match or null
   */
  extractDoi(text: string): string | null {
    // Try with "DOI:" prefix first (more reliable)
    const doiWithPrefixRegex = /doi:?\s*(10\.\d{4,}\/[a-z0-9._\-()]+)/i;
    const prefixMatch = text.match(doiWithPrefixRegex);

    if (prefixMatch && prefixMatch[1]) {
      const doi = prefixMatch[1].trim();
      ApplicationLogger.info('DOI found in text (with prefix)', { doi });
      return doi;
    }

    // Fall back to bare DOI pattern with word boundaries
    const doiRegex = /\b(10\.\d{4,}\/[a-z0-9._\-]+)/i;
    const match = text.match(doiRegex);

    if (match && match[1]) {
      const doi = match[1].trim();
      ApplicationLogger.info('DOI found in text (bare)', { doi });
      return doi;
    }

    ApplicationLogger.info('No DOI found in text');
    return null;
  }

  /**
   * Extract title from filename as fallback
   *
   * Used when no DOI found in PDF.
   * Removes .pdf extension, replaces hyphens/underscores with spaces.
   *
   * Example: "smith-2023-machine-learning.pdf" → "smith 2023 machine learning"
   */
  extractTitleFromFilename(filename: string): string {
    const title = filename
      .replace(/\.pdf$/i, '') // Remove .pdf extension
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .trim();

    ApplicationLogger.info('Title extracted from filename', { filename, title });
    return title;
  }

  /**
   * Create reference from PDF with automatic metadata extraction
   *
   * Flow:
   * 1. Extract text from PDF (first 5 pages)
   * 2. Parse DOI using regex
   * 3. If DOI found → enrich via Crossref → create reference
   * 4. If no DOI → create reference from filename (fallback)
   * 5. Attach PDF to created reference
   *
   * Error handling:
   * - Corrupt PDF: Throws error (caught by controller)
   * - Crossref API failure: Falls back to filename extraction
   * - Duplicate DOI: Let ReferenceService handle (duplicate detection runs async)
   *
   * Returns: { reference, metadata } where metadata indicates source ('crossref' or 'filename-fallback')
   */
  async createReferenceFromPdf(
    userId: string,
    filePath: string,
    originalName: string
  ): Promise<{ reference: IReference; metadata: { doi?: string; source: 'crossref' | 'filename-fallback' } }> {
    ApplicationLogger.info('Creating reference from PDF', {
      userId,
      originalName,
      filePath
    });

    try {
      // Step 1: Extract text from PDF
      const text = await this.extractTextFromPdf(filePath);

      // Step 2: Try to extract DOI
      const doi = this.extractDoi(text);

      // Step 3: If DOI found, enrich via Crossref
      if (doi) {
        try {
          ApplicationLogger.info('DOI found, fetching Crossref metadata', { doi, originalName });

          const crossrefData = await this.crossrefService.fetchMetadata(doi);
          const referenceInput = this.crossrefService.mapToReferenceInput(crossrefData);

          // Get file stats for PDF metadata
          const stat = await fs.stat(filePath);

          // Create reference with PDF attached
          const reference = await this.referenceService.create(userId, {
            ...referenceInput,
            hasPdf: true,
            pdf: {
              storedPath: filePath,
              originalName,
              size: stat.size,
              mimeType: 'application/pdf',
              uploadedAt: new Date()
            }
          });

          ApplicationLogger.info('Reference created from Crossref metadata', {
            referenceId: reference._id.toString(),
            doi,
            title: reference.title
          });

          return {
            reference,
            metadata: { doi, source: 'crossref' }
          };
        } catch (crossrefError) {
          // Crossref API failed, fall back to filename extraction
          ApplicationLogger.warn('Crossref enrichment failed, falling back to filename', {
            doi,
            error: crossrefError instanceof Error ? crossrefError.message : String(crossrefError)
          });
          // Continue to fallback below
        }
      }

      // Step 4: Fallback - Create reference from filename
      ApplicationLogger.info('No DOI or Crossref failed, using filename as title', { originalName });

      const title = this.extractTitleFromFilename(originalName);
      const stat = await fs.stat(filePath);

      const referenceInput: CreateReferenceInput = {
        type: 'article', // Default type for unknown papers
        title,
        authors: [], // Empty authors array
        tags: [],
        collectionIds: [],
        sourceRaw: {
          provider: 'manual',
          payload: { source: 'pdf-filename-fallback', originalName }
        },
        hasPdf: true,
        pdf: {
          storedPath: filePath,
          originalName,
          size: stat.size,
          mimeType: 'application/pdf',
          uploadedAt: new Date()
        }
      };

      const reference = await this.referenceService.create(userId, referenceInput);

      ApplicationLogger.info('Reference created from filename', {
        referenceId: reference._id.toString(),
        title
      });

      return {
        reference,
        metadata: { source: 'filename-fallback' }
      };
    } catch (error) {
      ApplicationLogger.error('PDF metadata extraction failed', error as Error, {
        originalName,
        filePath
      });
      throw error;
    }
  }
}
