import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { Reference } from '../models/Reference';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';
import * as fs from 'fs/promises';

/**
 * ReferenceController
 *
 * Handles core CRUD operations for references.
 * Import and PDF operations have been moved to ImportController and PdfController
 * following Single Responsibility Principle.
 */
@injectable()
export class ReferenceController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const data = req.body;

      const reference = await this.referenceService.create(userId, data);

      res.status(201).json({
        success: true,
        message: 'Reference created successfully',
        data: reference
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      // Clamp limit to max 1000 per spec (Task 5: pagination limit clamping)
      const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 100), 1000);
      const filters = {
        collectionId: req.query.collectionId as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        deleted: req.query.deleted === 'true',
        search: req.query.search as string | undefined,
        limit,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const { references, total } = await this.referenceService.list(userId, filters);

      res.status(200).json({
        success: true,
        message: 'References retrieved successfully',
        data: references,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + references.length < total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const reference = await this.referenceService.getById(id, userId);

      if (!reference) {
        throw new DocumentNotFoundError('Reference not found');
      }

      res.status(200).json({
        success: true,
        message: 'Reference retrieved successfully',
        data: reference
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;
      const data = req.body;

      const reference = await this.referenceService.update(id, userId, data);

      if (!reference) {
        throw new DocumentNotFoundError('Reference not found');
      }

      res.status(200).json({
        success: true,
        message: 'Reference updated successfully',
        data: reference
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.referenceService.softDelete(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Reference not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.referenceService.restore(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Reference not found in trash');
      }

      res.status(200).json({
        success: true,
        message: 'Reference restored successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async permanentDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.referenceService.permanentDelete(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Reference not found in trash');
      }

      // Task 12: Use 204 No Content for permanent delete (no body)
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test Cleanup Endpoint
   *
   * Deletes all references for a given user.
   * **FOR TESTING ONLY** - Should be disabled in production
   *
   * Used by E2E tests to ensure test isolation and prevent test pollution
   */
  async testCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      ApplicationLogger.info('Test cleanup: Deleting all references', { userId });

      // Delete all references for this user
      const result = await Reference.deleteMany({ userId });

      ApplicationLogger.info('Test cleanup complete', {
        userId,
        deletedCount: result.deletedCount
      });

      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} references for user ${userId}`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PDF Cleanup Endpoint
   *
   * Deletes all PDF files for a user's references and clears PDF metadata.
   * **FOR TESTING/DEVELOPMENT ONLY** - Should be disabled in production
   *
   * Used by E2E global teardown to clean up disk space after tests
   */
  async cleanupPdfFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      ApplicationLogger.info('PDF cleanup: Starting cleanup for user', { userId });

      await this.referenceService.clearPdfPaths(userId);

      ApplicationLogger.info('PDF cleanup complete', { userId });

      res.status(200).json({
        success: true,
        message: 'PDF files cleaned up successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
