import { Response } from 'express';
import { TransferService } from '../services/transfer.service';
import { CheckService } from '../services/check.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TransferController {
  private transferService: TransferService;
  private checkService: CheckService;

  constructor() {
    this.transferService = new TransferService();
    this.checkService = new CheckService();
    this.getCheckTransfers = this.getCheckTransfers.bind(this);
  }

  async getCheckTransfers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { checkId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const check = await this.checkService.getCheckById(checkId, userId);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const transfers = await this.transferService.calculateTransfers(checkId);
      res.json(transfers);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 