import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { ITagService } from '../interfaces/ITagService';
import { TYPES } from '../config/types';
import { DocumentNotFoundError, ConflictError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';
import { ApplicationLogger } from '../utils/logger';
import { Tag } from '../models/Tag';

@injectable()
export class TagController {
  constructor(
    @inject(TYPES.ITagService) private tagService: ITagService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const data = req.body;

      const tag = await this.tagService.create(userId, data);

      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: tag
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const tags = await this.tagService.list(userId);

      res.status(200).json({
        success: true,
        data: tags
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

      const tag = await this.tagService.update(id, userId, data);

      if (!tag) {
        throw new DocumentNotFoundError('Tag not found');
      }

      res.status(200).json({
        success: true,
        message: 'Tag updated successfully',
        data: tag
      });
    } catch (error) {
      next(error);
    }
  }

  async rename(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { oldName } = req.params;
      const { newName } = req.body;

      const tag = await this.tagService.rename(oldName, newName, userId);

      if (!tag) {
        throw new DocumentNotFoundError('Tag not found');
      }

      res.status(200).json({
        success: true,
        message: 'Tag renamed successfully',
        data: tag
      });
    } catch (error) {
      // Convert duplicate tag error to ConflictError
      if (error instanceof Error && error.message.startsWith('DUPLICATE_TAG_NAME')) {
        next(new ConflictError(error.message));
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.tagService.delete(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Tag not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateColor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { name } = req.params;
      const { color, position } = req.body;

      const tag = await this.tagService.updateColor(name, userId, color, position);

      if (!tag) {
        throw new DocumentNotFoundError('Tag not found');
      }

      res.status(200).json({
        success: true,
        message: 'Tag color updated successfully',
        data: tag
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test cleanup endpoint - Deletes all tags for a user
   * FOR E2E TESTING ONLY - not available in production
   */
  async testCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      ApplicationLogger.info('Test cleanup: Deleting all tags', { userId });

      const result = await Tag.deleteMany({ userId });

      ApplicationLogger.info('Test cleanup complete', { userId, deletedCount: result.deletedCount });

      res.status(200).json({
        success: true,
        message: 'Tags deleted successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      next(error);
    }
  }
}
