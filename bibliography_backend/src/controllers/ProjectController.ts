import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IProjectService } from '../interfaces/IProjectService';
import { TYPES } from '../config/types';
import { DocumentNotFoundError } from '../middleware/errorHandler';

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.IProjectService) private projectService: IProjectService
  ) {}

  async linkReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, referenceId } = req.body;

      const result = await this.projectService.linkReference(userId, projectId, referenceId);
      const { isNew, ...link } = result as any;

      res.status(isNew ? 201 : 200).json({
        success: true,
        message: isNew ? 'Reference linked to project' : 'Reference already linked to project',
        data: link
      });
    } catch (error) {
      next(error);
    }
  }

  async unlinkReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, referenceId } = req.body;

      const success = await this.projectService.unlinkReference(userId, projectId, referenceId);

      if (!success) {
        throw new DocumentNotFoundError('Link not found');
      }

      res.status(200).json({
        success: true,
        message: 'Reference unlinked from project'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectReferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId } = req.params;

      const references = await this.projectService.getProjectReferences(userId, projectId);

      res.status(200).json({
        success: true,
        data: references
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferenceProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { referenceId } = req.params;

      const projects = await this.projectService.getReferenceProjects(userId, referenceId);

      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  }

  async linkCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, collectionId } = req.body;

      const result = await this.projectService.linkCollection(userId, projectId, collectionId);
      const { isNew, ...link } = result as any;

      res.status(isNew ? 201 : 200).json({
        success: true,
        message: isNew ? 'Collection linked to project' : 'Collection already linked to project',
        data: link
      });
    } catch (error) {
      next(error);
    }
  }

  async unlinkCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, collectionId } = req.body;

      const success = await this.projectService.unlinkCollection(userId, projectId, collectionId);

      if (!success) {
        throw new DocumentNotFoundError('Link not found');
      }

      res.status(200).json({
        success: true,
        message: 'Collection unlinked from project'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId } = req.params;

      const collections = await this.projectService.getProjectCollections(userId, projectId);

      res.status(200).json({
        success: true,
        data: collections
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { collectionId } = req.params;

      const projects = await this.projectService.getCollectionProjects(userId, collectionId);

      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  }
}
