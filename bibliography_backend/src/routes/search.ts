import { Router, type Router as ExpressRouter } from 'express';
// import { container } from '../config/container';
// import { SearchController } from '../controllers/SearchController';
// import { TYPES } from '../config/types';

const router: ExpressRouter = Router();

// TODO: Session 8 - Search Implementation (SearchController not implemented yet)
// router.get('/', (req, res) => {
//   const controller = container.get<SearchController>(TYPES.SearchController);
//   return controller.search(req, res);
// });

export { router as searchRouter };
