import { useMemo } from 'react'

import type { TItem } from '@/entities/check'
import { getItemTotal } from '@/entities/check'

import { formatMoney } from '@/shared/lib'

import './w-statistics-summary.scss'

type TWStatisticsSummaryProps = {
  items: TItem[]
}

export const WStatisticsSummary = ({ items }: TWStatisticsSummaryProps) => {
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + getItemTotal(item), 0), [items])

  return (
    <div className="w-statistics-summary" data-stat-share="summary" data-stat-share-label="Общая сумма">
      <h3 className="w-statistics-summary__title">Общая сумма</h3>
      <span className="h3 w-statistics-summary__total">{formatMoney(totalAmount)}</span>
      <div className="w-statistics-summary__expenses">
        <div className="w-statistics-summary__expenses-title w-statistics-summary__expenses-title--columns">
          <span className="h4">Наим.</span>
          <span className="h4">Кол-во</span>
          <span className="h4">Сумма</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="w-statistics-summary__expense-row">
            <span className="w-statistics-summary__expense-title">{item.title}</span>
            <span className="w-statistics-summary__expense-quantity">{item.qty} шт</span>
            <span className="h4 w-statistics-summary__expense-amount">{formatMoney(getItemTotal(item))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
