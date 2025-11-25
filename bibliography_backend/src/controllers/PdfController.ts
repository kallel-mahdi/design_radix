import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';

/**
 * PdfController
 *
 * Handles PDF file operations for references:
 * - Upload PDF to existing reference
 * - Download PDF
 * - Delete PDF from reference
 *
 * Split from ReferenceController for Single Responsibility Principle.
 */
@injectable()
export class PdfController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService
  ) {}

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
