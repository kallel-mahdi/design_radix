import { Router } from 'express';
import { container } from '../config/container';
import { TagController } from '../controllers/TagController';
import { TYPES } from '../config/types';

const router = Router();

router.post('/', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.create(req, res);
});

router.get('/', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.list(req, res);
});

router.patch('/:id', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.update(req, res);
});

router.patch('/:name/color', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.updateColor(req, res);
});

router.delete('/:id', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.delete(req, res);
});

export { router as tagsRouter };
