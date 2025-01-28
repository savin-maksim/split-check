import { Router } from 'express';
import { CostController } from '../controllers/cost.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const costController = new CostController();

// Все маршруты защищены middleware аутентификации
router.use(auth);

// Маршруты для работы с расходами конкретного чека
router.post('/checks/:checkId/costs', (req, res, next) => {
  costController.createCost(req, res).catch(next);
});

router.get('/checks/:checkId/costs', (req, res, next) => {
  costController.getCostsInCheck(req, res).catch(next);
});

router.get('/costs/:costId', (req, res, next) => {
  costController.getCostById(req, res).catch(next);
});

router.put('/checks/:checkId/costs/:costId', (req, res, next) => {
  costController.updateCost(req, res).catch(next);
});

router.delete('/checks/:checkId/costs/:costId', (req, res, next) => {
  costController.deleteCost(req, res).catch(next);
});

export default router; 