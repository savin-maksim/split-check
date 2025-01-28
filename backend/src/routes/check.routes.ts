import { Router } from 'express';
import { CheckController } from '../controllers/check.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const checkController = new CheckController();

// Все маршруты защищены middleware аутентификации
router.use(auth);

router.post('/', (req, res, next) => {
  checkController.createCheck(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  checkController.getChecks(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  checkController.getCheckById(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
  checkController.updateCheck(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
  checkController.deleteCheck(req, res).catch(next);
});

export default router; 