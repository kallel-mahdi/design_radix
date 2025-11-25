/**
 * Annotation Routes - PDF annotation CRUD endpoints
 *
 * Routes:
 * - GET    /references/:referenceId/annotations     - List annotations for a reference
 * - POST   /references/:referenceId/annotations     - Create annotation
 * - GET    /annotations/:id                          - Get single annotation
 * - PATCH  /annotations/:id                          - Update annotation
 * - DELETE /annotations/:id                          - Delete annotation
 */
import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { AnnotationController } from '../controllers/AnnotationController';
import { TYPES } from '../config/types';
import { validate, validateParams, ObjectIdParamSchema } from '../middleware/validate';
import { CreateAnnotationSchema, UpdateAnnotationSchema } from '@bibliography/shared';
import { z } from 'zod';
import { config } from '../config/environment';

const router: ExpressRouter = Router();

// Param schemas
const ReferenceIdParamSchema = z.object({
  referenceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reference ID'),
});

// Reference-scoped routes (nested under /references/:referenceId/annotations)
export const referenceAnnotationsRouter: ExpressRouter = Router({ mergeParams: true });

referenceAnnotationsRouter.get('/', validateParams(ReferenceIdParamSchema), (req, res, next) => {
  const controller = container.get<AnnotationController>(TYPES.AnnotationController);
  return controller.list(req, res, next);
});

referenceAnnotationsRouter.post(
  '/',
  validateParams(ReferenceIdParamSchema),
  validate(CreateAnnotationSchema),
  (req, res, next) => {
    const controller = container.get<AnnotationController>(TYPES.AnnotationController);
    return controller.create(req, res, next);
  }
);

// Direct annotation routes (under /annotations/:id)
router.get('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<AnnotationController>(TYPES.AnnotationController);
  return controller.getById(req, res, next);
});

router.patch(
  '/:id',
  validateParams(ObjectIdParamSchema),
  validate(UpdateAnnotationSchema),
  (req, res, next) => {
    const controller = container.get<AnnotationController>(TYPES.AnnotationController);
    return controller.update(req, res, next);
  }
);

router.delete('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<AnnotationController>(TYPES.AnnotationController);
  return controller.delete(req, res, next);
});

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all annotations for a user (used by E2E global teardown)
// Available in test and development environments (NOT production)
if (config.nodeEnv !== 'production') {
  router.delete('/test-cleanup', (req, res, next) => {
    const controller = container.get<AnnotationController>(TYPES.AnnotationController);
    return controller.testCleanup(req, res, next);
  });
}

export { router as annotationsRouter };
