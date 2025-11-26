import { Router, type Router as ExpressRouter } from 'express';
import { container } from '../config/container';
import { SearchController } from '../controllers/SearchController';
import { TYPES } from '../config/types';

const router: ExpressRouter = Router();

/**
 * Search Routes - Session 14
 *
 * GET /search - Search references with filters and facets
 *
 * Query params:
 * - q: Full-text search query
 * - authors: Comma-separated author names (AND logic)
 * - yearStart: Minimum year
 * - yearEnd: Maximum year
 * - venues: Comma-separated venue names (OR logic)
 * - tags: Comma-separated tag names (AND logic)
 * - page: Page number (default 1)
 * - pageSize: Results per page (default 50, max 100)
 */
router.get('/', (req, res, next) => {
  const controller = container.get<SearchController>(TYPES.SearchController);
  return controller.search(req, res, next);
});

export { router as searchRouter };
