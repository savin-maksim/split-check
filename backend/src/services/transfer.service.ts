import { PrismaClient } from '@prisma/client';
import { Transfer } from '../types/transfer.types';

const prisma = new PrismaClient();

export class TransferService {
  async calculateTransfers(checkId: string): Promise<Transfer[]> {
    // Получаем все расходы чека с информацией о плательщиках и участниках
    const costs = await prisma.cost.findMany({
      where: { checkId },
      include: {
        paidBy: true,
        splitBetween: true
      }
    });

    // Создаем карту баланса для каждого участника
    const balances = new Map<string, number>();

    // Рассчитываем, сколько каждый заплатил и сколько должен
    for (const cost of costs) {
      const amount = cost.pricePerUnit * cost.quantity;
      const splitCount = cost.splitBetween.length;
      
      if (splitCount === 0) continue;

      const amountPerPerson = amount / splitCount;

      // Добавляем сумму плательщикам
      for (const payer of cost.paidBy) {
        const currentBalance = balances.get(payer.id) || 0;
        balances.set(payer.id, currentBalance + amount);
      }

      // Вычитаем доли у участников
      for (const person of cost.splitBetween) {
        const currentBalance = balances.get(person.id) || 0;
        balances.set(person.id, currentBalance - amountPerPerson);
      }
    }

    // Получаем список всех участников
    const people = await prisma.person.findMany({
      where: { checkId }
    });

    // Создаем массив с положительными и отрицательными балансами
    const positiveBalances: Array<{ id: string; balance: number }> = [];
    const negativeBalances: Array<{ id: string; balance: number }> = [];

    for (const person of people) {
      const balance = balances.get(person.id) || 0;
      if (balance > 0) {
        positiveBalances.push({ id: person.id, balance });
      } else if (balance < 0) {
        negativeBalances.push({ id: person.id, balance: Math.abs(balance) });
      }
    }

    // Сортируем балансы по убыванию
    positiveBalances.sort((a, b) => b.balance - a.balance);
    negativeBalances.sort((a, b) => b.balance - a.balance);

    // Создаем переводы
    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;

    while (i < positiveBalances.length && j < negativeBalances.length) {
      const from = await prisma.person.findUnique({
        where: { id: negativeBalances[j].id }
      });
      const to = await prisma.person.findUnique({
        where: { id: positiveBalances[i].id }
      });

      if (!from || !to) continue;

      const amount = Math.min(positiveBalances[i].balance, negativeBalances[j].balance);
      
      if (amount > 0) {
        transfers.push({
          from: { id: from.id, name: from.name },
          to: { id: to.id, name: to.name },
          amount
        });
      }

      positiveBalances[i].balance -= amount;
      negativeBalances[j].balance -= amount;

      if (positiveBalances[i].balance < 0.01) i++;
      if (negativeBalances[j].balance < 0.01) j++;
    }

    return transfers;
  }
} 