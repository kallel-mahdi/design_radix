import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IDuplicateService } from '../interfaces/IDuplicateService';
import { TYPES } from '../config/types';
import { DocumentNotFoundError } from '../middleware/errorHandler';

@injectable()
export class DuplicateController {
  constructor(
    @inject(TYPES.IDuplicateService) private duplicateService: IDuplicateService
  ) {}

  async listUnresolved(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const duplicates = await this.duplicateService.listUnresolved(userId);

      res.status(200).json({
        success: true,
        data: duplicates
      });
    } catch (error) {
      next(error);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { id } = req.params;
      const { action } = req.body;

      const duplicate = await this.duplicateService.resolve(userId, id, action);

      if (!duplicate) {
        throw new DocumentNotFoundError('Duplicate not found');
      }

      res.status(200).json({
        success: true,
        message: 'Duplicate resolved successfully',
        data: duplicate
      });
    } catch (error) {
      next(error);
    }
  }
}
