import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { promises as fs } from 'fs';
import { IReferenceService } from '../interfaces/IReferenceService';
import { PdfMetadataService } from '../services/PdfMetadataService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';

/**
 * PdfController
 *
 * Handles PDF file operations for references:
 * - Extract metadata from PDF (without creating reference)
 * - Upload PDF to existing reference
 * - Download PDF
 * - Delete PDF from reference
 *
 * Split from ReferenceController for Single Responsibility Principle.
 */
@injectable()
export class PdfController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService,
    @inject(TYPES.IPdfMetadataService) private pdfMetadataService: PdfMetadataService
  ) {}

  /**
   * Extract metadata from PDF without creating a reference (Unified Architecture)
   *
   * Follows Zotero pattern: metadata extraction is separate from item creation.
   * This allows the frontend to show a pre-filled form for user review/edit.
   *
   * Flow:
   * 1. Accept PDF file upload
   * 2. Extract text and parse DOI
   * 3. If DOI found → fetch Crossref metadata
   * 4. If no DOI → extract title from filename
   * 5. Store PDF in permanent location
   * 6. Return: { metadata, pdfInfo, source }
   *
   * The frontend then:
   * 1. Shows ReferenceModal pre-filled with metadata
   * 2. User can edit/confirm
   * 3. Creates reference via POST /references (unified path)
   *
   * Note: PDF is stored immediately (same location as normal uploads).
   * If user cancels, the orphan PDF will be cleaned up by background job (future).
   */
  async extractMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      ApplicationLogger.info('Extracting metadata from PDF', {
        userId,
        filename: req.file.originalname,
        size: req.file.size
      });

      // Step 1: Extract text from PDF
      const text = await this.pdfMetadataService.extractTextFromPdf(req.file.path);

      // Step 2: Try to extract DOI
      const doi = this.pdfMetadataService.extractDoi(text);

      // Step 3: Build metadata response
      let metadata: {
        type: string;
        title: string;
        authors: Array<{ given?: string; family?: string; full: string }>;
        year?: number;
        venue?: string;
        doi?: string;
        url?: string;
        abstract?: string;
      };
      let source: 'crossref' | 'filename-fallback';

      if (doi) {
        try {
          // Fetch Crossref metadata
          const crossrefService = (this.pdfMetadataService as any).crossrefService;
          const crossrefData = await crossrefService.fetchMetadata(doi);
          const referenceInput = crossrefService.mapToReferenceInput(crossrefData);

          metadata = {
            type: referenceInput.type || 'article',
            title: referenceInput.title,
            authors: referenceInput.authors || [],
            year: referenceInput.year,
            venue: referenceInput.venue,
            doi: referenceInput.doi,
            url: referenceInput.url,
            abstract: referenceInput.abstract,
          };
          source = 'crossref';

          ApplicationLogger.info('Metadata extracted from Crossref', { doi, title: metadata.title });
        } catch (crossrefError) {
          // Crossref failed, fall back to filename
          ApplicationLogger.warn('Crossref enrichment failed, using filename fallback', {
            doi,
            error: crossrefError instanceof Error ? crossrefError.message : String(crossrefError)
          });

          const title = this.pdfMetadataService.extractTitleFromFilename(req.file.originalname);
          metadata = {
            type: 'article',
            title,
            authors: [],
            doi, // Still include the DOI we found
          };
          source = 'filename-fallback';
        }
      } else {
        // No DOI found, use filename
        const title = this.pdfMetadataService.extractTitleFromFilename(req.file.originalname);
        metadata = {
          type: 'article',
          title,
          authors: [],
        };
        source = 'filename-fallback';

        ApplicationLogger.info('No DOI found, using filename as title', { title });
      }

      // Step 4: Get PDF file info
      const stat = await fs.stat(req.file.path);
      const pdfInfo = {
        storedPath: req.file.path,
        originalName: req.file.originalname,
        size: stat.size,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
      };

      ApplicationLogger.info('PDF metadata extraction complete', {
        userId,
        source,
        title: metadata.title,
        hasDoi: !!metadata.doi
      });

      res.status(200).json({
        success: true,
        message: 'PDF metadata extracted',
        data: {
          metadata,
          pdfInfo,
          source,
        }
      });
    } catch (error) {
      // Enhance error with specific status codes
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('Invalid PDF') || message.includes('Unsupported')) {
          (error as any).statusCode = 400;
          (error as any).error = 'INVALID_PDF';
        }
      }
      next(error);
    }
  }

  /**
   * Upload PDF for a reference (Session 10)
   *
   * Single PDF per reference (MVP: Zotero supports multiple attachments)
   * Uses Multer middleware to handle multipart/form-data upload
   * Stores PDF in ./data/bibliography/uploads/{uuid}.pdf with disk storage
   */
  async uploadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'FILE_UPLOAD_ERROR',
          message: 'No file provided'
        });
        return;
      }

      ApplicationLogger.info('Uploading PDF', {
        userId,
        referenceId: id,
        filename: req.file.originalname,
        size: req.file.size
      });

      const reference = await this.referenceService.uploadPdf(id, userId, req.file);

      if (!reference) {
        throw new DocumentNotFoundError('Reference not found');
      }

      ApplicationLogger.info('PDF uploaded successfully', {
        userId,
        referenceId: id,
        storedPath: reference.pdf?.storedPath
      });

      res.status(200).json({
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          hasPdf: reference.hasPdf,
          pdf: reference.pdf
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download PDF for a reference (Session 10)
   *
   * Streams PDF file with Content-Disposition: inline for browser viewing
   * Returns 404 if reference not found or no PDF attached
   */
  async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const pdfData = await this.referenceService.getPdfPath(id, userId);

      if (!pdfData) {
        throw new DocumentNotFoundError('PDF not found');
      }

      ApplicationLogger.info('Downloading PDF', {
        userId,
        referenceId: id,
        filename: pdfData.originalName
      });

      // Stream PDF file with proper headers
      // Note: storedPath is absolute (from Multer), so we don't use root option
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${pdfData.originalName}"`);
      res.sendFile(pdfData.storedPath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete PDF from a reference (Session 10)
   *
   * Removes PDF file from disk and clears metadata from reference document
   * Returns 204 No Content on success
   */
  async deletePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.referenceService.deletePdf(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Reference not found');
      }

      ApplicationLogger.info('PDF deleted successfully', {
        userId,
        referenceId: id
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
