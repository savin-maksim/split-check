import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const statsController = new StatsController();

// Все маршруты защищены middleware аутентификации
router.use(auth);

router.get('/checks/:checkId/stats', statsController.getCheckStats);

export default router; 