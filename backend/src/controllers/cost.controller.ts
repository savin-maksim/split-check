import { Response } from 'express';
import { CostService } from '../services/cost.service';
import { CheckService } from '../services/check.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateCostDTO, UpdateCostDTO } from '../types/cost.types';

const costService = new CostService();
const checkService = new CheckService();

export class CostController {
  async createCost(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const data: CreateCostDTO = {
        ...req.body,
        checkId
      };

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const cost = await costService.createCost(data);
      res.status(201).json(cost);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getCostsInCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const costs = await costService.getCostsInCheck(checkId);
      res.json(costs);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCostById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const costId = req.params.costId;
      const cost = await costService.getCostById(costId);

      if (!cost) {
        res.status(404).json({ message: 'Cost not found' });
        return;
      }

      // Проверяем, что чек принадлежит пользователю
      const check = await checkService.getCheckById(cost.check.id, req.user.id);
      if (!check) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      res.json(cost);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCost(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const costId = req.params.costId;
      const data: UpdateCostDTO = req.body;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      const cost = await costService.updateCost(costId, data);
      res.json(cost);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async deleteCost(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checkId = req.params.checkId;
      const costId = req.params.costId;

      // Проверяем, что чек существует и принадлежит пользователю
      const check = await checkService.getCheckById(checkId, req.user.id);
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      await costService.deleteCost(costId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 