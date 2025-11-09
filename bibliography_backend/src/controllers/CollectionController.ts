import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ICollectionService } from '../interfaces/ICollectionService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class CollectionController {
  constructor(
    @inject(TYPES.ICollectionService) private collectionService: ICollectionService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const data = req.body;

      const collection = await this.collectionService.create(userId, data);

      res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        data: collection
      });
    } catch (error) {
      ApplicationLogger.error('Collection creation failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Collection creation failed'
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const collections = await this.collectionService.list(userId);

      res.status(200).json({
        success: true,
        data: collections
      });
    } catch (error) {
      ApplicationLogger.error('Collection list failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list collections'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const collection = await this.collectionService.getById(id, userId);

      if (!collection) {
        res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: collection
      });
    } catch (error) {
      ApplicationLogger.error('Collection retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve collection'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const data = req.body;

      const collection = await this.collectionService.update(id, userId, data);

      if (!collection) {
        res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Collection updated successfully',
        data: collection
      });
    } catch (error) {
      ApplicationLogger.error('Collection update failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update collection'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const success = await this.collectionService.delete(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error) {
      ApplicationLogger.error('Collection deletion failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete collection'
      });
    }
  }
}
