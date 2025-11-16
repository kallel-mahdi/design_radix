import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { ProjectController } from '../controllers/ProjectController';
import { TYPES } from '../config/types';
import { validate, validateParams } from '../middleware/validate';
import {
  CreateProjectLinkSchema,
  DeleteProjectLinkSchema,
  CreateProjectLinkCollectionSchema,
  DeleteProjectLinkCollectionSchema,
} from '@bibliography/shared';
import { z } from 'zod';

const router: ExpressRouter = Router();

// Param schemas for project routes
const ProjectIdParamSchema = z.object({
  projectId: z.string().min(1)
});

const ReferenceIdParamSchema = z.object({
  referenceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
});

const CollectionIdParamSchema = z.object({
  collectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
});

router.post('/link', validate(CreateProjectLinkSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.linkReference(req, res, next);
});

router.post('/unlink', validate(DeleteProjectLinkSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.unlinkReference(req, res, next);
});

router.get('/:projectId/references', validateParams(ProjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getProjectReferences(req, res, next);
});

router.get('/references/:referenceId/projects', validateParams(ReferenceIdParamSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getReferenceProjects(req, res, next);
});

router.post('/link-collection', validate(CreateProjectLinkCollectionSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.linkCollection(req, res, next);
});

router.post('/unlink-collection', validate(DeleteProjectLinkCollectionSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.unlinkCollection(req, res, next);
});

router.get('/:projectId/collections', validateParams(ProjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getProjectCollections(req, res, next);
});

router.get('/collections/:collectionId/projects', validateParams(CollectionIdParamSchema), (req, res, next) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getCollectionProjects(req, res, next);
});

export { router as projectsRouter };
