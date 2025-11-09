import { Router } from 'express';
import { container } from '../config/container';
import { ReferenceController } from '../controllers/ReferenceController';
import { TYPES } from '../config/types';
import { validate } from '../middleware/validate';
import { createReferenceSchema, updateReferenceSchema } from '../validation/reference.schemas';

const router = Router();

// Lazy load controller on each request
router.post('/', validate(createReferenceSchema), (req, res) => {
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

router.patch('/:id', validate(updateReferenceSchema), (req, res) => {
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

// TODO: Session 7 - Import/Export
router.post('/import-doi', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.importDoi(req, res);
});

router.post('/import-bibtex', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.importBibtex(req, res);
});

router.post('/export', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.exportReferences(req, res);
});

// TODO: Session 15 - PDF Management
router.get('/:id/pdf', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.downloadPdf(req, res);
});

router.post('/:id/pdf', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.uploadPdf(req, res);
});

router.delete('/:id/pdf', (req, res) => {
  const controller = container.get<ReferenceController>(TYPES.ReferenceController);
  return controller.deletePdf(req, res);
});

export { router as referencesRouter };
