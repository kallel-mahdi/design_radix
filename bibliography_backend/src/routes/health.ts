import { Router } from 'express';
import { container } from '../config/container';
import { HealthController } from '../controllers/HealthController';
import { TYPES } from '../config/types';

const router = Router();

router.get('/', (req, res) => {
  const controller = container.get<HealthController>(TYPES.HealthController);
  return controller.check(req, res);
});

export { router as healthRouter };
