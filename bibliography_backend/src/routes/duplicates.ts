import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { DuplicateController } from '../controllers/DuplicateController';
import { TYPES } from '../config/types';

const router: ExpressRouter = Router();

router.get('/', (req, res) => {
  const controller = container.get<DuplicateController>(TYPES.DuplicateController);
  return controller.listUnresolved(req, res);
});

router.post('/:id/resolve', (req, res) => {
  const controller = container.get<DuplicateController>(TYPES.DuplicateController);
  return controller.resolve(req, res);
});

// TODO: Session 9 - Duplicate Management (refreshAll method not implemented yet)
// router.post('/refresh', (req, res) => {
//   const controller = container.get<DuplicateController>(TYPES.DuplicateController);
//   return controller.refreshAll(req, res);
// });

export { router as duplicatesRouter };
