import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IDuplicateService } from '../interfaces/IDuplicateService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class DuplicateController {
  constructor(
    @inject(TYPES.IDuplicateService) private duplicateService: IDuplicateService
  ) {}

  async listUnresolved(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const duplicates = await this.duplicateService.listUnresolved(userId);

      res.status(200).json({
        success: true,
        data: duplicates
      });
    } catch (error) {
      ApplicationLogger.error('Duplicate list failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list duplicates'
      });
    }
  }

  async resolve(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { resolution } = req.body;

      const duplicate = await this.duplicateService.resolve(userId, id, resolution);

      if (!duplicate) {
        res.status(404).json({
          success: false,
          message: 'Duplicate not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Duplicate resolved successfully',
        data: duplicate
      });
    } catch (error) {
      ApplicationLogger.error('Duplicate resolution failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resolve duplicate'
      });
    }
  }
}
