import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { TagController } from '../controllers/TagController';
import { TYPES } from '../config/types';
import { validate, validateParams, ObjectIdParamSchema, NameParamSchema } from '../middleware/validate';
import { CreateTagSchema, UpdateTagSchema, TagColorUpdateSchema } from '@bibliography/shared';
import { z } from 'zod';
import { config } from '../config/environment';

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

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all tags for a user (used by E2E tests)
// Available in test and development environments (NOT production)
// IMPORTANT: This route must be defined BEFORE /:id to avoid route collision
if (config.nodeEnv !== 'production') {
  router.delete('/test-cleanup', (req, res, next) => {
    const controller = container.get<TagController>(TYPES.TagController);
    return controller.testCleanup(req, res, next);
  });
}

router.delete('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<TagController>(TYPES.TagController);
  return controller.delete(req, res, next);
});

export { router as tagsRouter };
