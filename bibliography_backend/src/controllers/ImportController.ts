import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { CrossrefService } from '../services/CrossrefService';
import { PdfMetadataService } from '../services/PdfMetadataService';
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
    @inject(TYPES.IPdfMetadataService) private pdfMetadataService: PdfMetadataService
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

      // Read optional collectionId from form data
      const collectionId = req.body?.collectionId as string | undefined;

      ApplicationLogger.info('Creating reference from PDF', {
        userId,
        filename: req.file.originalname,
        size: req.file.size,
        collectionId
      });

      // Create reference with automatic metadata extraction
      const { reference, metadata } = await this.pdfMetadataService.createReferenceFromPdf(
        userId,
        req.file.path,
        req.file.originalname,
        collectionId
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
}
