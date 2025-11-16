import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { CollectionController } from '../controllers/CollectionController';
import { TYPES } from '../config/types';
import { validate } from '../middleware/validate';
import {
  CreateCollectionSchema,
  UpdateCollectionSchema,
} from '@bibliography/shared';

const router: ExpressRouter = Router();

router.post('/', validate(CreateCollectionSchema), (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.create(req, res);
});

router.get('/', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.list(req, res);
});

router.get('/:id', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.getById(req, res);
});

router.patch('/:id', validate(UpdateCollectionSchema), (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.update(req, res);
});

router.patch('/:id/restore', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.restore(req, res);
});

router.delete('/:id', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.delete(req, res);
});

export { router as collectionsRouter };
