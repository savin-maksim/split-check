import { PrismaClient } from '@prisma/client';
import { CheckStats, PersonStats, Transfer, ExpenseDetails, TotalStats } from '../types/stats.types';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

interface BasePerson {
  id: string;
  name: string;
}

interface CostWithRelations {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  paidBy: BasePerson[];
  splitBetween: BasePerson[];
}

type PersonStatsWithDecimal = PersonStats & {
  decimalBalance: Decimal;
};

export class StatsService {
  // Вспомогательная функция для округления до 2 знаков после запятой (только для вывода)
  private roundToTwo(num: Decimal): number {
    return Number(num.toDecimalPlaces(2).toString());
  }

  private formatQuantity(quantity: number, splitCount: number): string {
    return `${quantity}/${splitCount}`;
  }

  async calculateCheckStats(checkId: string): Promise<CheckStats> {
    // Получаем все расходы чека с информацией о плательщиках и участниках
    const costs = await prisma.cost.findMany({
      where: { checkId },
      include: {
        paidBy: true,
        splitBetween: true
      }
    }) as CostWithRelations[];

    // Получаем всех участников чека
    const people = await prisma.person.findMany({
      where: { checkId }
    }) as BasePerson[];

    // Инициализируем статистику по каждому участнику
    const personStatsMap = new Map<string, PersonStatsWithDecimal>();
    people.forEach((person: BasePerson) => {
      personStatsMap.set(person.id, {
        personId: person.id,
        name: person.name,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0,
        decimalBalance: new Decimal(0),
        expenses: []
      });
    });

    // Считаем общую сумму чека и собираем детализацию
    let totalAmount = new Decimal(0);
    const totalExpenses: ExpenseDetails[] = [];

    costs.forEach((cost: CostWithRelations) => {
      const costAmount = new Decimal(cost.amount);
      totalAmount = totalAmount.plus(costAmount);

      // Добавляем в общую детализацию
      totalExpenses.push({
        title: cost.title,
        quantity: cost.quantity,
        amount: Number(costAmount.toString())
      });

      // Распределяем платеж между плательщиками
      const amountPerPayer = costAmount.dividedBy(cost.paidBy.length);
      cost.paidBy.forEach((payer: BasePerson) => {
        const stats = personStatsMap.get(payer.id);
        if (stats) {
          stats.totalPaid = Number(new Decimal(stats.totalPaid).plus(amountPerPayer).toString());
          stats.decimalBalance = new Decimal(stats.decimalBalance).plus(amountPerPayer);
        }
      });

      // Распределяем долг между участниками и добавляем в их детализацию
      const amountPerPerson = costAmount.dividedBy(cost.splitBetween.length);
      cost.splitBetween.forEach((person: BasePerson) => {
        const stats = personStatsMap.get(person.id);
        if (stats) {
          stats.totalOwed = Number(new Decimal(stats.totalOwed).plus(amountPerPerson).toString());
          stats.decimalBalance = stats.decimalBalance.minus(amountPerPerson);

          // Добавляем в детализацию участника его долю
          stats.expenses.push({
            title: cost.title,
            quantity: cost.quantity,
            amount: this.roundToTwo(amountPerPerson),
            splitCount: cost.splitBetween.length
          });
        }
      });
    });

    // Формируем итоговый массив с округленными значениями для вывода
    const personStats: PersonStats[] = [];
    personStatsMap.forEach(stats => {
      // Сортируем расходы по сумме (от большей к меньшей)
      const sortedExpenses = stats.expenses.sort((a, b) => b.amount - a.amount);

      personStats.push({
        personId: stats.personId,
        name: stats.name,
        totalPaid: this.roundToTwo(new Decimal(stats.totalPaid)),
        totalOwed: this.roundToTwo(new Decimal(stats.totalOwed)),
        balance: this.roundToTwo(stats.decimalBalance),
        expenses: sortedExpenses
      });
    });

    // Сортируем участников по балансу (от большего к меньшему)
    personStats.sort((a, b) => b.balance - a.balance);

    // Рассчитываем необходимые переводы
    const transfers = this.calculateTransfers([...personStatsMap.values()]);

    // Формируем общую статистику
    const totalStats: TotalStats = {
      totalAmount: this.roundToTwo(totalAmount),
      expenses: totalExpenses.sort((a, b) => b.amount - a.amount) // Сортируем по сумме
    };

    return {
      totalStats,
      personStats,
      transfers
    };
  }

