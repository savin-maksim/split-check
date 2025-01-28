export interface ExpenseDetails {
  title: string;
  quantity: number;
  amount: number;
  splitCount?: number;  // Количество людей, между которыми разделен расход
}

export interface PersonStats {
  personId: string;
  name: string;
  totalPaid: number;     // Сколько заплатил всего
  totalOwed: number;     // Сколько должен всего
  balance: number;       // Разница между заплатил и должен
  expenses: ExpenseDetails[];  // Детализация расходов
}

export interface TotalStats {
  totalAmount: number;
  expenses: ExpenseDetails[];  // Общая детализация расходов
}

export interface Transfer {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
}

export interface CheckStats {
  totalStats: TotalStats;
  personStats: PersonStats[];
  transfers: Transfer[];
} 