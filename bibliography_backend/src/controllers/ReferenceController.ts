import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IReferenceService } from '../interfaces/IReferenceService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class ReferenceController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService
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
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const references = await this.referenceService.list(userId, filters);

      res.status(200).json({
        success: true,
        data: references
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

      res.status(200).json({
        success: true,
        message: 'Reference moved to trash'
      });
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
}
