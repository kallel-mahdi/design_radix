import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ITagService } from '../interfaces/ITagService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class TagController {
  constructor(
    @inject(TYPES.ITagService) private tagService: ITagService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const data = req.body;

      const tag = await this.tagService.create(userId, data);

      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: tag
      });
    } catch (error) {
      ApplicationLogger.error('Tag creation failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Tag creation failed'
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const tags = await this.tagService.list(userId);

      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      ApplicationLogger.error('Tag list failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list tags'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const data = req.body;

      const tag = await this.tagService.update(id, userId, data);

      if (!tag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tag updated successfully',
        data: tag
      });
    } catch (error) {
      ApplicationLogger.error('Tag update failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update tag'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;

      const success = await this.tagService.delete(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      ApplicationLogger.error('Tag deletion failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete tag'
      });
    }
  }

  async updateColor(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { name } = req.params;
      const { color, position } = req.body;

      const tag = await this.tagService.updateColor(name, userId, color, position);

      if (!tag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tag color updated successfully',
        data: tag
      });
    } catch (error) {
      ApplicationLogger.error('Tag color update failed', error as Error);

      const message = error instanceof Error ? error.message : 'Failed to update tag color';
      const statusCode = message.startsWith('MAX_COLORED_TAGS') || message.startsWith('INVALID_POSITION') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
}
