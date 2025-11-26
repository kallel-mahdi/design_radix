import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { ReferenceController } from '../controllers/ReferenceController';
import { ImportController } from '../controllers/ImportController';
import { PdfController } from '../controllers/PdfController';
import { TYPES } from '../config/types';
import { validate, validateParams, validateQuery, ObjectIdParamSchema, ReferenceListQuerySchema } from '../middleware/validate';
import { CreateReferenceSchema, UpdateReferenceSchema, ImportDoiSchema } from '@bibliography/shared';
import { config } from '../config/environment';

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

// Session 6 - DOI Import (moved to ImportController)
router.post('/import-doi', validate(ImportDoiSchema), (req, res, next) => {
  const controller = container.get<ImportController>(TYPES.ImportController);
  return controller.importFromDoi(req, res, next);
});

// Session 10.5 - PDF Import with Metadata Extraction (moved to ImportController)
// Import uploadPdf middleware (reused from Session 10)
import { uploadPdf } from '../utils/fileUpload';

// DEPRECATED: Use /pdf/extract + POST /references instead (unified flow)
router.post('/from-pdf', uploadPdf, (req: any, res: any, next: any) => {
  const controller = container.get<ImportController>(TYPES.ImportController);
  return controller.createFromPdf(req, res, next);
});

// Unified Architecture: Extract metadata from PDF without creating reference
// Frontend calls this, then shows pre-filled ReferenceModal, then creates via POST /references
router.post('/pdf/extract', uploadPdf, (req: any, res: any, next: any) => {
  const controller = container.get<PdfController>(TYPES.PdfController);
  return controller.extractMetadata(req, res, next);
});

// Test Cleanup Endpoint - FOR TESTING ONLY
// Deletes all references for a user (used by E2E tests)
// Available in test and development environments (NOT production)
if (config.nodeEnv !== 'production') {
  router.delete('/test-cleanup', (req, res, next) => {
    const controller = container.get<ReferenceController>(TYPES.ReferenceController);
    return controller.testCleanup(req, res, next);
  });

  // PDF Cleanup Endpoint - FOR TESTING ONLY
  // Deletes all PDF files for a user's references (used by E2E global teardown)
  // Available in test and development environments (NOT production)
  router.delete('/pdf-cleanup', (req, res, next) => {
    const controller = container.get<ReferenceController>(TYPES.ReferenceController);
    return controller.cleanupPdfFiles(req, res, next);
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

// Session 12 - BibTeX Import/Export
// Import can be file upload (.bib) or raw text in body
import multer from 'multer';
const uploadBibtex = multer({
  dest: 'uploads/bibtex/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/x-bibtex' || file.originalname.endsWith('.bib')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
}).single('file');

router.post('/import-bibtex', uploadBibtex, (req, res, next) => {
  const controller = container.get<ImportController>(TYPES.ImportController);
  return controller.importFromBibtex(req, res, next);
});

router.post('/export-bibtex', (req, res, next) => {
  const controller = container.get<ImportController>(TYPES.ImportController);
  return controller.exportToBibtex(req, res, next);
});

// Session 10 - PDF Management (moved to PdfController)
// uploadPdf middleware imported above (Session 10.5)

router.post('/:id/upload-pdf', validateParams(ObjectIdParamSchema), uploadPdf, (req: any, res: any, next: any) => {
  const controller = container.get<PdfController>(TYPES.PdfController);
  return controller.uploadPdf(req, res, next);
});

router.get('/:id/pdf', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<PdfController>(TYPES.PdfController);
  return controller.downloadPdf(req, res, next);
});

router.delete('/:id/pdf', validateParams(ObjectIdParamSchema), (req, res, next) => {
  const controller = container.get<PdfController>(TYPES.PdfController);
  return controller.deletePdf(req, res, next);
});

export { router as referencesRouter };
