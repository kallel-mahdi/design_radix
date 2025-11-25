import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { ICollectionService } from '../interfaces/ICollectionService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';
import { Collection } from '../models/Collection';

@injectable()
export class CollectionController {
  constructor(
    @inject(TYPES.ICollectionService) private collectionService: ICollectionService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const data = req.body;

      const collection = await this.collectionService.create(userId, data);

      res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        data: collection
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const collections = await this.collectionService.list(userId);

      res.status(200).json({
        success: true,
        message: 'Collections retrieved successfully',
        data: collections
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const collection = await this.collectionService.getById(id, userId);

      if (!collection) {
        throw new DocumentNotFoundError('Collection not found');
      }

      res.status(200).json({
        success: true,
        message: 'Collection retrieved successfully',
        data: collection
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

      const collection = await this.collectionService.update(id, userId, data);

      if (!collection) {
        throw new DocumentNotFoundError('Collection not found');
      }

      res.status(200).json({
        success: true,
        message: 'Collection updated successfully',
        data: collection
      });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const collection = await this.collectionService.restore(id, userId);

      if (!collection) {
        throw new DocumentNotFoundError('Collection not found or not deleted');
      }

      res.status(200).json({
        success: true,
        message: 'Collection restored successfully',
        data: collection
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.collectionService.delete(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Collection not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test Cleanup Endpoint
   *
   * Deletes all collections for a given user.
   * **FOR TESTING ONLY** - Should be disabled in production
   *
   * Used by E2E tests to ensure test isolation and prevent test pollution
   */
  async testCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      ApplicationLogger.info('Test cleanup: Deleting all collections', { userId });

      // Delete all collections for this user
      const result = await Collection.deleteMany({ userId });

      ApplicationLogger.info('Test cleanup complete', {
        userId,
        deletedCount: result.deletedCount
      });

      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} collections for user ${userId}`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      next(error);
    }
  }
}
