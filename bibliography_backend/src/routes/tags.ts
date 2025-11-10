import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { TagController } from '../controllers/TagController';
import { TYPES } from '../config/types';
import { validate } from '../middleware/validate';
import { CreateTagInputSchema, UpdateTagInputSchema, TagColorUpdateInputSchema } from '@bibliography/shared';

const router: ExpressRouter = Router();

router.post('/', validate(CreateTagInputSchema), (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.create(req, res);
});

router.get('/', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.list(req, res);
});

router.patch('/:id', validate(UpdateTagInputSchema), (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.update(req, res);
});

router.patch('/:name/color', validate(TagColorUpdateInputSchema), (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.updateColor(req, res);
});

router.patch('/:oldName/rename', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.rename(req, res);
});

router.delete('/:id', (req, res) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.delete(req, res);
});

export { router as tagsRouter };
