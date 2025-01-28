import { Response } from 'express';
import { CheckService } from '../services/check.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateCheckDTO, UpdateCheckDTO } from '../types/check.types';

const checkService = new CheckService();

export class CheckController {
  async createCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const data: CreateCheckDTO = req.body;
      const check = await checkService.createCheck(req.user.id, data);
      res.status(201).json(check);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getChecks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const checks = await checkService.getChecks(req.user.id);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCheckById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const check = await checkService.getCheckById(req.params.id, req.user.id);
      
      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      res.json(check);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const data: UpdateCheckDTO = req.body;
      const check = await checkService.updateCheck(req.params.id, req.user.id, data);
      res.json(check);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async deleteCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      await checkService.deleteCheck(req.params.id, req.user.id);
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