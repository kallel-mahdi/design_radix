import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { TagController } from '../controllers/TagController';
import { TYPES } from '../config/types';
import { validate, validateParams, ObjectIdParamSchema, NameParamSchema } from '../middleware/validate';
import { CreateTagSchema, UpdateTagSchema, TagColorUpdateSchema } from '@bibliography/shared';
import { z } from 'zod';

const router: ExpressRouter = Router();

// Param schemas for tag routes
const OldNameParamSchema = z.object({
  oldName: z.string().min(1).max(100)
});

router.post('/', validate(CreateTagSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.create(req, res, next);
});

router.get('/', (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.list(req, res, next);
});

router.patch('/:id', validateParams(ObjectIdParamSchema), validate(UpdateTagSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.update(req, res, next);
});

router.patch('/:name/color', validateParams(NameParamSchema), validate(TagColorUpdateSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.updateColor(req, res, next);
});

router.patch('/:oldName/rename', validateParams(OldNameParamSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.rename(req, res, next);
});

router.delete('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.delete(req, res, next);
});

export { router as tagsRouter };
