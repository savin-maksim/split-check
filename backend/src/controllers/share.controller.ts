import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { StatsService } from '../services/stats.service';
import { TransferService } from '../services/transfer.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();
const statsService = new StatsService();
const transferService = new TransferService();

class ShareController {
  async createShareLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { checkId } = req.params;
      const { type } = req.body;
      const userId = req.user?.id;

      // Проверяем, существует ли чек и принадлежит ли он пользователю
      const check = await prisma.check.findFirst({
        where: {
          id: checkId,
          userId
        }
      });

      if (!check) {
        res.status(404).json({ message: 'Check not found' });
        return;
      }

      // Ищем существующую активную share-ссылку для этого чека
      const existingShareLink = await prisma.shareLink.findFirst({
        where: {
          checkId,
          type,
          isActive: true
        }
      });

      if (existingShareLink) {
        res.json({ token: existingShareLink.token });
        return;
      }

      // Если активной ссылки нет, создаем новую
      const shareLink = await prisma.shareLink.create({
        data: {
          checkId,
          type,
          token: uuidv4(),
          isActive: true
        }
      });

      res.json({ token: shareLink.token });
    } catch (error) {
      console.error('Error creating share link:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSharedCheck(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Находим share-ссылку
      const shareLink = await prisma.shareLink.findUnique({
        where: {
          token,
          isActive: true
        },
        include: {
          check: true
        }
      });

      if (!shareLink || !shareLink.check) {
        res.status(404).json({ message: 'Share link not found or inactive' });
        return;
      }

      // Получаем всю статистику чека
      const stats = await statsService.calculateCheckStats(shareLink.checkId);

      res.json({
        totalStats: stats.totalStats,
        transfers: stats.transfers,
        personStats: stats.personStats
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const shareController = new ShareController(); 