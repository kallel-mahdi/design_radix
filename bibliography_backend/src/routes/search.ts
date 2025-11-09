import { Router } from 'express';
import { container } from '../config/container';
import { SearchController } from '../controllers/SearchController';
import { TYPES } from '../config/types';

const router = Router();

// TODO: Session 8 - Search Implementation
router.get('/', (req, res) => {
  const controller = container.get<SearchController>(TYPES.SearchController);
  return controller.search(req, res);
});

export { router as searchRouter };
