import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { CrossrefService } from '../services/CrossrefService';
import { PdfMetadataService } from '../services/PdfMetadataService';
import { BibTeXService } from '../services/BibTeXService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { Reference } from '../models/Reference';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';

/**
 * ImportController
 *
 * Handles reference import from external sources:
 * - DOI import via Crossref API
 * - PDF import with metadata extraction
 *
 * Split from ReferenceController for Single Responsibility Principle.
 */
@injectable()
export class ImportController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService,
    @inject(TYPES.ICrossrefService) private crossrefService: CrossrefService,
    @inject(TYPES.IPdfMetadataService) private pdfMetadataService: PdfMetadataService,
    @inject(TYPES.IBibTeXService) private bibtexService: BibTeXService
  ) {}

  /**
   * Import reference from DOI via Crossref API (One-Step Flow)
   *
   * Fetches metadata from Crossref, maps to our schema, and creates reference immediately.
   * Follows Zotero's pattern: no preview step, metadata is trusted.
   *
   * Duplicate handling: Checks database BEFORE Crossref API call.
   * If DOI exists: returns existing reference (200)
   * If DOI not exists: fetches from Crossref → creates reference (201)
   *
   * Auto-triggers duplicate detection asynchronously (via ReferenceService.create).
   */
  async importFromDoi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { doi } = req.body;

      ApplicationLogger.info('Importing reference from DOI', { userId, doi });

      const existing = await Reference.findOne({ userId, doi: doi.trim().toLowerCase(), deleted: false });

      if (existing) {
        ApplicationLogger.info('DOI already exists in library', { userId, doi, referenceId: existing._id.toString() });
        res.status(200).json({
          success: true,
          message: 'Reference already exists in your library',
          data: existing
        });
        return;
      }

      // Fetch metadata from Crossref API
      const crossrefData = await this.crossrefService.fetchMetadata(doi);

      // Map Crossref data to CreateReferenceInput
      const referenceInput = this.crossrefService.mapToReferenceInput(crossrefData);

      // Create reference (auto-triggers duplicate detection)
      const reference = await this.referenceService.create(userId, referenceInput);

      ApplicationLogger.info('Reference imported from DOI', {
        userId,
        doi,
        referenceId: reference._id.toString()
      });

      res.status(201).json({
        success: true,
        message: 'Reference imported from DOI successfully',
        data: reference
      });
    } catch (error) {
      // Enhance error with specific status codes before passing to error handler
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('DOI not found')) {
          (error as any).statusCode = 404;
        } else if (message.includes('Rate limit exceeded')) {
          (error as any).statusCode = 429;
        } else if (message.includes('Network error') || message.includes('timeout')) {
          (error as any).statusCode = 503;
        }
      }
      next(error);
    }
  }

  /**
   * Create reference from PDF with automatic metadata extraction (Session 10.5)
   *
   * Implements Zotero-style PDF upload workflow (itemTree.jsx:2242-2675):
   * 1. Extract text from PDF (first 5 pages)
   * 2. Parse DOI using regex
   * 3. If DOI found → enrich via Crossref → create reference
   * 4. If no DOI → create reference from filename (fallback)
   *
   * Uses Multer middleware to handle multipart/form-data upload.
   * Auto-triggers duplicate detection asynchronously (via ReferenceService.create).
   *
   * Error Handling:
   * - No file provided → 400 Bad Request
   * - Corrupt PDF → 400 Bad Request (pdf-parse throws error)
   * - Crossref API failure → Falls back to filename extraction (graceful degradation)
   * - Duplicate DOI → Handled by async duplicate detection (doesn't block creation)
   *
   * Performance: ~600ms end-to-end (~100ms PDF parsing + ~500ms Crossref API)
   */
  async createFromPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'NO_FILE',
          message: 'No PDF provided'
        });
        return;
      }

      ApplicationLogger.info('Creating reference from PDF', {
        userId,
        filename: req.file.originalname,
        size: req.file.size
      });

      // Create reference with automatic metadata extraction
      const { reference, metadata } = await this.pdfMetadataService.createReferenceFromPdf(
        userId,
        req.file.path,
        req.file.originalname
      );

      ApplicationLogger.info('Reference created from PDF', {
        userId,
        referenceId: reference._id.toString(),
        source: metadata.source,
        doi: metadata.doi || 'none'
      });

      res.status(201).json({
        success: true,
        message: 'Reference created from PDF',
        data: {
          reference,
          extractedMetadata: metadata
        }
      });
    } catch (error) {
      // Enhance error with specific status codes
      if (error instanceof Error) {
        const message = error.message;

        // PDF parsing errors
        if (message.includes('Invalid PDF') || message.includes('Unsupported')) {
          (error as any).statusCode = 400;
          (error as any).error = 'INVALID_PDF';
        }
        // Crossref errors (already handled by importFromDoi pattern)
        else if (message.includes('Rate limit exceeded')) {
          (error as any).statusCode = 429;
        }
      }

      next(error);
    }
  }

  /**
   * Import references from BibTeX (Session 12)
   *
   * Accepts either:
   * - File upload (multipart/form-data with .bib file)
   * - Raw text body (application/json with { bibtex: "..." })
   *
   * Returns parsed entries for preview, optionally creates immediately.
   */
  async importFromBibtex(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      // Get BibTeX content from file or body
      let bibtexContent: string;
      if (req.file) {
        // Read file content
        const fs = await import('fs/promises');
        bibtexContent = await fs.readFile(req.file.path, 'utf-8');
      } else if (req.body.bibtex) {
        bibtexContent = req.body.bibtex;
      } else {
        res.status(400).json({
          success: false,
          error: 'NO_CONTENT',
          message: 'No BibTeX content provided. Upload a .bib file or send bibtex in body.'
        });
        return;
      }

      ApplicationLogger.info('Importing from BibTeX', {
        userId,
        contentLength: bibtexContent.length,
        fromFile: !!req.file
      });

      // Parse BibTeX
      const parseResult = this.bibtexService.parse(bibtexContent);

      // If immediate create is requested, create references
      const createImmediately = req.body.createImmediately === true;
      const createdReferences = [];
      const createErrors: Array<{ citationKey: string; error: string }> = [];

      if (createImmediately && parseResult.references.length > 0) {
        for (const parsed of parseResult.references) {
          try {
            const input = this.bibtexService.toCreateInput(parsed);
            const reference = await this.referenceService.create(userId, input);
            createdReferences.push(reference);
          } catch (err) {
            createErrors.push({
              citationKey: parsed.citationKey,
              error: err instanceof Error ? err.message : 'Failed to create'
            });
          }
        }
      }

      ApplicationLogger.info('BibTeX import complete', {
        userId,
        parsedCount: parseResult.references.length,
        errorCount: parseResult.errors.length,
        createdCount: createdReferences.length
      });

      res.status(200).json({
        success: true,
        data: {
          parsed: parseResult.references,
          parseErrors: parseResult.errors,
          created: createdReferences,
          createErrors
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export references to BibTeX format (Session 12)
   *
   * Accepts:
   * - referenceIds: Array of specific reference IDs to export
   * - collectionId: Export all references in a collection
   * - (none): Export all user's references
   */
  async exportToBibtex(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { referenceIds, collectionId } = req.body;

      ApplicationLogger.info('Exporting to BibTeX', {
        userId,
        referenceIds: referenceIds?.length,
        collectionId
      });

      // Build query to fetch references
      let references;
      if (referenceIds && referenceIds.length > 0) {
        // Export specific references
        references = await Reference.find({
          userId,
          _id: { $in: referenceIds },
          deleted: false
        });
      } else if (collectionId) {
        // Export collection
        references = await Reference.find({
          userId,
          collectionIds: collectionId,
          deleted: false
        });
      } else {
        // Export all
        references = await Reference.find({
          userId,
          deleted: false
        });
      }

      // Generate BibTeX
      const bibtexContent = this.bibtexService.export(references);

      ApplicationLogger.info('BibTeX export complete', {
        userId,
        referenceCount: references.length,
        contentLength: bibtexContent.length
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="export.bib"');
      res.status(200).send(bibtexContent);
    } catch (error) {
      next(error);
    }
  }
}
