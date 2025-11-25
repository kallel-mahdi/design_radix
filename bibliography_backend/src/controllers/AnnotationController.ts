/**
 * AnnotationController - HTTP handlers for PDF annotations
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IAnnotationService } from '../interfaces/IAnnotationService';
import { TYPES } from '../config/types';
import { DocumentNotFoundError } from '../middleware/errorHandler';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';
import { ApplicationLogger } from '../utils/logger';
import { Annotation } from '../models/Annotation';
import { config } from '../config/environment';

@injectable()
export class AnnotationController {
  constructor(
    @inject(TYPES.IAnnotationService) private annotationService: IAnnotationService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { referenceId } = req.params;
      const data = req.body;

      const annotation = await this.annotationService.create(userId, referenceId, data);

      res.status(201).json({
        success: true,
        message: 'Annotation created successfully',
        data: annotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { referenceId } = req.params;

      const annotations = await this.annotationService.listByReference(referenceId, userId);

      res.status(200).json({
        success: true,
        data: annotations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const annotation = await this.annotationService.getById(id, userId);

      if (!annotation) {
        throw new DocumentNotFoundError('Annotation not found');
      }

      res.status(200).json({
        success: true,
        data: annotation,
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

      const annotation = await this.annotationService.update(id, userId, data);

      if (!annotation) {
        throw new DocumentNotFoundError('Annotation not found');
      }

      res.status(200).json({
        success: true,
        message: 'Annotation updated successfully',
        data: annotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;
      const { id } = req.params;

      const success = await this.annotationService.delete(id, userId);

      if (!success) {
        throw new DocumentNotFoundError('Annotation not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test cleanup endpoint - Deletes all annotations for a user
   * FOR E2E TESTING ONLY - not available in production
   */
  async testCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      ApplicationLogger.info('Test cleanup: Deleting all annotations', { userId });

      const result = await Annotation.deleteMany({ userId });

      ApplicationLogger.info('Test cleanup complete', { userId, deletedCount: result.deletedCount });

      res.status(200).json({
        success: true,
        message: 'Annotations deleted successfully',
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  }
}
