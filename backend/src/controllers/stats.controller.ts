import { Response } from 'express';
import { StatsService } from '../services/stats.service';
import { CheckService } from '../services/check.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class StatsController {
  private statsService: StatsService;
  private checkService: CheckService;

  constructor() {
    this.statsService = new StatsService();
    this.checkService = new CheckService();
    this.getCheckStats = this.getCheckStats.bind(this);
  }

  async getCheckStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { checkId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const check = await this.checkService.getCheckById(checkId, userId);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const stats = await this.statsService.calculateCheckStats(checkId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get check statistics' });
    }
  }
} 