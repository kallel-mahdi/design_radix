import { Router } from 'express';
import { container } from '../config/container';
import { CollectionController } from '../controllers/CollectionController';
import { TYPES } from '../config/types';

const router = Router();

router.post('/', (req, res) => {
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

router.patch('/:id', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.update(req, res);
});

router.delete('/:id', (req, res) => {
  const controller = container.get<CollectionController>(TYPES.CollectionController);
  return controller.delete(req, res);
});

export { router as collectionsRouter };
