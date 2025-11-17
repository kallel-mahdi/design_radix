import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { ReferenceController } from '../controllers/ReferenceController';
import { TYPES } from '../config/types';
import { validate, validateParams, validateQuery, ObjectIdParamSchema, ReferenceListQuerySchema } from '../middleware/validate';
import { CreateReferenceSchema, UpdateReferenceSchema, ImportDoiSchema } from '@bibliography/shared';

const router: ExpressRouter = Router();

// Lazy load controller on each request
router.post('/', validate(CreateReferenceSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.create(req, res, next);
});

router.get('/', validateQuery(ReferenceListQuerySchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.list(req, res, next);
});

router.get('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.getById(req, res, next);
});

// Session 6 - DOI Import
router.post('/import-doi', validate(ImportDoiSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.importFromDoi(req, res, next);
});

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all references for a user (used by E2E tests)
// Available in test and development environments (NOT production)
if (process.env.NODE_ENV !== 'production') {
  router.delete('/test-cleanup', (req, res, next) => {
    const controller = container.get<ReferenceController>(TYPES.ReferenceController);
    return controller.testCleanup(req, res, next);
  });
}

router.patch('/:id', validateParams(ObjectIdParamSchema), validate(UpdateReferenceSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.update(req, res, next);
});

router.delete('/:id', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.delete(req, res, next);
});

router.patch('/:id/restore', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.restore(req, res, next);
});

router.delete('/:id/permanent', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.permanentDelete(req, res, next);
});

// TODO: Session 7 - File Import/Export (methods not implemented yet)
// router.post('/import-bibtex', (req, res) => {
//   const controller = container.get<ReferenceController>(TYPES.ReferenceController);
//   return controller.importBibtex(req, res);
// });

// router.post('/export', (req, res) => {
//   const controller = container.get<ReferenceController>(TYPES.ReferenceController);
//   return controller.exportReferences(req, res);
// });

// Session 10 - PDF Management
import { uploadPdf } from '../utils/fileUpload';

router.post('/:id/upload-pdf', validateParams(ObjectIdParamSchema), uploadPdf, (req: any, res: any, next: any) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.uploadPdf(req, res, next);
});

router.get('/:id/pdf', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.downloadPdf(req, res, next);
});

router.delete('/:id/pdf', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.deletePdf(req, res, next);
});

export { router as referencesRouter };
