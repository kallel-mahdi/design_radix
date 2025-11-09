import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IProjectService } from '../interfaces/IProjectService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.IProjectService) private projectService: IProjectService
  ) {}

  async linkReference(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, referenceId } = req.body;

      const link = await this.projectService.linkReference(userId, projectId, referenceId);

      res.status(201).json({
        success: true,
        message: 'Reference linked to project',
        data: link
      });
    } catch (error) {
      ApplicationLogger.error('Reference linking failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to link reference'
      });
    }
  }

  async unlinkReference(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, referenceId } = req.body;

      const success = await this.projectService.unlinkReference(userId, projectId, referenceId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Link not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Reference unlinked from project'
      });
    } catch (error) {
      ApplicationLogger.error('Reference unlinking failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unlink reference'
      });
    }
  }

  async getProjectReferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId } = req.params;

      const references = await this.projectService.getProjectReferences(userId, projectId);

      res.status(200).json({
        success: true,
        data: references
      });
    } catch (error) {
      ApplicationLogger.error('Project references retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve project references'
      });
    }
  }

  async getReferenceProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { referenceId } = req.params;

      const projects = await this.projectService.getReferenceProjects(userId, referenceId);

      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      ApplicationLogger.error('Reference projects retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve reference projects'
      });
    }
  }

  async linkCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, collectionId } = req.body;

      const link = await this.projectService.linkCollection(userId, projectId, collectionId);

      res.status(201).json({
        success: true,
        message: 'Collection linked to project',
        data: link
      });
    } catch (error) {
      ApplicationLogger.error('Collection linking failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to link collection'
      });
    }
  }

  async unlinkCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId, collectionId } = req.body;

      const success = await this.projectService.unlinkCollection(userId, projectId, collectionId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Link not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Collection unlinked from project'
      });
    } catch (error) {
      ApplicationLogger.error('Collection unlinking failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unlink collection'
      });
    }
  }

  async getProjectCollections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { projectId } = req.params;

      const collections = await this.projectService.getProjectCollections(userId, projectId);

      res.status(200).json({
        success: true,
        data: collections
      });
    } catch (error) {
      ApplicationLogger.error('Project collections retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve project collections'
      });
    }
  }

  async getCollectionProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { collectionId } = req.params;

      const projects = await this.projectService.getCollectionProjects(userId, collectionId);

      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      ApplicationLogger.error('Collection projects retrieval failed', error as Error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve collection projects'
      });
    }
  }
}
