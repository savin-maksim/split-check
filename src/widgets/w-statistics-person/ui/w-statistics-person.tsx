import { cn, formatMoney } from '@/shared/lib'

import './w-statistics-person.scss'

export type TStatisticsPersonExpense = {
  title: string
  qty: number
  splitCount: number
  amount: number
}

export type TStatisticsPersonData = {
  id: number
  name: string
  paidTotal: number
  expenses: TStatisticsPersonExpense[]
  totalExpenses: number
  balance: number
}

type TWStatisticsPersonProps = {
  person: TStatisticsPersonData
}

export const WStatisticsPerson = ({ person }: TWStatisticsPersonProps) => {
  return (
    <div
      className="w-statistics-person"
      data-stat-share="person"
      data-stat-share-label={person.name}
      data-stat-share-id={String(person.id)}
    >
      <div className="w-statistics-person__top">
        <p className="h4 w-statistics-person__title">{person.name}</p>
        <div className="w-statistics-person__spent">
          <span>Потратил(а):</span>
          <span className="h4">{formatMoney(person.paidTotal)}</span>
        </div>
        <p className="h4">Детализация расходов:</p>
        {person.expenses.map((expense, idx) => (
          <div key={idx} className="w-statistics-person__expense">
            <span className="w-statistics-person__expense-name">{expense.title}</span>
            <span className="w-statistics-person__expense-quantity">
              {expense.qty}/{expense.splitCount} шт
            </span>
            <span className="h4 w-statistics-person__expense-amount">{formatMoney(expense.amount)}</span>
          </div>
        ))}
      </div>
      <div className="w-statistics-person__summary">
        <div className="w-statistics-person__summary-item">
          <span className="h4">Итог:</span>
          <span className="h4">{formatMoney(person.totalExpenses)}</span>
        </div>
        <div className="w-statistics-person__summary-item">
          <span className="h4">Баланс:</span>
          <span
            className={cn(
              'h4 w-statistics-person__expense-amount',
              person.balance > 0 && 'positive',
              person.balance < 0 && 'negative',
            )}
          >
            {formatMoney(Math.round(person.balance))}
          </span>
        </div>
      </div>
    </div>
  )
}
