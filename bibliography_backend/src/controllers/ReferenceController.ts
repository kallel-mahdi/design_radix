import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { CrossrefService } from '../services/CrossrefService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { Reference } from '../models/Reference';
import { DocumentNotFoundError } from '../middleware/errorHandler';

@injectable()
export class ReferenceController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService,
    @inject(TYPES.ICrossrefService) private crossrefService: CrossrefService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
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
      const userId = req.headers['x-user-id'] as string;
      const { doi } = req.body;

      ApplicationLogger.info('Importing reference from DOI', { userId, doi });

      // Task 11: DOI normalization removed from controller - handled by service layer
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
   * Test Cleanup Endpoint
   *
   * Deletes all references for a given user.
   * **FOR TESTING ONLY** - Should be disabled in production
   *
   * Used by E2E tests to ensure test isolation and prevent test pollution
   */
  async testCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

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
}
