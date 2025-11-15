import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { ReferenceController } from '../controllers/ReferenceController';
import { TYPES } from '../config/types';
import { validate } from '../middleware/validate';
import { CreateReferenceInputSchema, UpdateReferenceInputSchema, ImportDoiInputSchema } from '@bibliography/shared';

const router: ExpressRouter = Router();

// Lazy load controller on each request
router.post('/', validate(CreateReferenceInputSchema), (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.create(req, res);
});

router.get('/', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.list(req, res);
});

router.get('/:id', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.getById(req, res);
});

// Session 6 - DOI Import
router.post('/import-doi', validate(ImportDoiInputSchema), (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.importFromDoi(req, res);
});

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all references for a user (used by E2E tests)
// Only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  router.delete('/test-cleanup', (req, res) => {
    const controller = container.get<ReferenceController>(TYPES.ReferenceController);
    return controller.testCleanup(req, res);
  });
}

router.patch('/:id', validate(UpdateReferenceInputSchema), (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.update(req, res);
});

router.delete('/:id', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.delete(req, res);
});

router.patch('/:id/restore', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.restore(req, res);
});

router.delete('/:id/permanent', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.permanentDelete(req, res);
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

// TODO: Session 15 - PDF Management (methods not implemented yet)
// router.get('/:id/pdf', (req, res) => {
//   const controller = container.get<ReferenceController>(TYPES.ReferenceController);
//   return controller.downloadPdf(req, res);
// });

// router.post('/:id/pdf', (req, res) => {
//   const controller = container.get<ReferenceController>(TYPES.ReferenceController);
//   return controller.uploadPdf(req, res);
// });

// router.delete('/:id/pdf', (req, res) => {
//   const controller = container.get<ReferenceController>(TYPES.ReferenceController);
//   return controller.deletePdf(req, res);
// });

export { router as referencesRouter };
