import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { CrossrefService } from '../services/CrossrefService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { Reference } from '../models/Reference';

@injectable()
export class ReferenceController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService,
    @inject(TYPES.ICrossrefService) private crossrefService: CrossrefService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
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
      ApplicationLogger.error('Reference creation failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Reference creation failed'
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const filters = {
        collectionId: req.query.collectionId as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        deleted: req.query.deleted === 'true',
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
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
      ApplicationLogger.error('Reference list failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list references'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const reference = await this.referenceService.getById(id, userId);

      if (!reference) {
        res.status(404).json({
          success: false,
          message: 'Reference not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reference retrieved successfully',
        data: reference
      });
    } catch (error) {
      ApplicationLogger.error('Reference retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve reference'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const data = req.body;

      const reference = await this.referenceService.update(id, userId, data);

      if (!reference) {
        res.status(404).json({
          success: false,
          message: 'Reference not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reference updated successfully',
        data: reference
      });
    } catch (error) {
      ApplicationLogger.error('Reference update failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update reference'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const success = await this.referenceService.softDelete(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Reference not found'
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      ApplicationLogger.error('Reference deletion failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete reference'
      });
    }
  }

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const success = await this.referenceService.restore(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Reference not found in trash'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reference restored successfully'
      });
    } catch (error) {
      ApplicationLogger.error('Reference restoration failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to restore reference'
      });
    }
  }

  async permanentDelete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const success = await this.referenceService.permanentDelete(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Reference not found in trash'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reference permanently deleted'
      });
    } catch (error) {
      ApplicationLogger.error('Permanent deletion failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to permanently delete reference'
      });
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
  async importFromDoi(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { doi } = req.body;

      ApplicationLogger.info('Importing reference from DOI', { userId, doi });

      // Check if DOI already exists for this user (avoids redundant Crossref API calls)
      const normalizedDoi = doi.trim().toLowerCase();
      const existing = await Reference.findOne({ userId, doi: normalizedDoi, deleted: false });

      if (existing) {
        ApplicationLogger.info('DOI already exists in library', { userId, doi: normalizedDoi, referenceId: existing._id.toString() });
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
      ApplicationLogger.error('DOI import failed', error as Error);

      // Handle specific Crossref errors
      const errorMessage = error instanceof Error ? error.message : 'DOI import failed';
      let statusCode = 400;

      if (errorMessage.includes('DOI not found')) {
        statusCode = 404;
      } else if (errorMessage.includes('Rate limit exceeded')) {
        statusCode = 429;
      } else if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
        statusCode = 503;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
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
  async testCleanup(req: Request, res: Response): Promise<void> {
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
      ApplicationLogger.error('Test cleanup failed', error as Error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Test cleanup failed'
      });
    }
  }
}
