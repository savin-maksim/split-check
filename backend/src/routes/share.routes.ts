import { Router } from 'express';
import { shareController } from '../controllers/share.controller';
import { auth } from '../middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Создание share-ссылки (требует авторизации)
router.post('/:checkId', auth, (req: Request, res: Response, next: NextFunction) => {
  shareController.createShareLink(req, res).catch(next);
});

// Получение данных по share-ссылке (публичный доступ)
router.get('/:token', (req: Request, res: Response, next: NextFunction) => {
  shareController.getSharedCheck(req, res).catch(next);
});

export default router; 