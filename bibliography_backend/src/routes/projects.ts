import { Router } from 'express';
import { container } from '../config/container';
import { ProjectController } from '../controllers/ProjectController';
import { TYPES } from '../config/types';

const router = Router();

router.post('/link', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.linkReference(req, res);
});

router.post('/unlink', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.unlinkReference(req, res);
});

router.get('/:projectId/references', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getProjectReferences(req, res);
});

router.get('/references/:referenceId/projects', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getReferenceProjects(req, res);
});

router.post('/link-collection', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.linkCollection(req, res);
});

router.post('/unlink-collection', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.unlinkCollection(req, res);
});

router.get('/:projectId/collections', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getProjectCollections(req, res);
});

router.get('/collections/:collectionId/projects', (req, res) => {
  const controller = container.get<ProjectController>(TYPES.ProjectController);
  return controller.getCollectionProjects(req, res);
});

export { router as projectsRouter };
