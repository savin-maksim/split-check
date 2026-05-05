import { cn, formatMoney } from '@/shared/lib'
import { AnimatedNumber } from '@/shared/ui'

import './w-statistics-person.scss'

export type TStatisticsPersonExpense = {
  title: string
  qtyNumerator: number
  qtyDenominator: number
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
  const balanceRounded = Math.round(person.balance)

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
          <AnimatedNumber value={person.paidTotal} format={formatMoney} className="h4" />
        </div>
        <p className="h4">Детализация расходов:</p>
        {person.expenses.map((expense, idx) => (
          <div key={`${person.id}-${idx}`} className="w-statistics-person__expense">
            <span className="w-statistics-person__expense-name">{expense.title}</span>
            <span className="w-statistics-person__expense-quantity">
              {expense.qtyNumerator}/{expense.qtyDenominator} шт
            </span>
            <AnimatedNumber
              value={expense.amount}
              format={formatMoney}
              className="h4 w-statistics-person__expense-amount"
            />
          </div>
        ))}
      </div>
      <div className="w-statistics-person__summary">
        <div className="w-statistics-person__summary-item">
          <span className="h4">Итог:</span>
          <AnimatedNumber value={person.totalExpenses} format={formatMoney} className="h4" />
        </div>
        <div className="w-statistics-person__summary-item">
          <span className="h4">Баланс:</span>
          <AnimatedNumber
            value={balanceRounded}
            format={formatMoney}
            className={cn(
              'h4 w-statistics-person__expense-amount',
              person.balance > 0 && 'positive',
              person.balance < 0 && 'negative',
            )}
          />
        </div>
      </div>
    </div>
  )
}