  private calculateTransfers(personStats: PersonStatsWithDecimal[]): Transfer[] {
    const transfers: Transfer[] = [];
    
    // Разделяем на должников и кредиторов
    const debtors = personStats.filter(p => p.decimalBalance.isNegative())
      .sort((a, b) => a.decimalBalance.comparedTo(b.decimalBalance));
    const creditors = personStats.filter(p => p.decimalBalance.isPositive())
      .sort((a, b) => b.decimalBalance.comparedTo(a.decimalBalance));

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const amount = Decimal.min(debtor.decimalBalance.abs(), creditor.decimalBalance);
      
      if (amount.greaterThan(0.01)) {  // Игнорируем очень маленькие суммы
        transfers.push({
          from: {
            id: debtor.personId,
            name: debtor.name
          },
          to: {
            id: creditor.personId,
            name: creditor.name
          },
          amount: this.roundToTwo(amount)
        });
      }

      // Обновляем балансы
      debtor.decimalBalance = debtor.decimalBalance.plus(amount);
      creditor.decimalBalance = creditor.decimalBalance.minus(amount);

      // Переходим к следующему должнику/кредитору если баланс погашен
      if (debtor.decimalBalance.abs().lessThan(0.01)) debtorIndex++;
      if (creditor.decimalBalance.abs().lessThan(0.01)) creditorIndex++;
    }

    return transfers;
  }

  async getCheckStats(checkId: string) {
    // Get all costs for the check with their related data
    const costs = await prisma.cost.findMany({
      where: { checkId },
      include: {
        paidBy: true,
        splitBetween: true
      }
    });

    // Get all people in the check
    const people = await prisma.person.findMany({
      where: { checkId }
    });

    // Initialize statistics
    const stats = {
      totalAmount: 0,
      peopleCount: people.length,
      costsCount: costs.length,
      averagePerPerson: 0,
      personStats: [] as Array<{
        personId: string;
        personName: string;
        paid: number;
        shouldPay: number;
        balance: number;
      }>
    };

    // Calculate total amount and initialize person stats
    const personStats = new Map<string, {
      personName: string;
      paid: number;
      shouldPay: number;
    }>();

    // Initialize stats for each person
    for (const person of people) {
      personStats.set(person.id, {
        personName: person.name,
        paid: 0,
        shouldPay: 0
      });
    }

    // Calculate costs
    for (const cost of costs) {
      const amount = cost.pricePerUnit * cost.quantity;
      stats.totalAmount += amount;

      // Calculate amount paid by each person
      const payersCount = cost.paidBy.length;
      if (payersCount > 0) {
        const amountPerPayer = amount / payersCount;
        for (const payer of cost.paidBy) {
          const personStat = personStats.get(payer.id);
          if (personStat) {
            personStat.paid += amountPerPayer;
          }
        }
      }

      // Calculate amount that should be paid by each person
      const splitCount = cost.splitBetween.length;
      if (splitCount > 0) {
        const amountPerPerson = amount / splitCount;
        for (const person of cost.splitBetween) {
          const personStat = personStats.get(person.id);
          if (personStat) {
            personStat.shouldPay += amountPerPerson;
          }
        }
      }
    }

    // Calculate average per person if there are people
    if (stats.peopleCount > 0) {
      stats.averagePerPerson = stats.totalAmount / stats.peopleCount;
    }

    // Convert person stats to array and calculate balances
    for (const [personId, stat] of personStats) {
      stats.personStats.push({
        personId,
        personName: stat.personName,
        paid: stat.paid,
        shouldPay: stat.shouldPay,
        balance: stat.paid - stat.shouldPay
      });
    }

    return stats;
  }
} 