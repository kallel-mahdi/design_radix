import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { CollectionController } from '../controllers/CollectionController';
import { TYPES } from '../config/types';
import { validate, validateParams, ObjectIdParamSchema } from '../middleware/validate';
import { config } from '../config/environment';
import {
  CreateCollectionSchema,
  UpdateCollectionSchema,
} from '@bibliography/shared';

const router: ExpressRouter = Router();

router.post('/', validate(CreateCollectionSchema), (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.list(req, res, next);
});

router.get('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.getById(req, res, next);
});

router.patch('/:id', validateParams(ObjectIdParamSchema), validate(UpdateCollectionSchema), (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.update(req, res, next);
});

router.patch('/:id/restore', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.restore(req, res, next);
});

router.delete('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.delete(req, res, next);
});

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all collections for a user (used by E2E tests)
// Available in test and development environments (NOT production)
if (config.nodeEnv !== 'production') {
  router.delete('/test-cleanup', (req, res, next) => {
    const controller = container.get<CollectionController>(TYPES.CollectionController);
    return controller.testCleanup(req, res, next);
  });
}

export { router as collectionsRouter };
