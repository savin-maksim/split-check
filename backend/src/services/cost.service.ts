import { PrismaClient } from '@prisma/client';
import { CreateCostDTO, CostResponse, UpdateCostDTO, CostWithDetails } from '../types/cost.types';

const prisma = new PrismaClient();

export class CostService {
  private calculateAmount(quantity: number, pricePerUnit: number): number {
    return quantity * pricePerUnit;
  }

  async createCost(data: CreateCostDTO): Promise<CostResponse> {
    const amount = this.calculateAmount(data.quantity, data.pricePerUnit);

    const cost = await prisma.cost.create({
      data: {
        title: data.title,
        quantity: data.quantity,
        pricePerUnit: data.pricePerUnit,
        amount,
        check: {
          connect: { id: data.checkId }
        },
        paidBy: {
          connect: data.paidByIds.map(id => ({ id }))
        },
        splitBetween: {
          connect: data.splitBetweenIds.map(id => ({ id }))
        }
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        },
        splitBetween: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return cost;
  }

  async getCostsInCheck(checkId: string): Promise<CostResponse[]> {
    const costs = await prisma.cost.findMany({
      where: {
        checkId
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        },
        splitBetween: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return costs;
  }

  async getCostById(costId: string): Promise<CostWithDetails | null> {
    const cost = await prisma.cost.findUnique({
      where: {
        id: costId
      },
      include: {
        check: {
          select: {
            id: true,
            title: true
          }
        },
        paidBy: {
          select: {
            id: true,
            name: true
          }
        },
        splitBetween: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return cost;
  }

  async updateCost(costId: string, data: UpdateCostDTO): Promise<CostResponse> {
    const updateData: any = { ...data };
    
    if (data.quantity !== undefined || data.pricePerUnit !== undefined) {
      const currentCost = await prisma.cost.findUnique({
        where: { id: costId }
      });
      
      if (!currentCost) {
        throw new Error('Cost not found');
      }

      const quantity = data.quantity ?? currentCost.quantity;
      const pricePerUnit = data.pricePerUnit ?? currentCost.pricePerUnit;
      updateData.amount = this.calculateAmount(quantity, pricePerUnit);
    }

    // Обновляем связи с людьми, если они предоставлены
    if (data.paidByIds) {
      updateData.paidBy = {
        set: data.paidByIds.map(id => ({ id }))
      };
    }

    if (data.splitBetweenIds) {
      updateData.splitBetween = {
        set: data.splitBetweenIds.map(id => ({ id }))
      };
    }

    const cost = await prisma.cost.update({
      where: {
        id: costId
      },
      data: updateData,
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        },
        splitBetween: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return cost;
  }

  async deleteCost(costId: string): Promise<void> {
    await prisma.cost.delete({
      where: {
        id: costId
      }
    });
  }

  async deleteAllCostsFromCheck(checkId: string): Promise<void> {
    await prisma.cost.deleteMany({
      where: {
        checkId
      }
    });
  }
} 