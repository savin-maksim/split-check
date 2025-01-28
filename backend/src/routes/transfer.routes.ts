import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();
const transferController = new TransferController();

// Все маршруты защищены middleware аутентификации
router.use(auth);

router.get('/checks/:checkId/transfers', transferController.getCheckTransfers);

export default router; 
