import { PrismaClient } from '@prisma/client';
import { CreateCheckDTO, UpdateCheckDTO, CheckResponse } from '../types/check.types';

const prisma = new PrismaClient();

export class CheckService {
  async createCheck(userId: string, data: CreateCheckDTO): Promise<CheckResponse> {
    const check = await prisma.check.create({
      data: {
        ...data,
        userId
      }
    });

    return check;
  }

  async getChecks(userId: string): Promise<CheckResponse[]> {
    const checks = await prisma.check.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return checks;
  }

  async getCheckById(checkId: string, userId: string): Promise<CheckResponse | null> {
    const check = await prisma.check.findFirst({
      where: {
        id: checkId,
        OR: [
          { userId },
          { isPublic: true }
        ]
      }
    });

    return check;
  }

  async updateCheck(checkId: string, userId: string, data: UpdateCheckDTO): Promise<CheckResponse> {
    const check = await prisma.check.update({
      where: {
        id: checkId,
        userId // Убеждаемся, что чек принадлежит пользователю
      },
      data
    });

    return check;
  }

  async deleteCheck(checkId: string, userId: string): Promise<void> {
    // First delete all costs associated with the check
    await prisma.cost.deleteMany({
      where: {
        checkId
      }
    });

    // Delete all share links
    await prisma.shareLink.deleteMany({
      where: {
        checkId
      }
    });

    // Delete all persons associated with the check
    await prisma.person.deleteMany({
      where: {
        checkId
      }
    });

    // Finally delete the check itself
    await prisma.check.delete({
      where: {
        id: checkId,
        userId
      }
    });
  }
} 