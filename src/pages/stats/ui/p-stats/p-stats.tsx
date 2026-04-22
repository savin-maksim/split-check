import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Users, Calculator } from 'lucide-react'

import { useCurrentCheck, useCheckBalances, getItemTotal } from '@/entities/check'
import { WTransfersCard } from '@/widgets/w-transfers-card'
import { FStatisticsShare } from '@/features/f-statistics-share'
import { PageHeader, EmptyState, Spinner } from '@/shared/ui'
import { cn, formatMoney, useNavActionStore } from '@/shared/lib'
import { buildRoute } from '@/shared/constants'

import './p-stats.scss'

export const PStats = () => {
  const { check, checkId } = useCurrentCheck()
  const setNavAction = useNavActionStore((s) => s.setOnAction)
  const [isShareOpen, setIsShareOpen] = useState(false)

  useEffect(() => {
    setNavAction(() => setIsShareOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])
  const { balances, transfers } = useCheckBalances(check)

  const people = useMemo(() => check?.people ?? [], [check?.people])
  const items = useMemo(() => check?.items ?? [], [check?.items])

  const personStats = useMemo(() => {
    if (!check) return []

    return people.map((person) => {
      const paidItems = items.filter((item) => item.paidBy.includes(person.id))
      const paidTotal = paidItems.reduce((sum, item) => sum + getItemTotal(item), 0)

      const expenses = items
        .filter((item) => (item.split[person.id] ?? 0) > 0)
        .map((item) => {
          const totalWeight = Object.values(item.split).reduce((s, w) => s + Math.max(0, w), 0)
          const personWeight = item.split[person.id] ?? 0
          const share = totalWeight > 0 ? (getItemTotal(item) * personWeight) / totalWeight : 0
          return {
            title: item.title,
            qty: item.qty,
            splitCount: Object.values(item.split).filter((w) => w > 0).length,
            amount: Math.round(share),
          }
        })

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      const balance = balances.get(person.id) ?? 0

      return { id: person.id, name: person.name, paidTotal, expenses, totalExpenses, balance }
    })
  }, [check, people, items, balances])

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + getItemTotal(item), 0), [items])

  if (!check) return null

  if (people.length === 0) {
    return (
      <>
        <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
        <EmptyState
          icon={<Users size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте участников"
        >
          <p>
            Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
          </p>
        </EmptyState>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          className="p-stats__empty-surface"
          icon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте расходы"
        >
          <p>
            Перейдите на <Link to={buildRoute.items(checkId)}>страницу расходов</Link> и добавьте расходы
          </p>
        </EmptyState>
      </>
    )
  }

  if (transfers.length === 0) {
    return (
      <>
        <EmptyState icon={<Spinner />} title="Проверьте позиции">
          <p>Вероятно в одной из них не выбран плательщик и/или участник</p>
        </EmptyState>
      </>
    )
  }

  return (
    <>
      <>
        <PageHeader icon={<BarChart3 size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
        <WTransfersCard transfers={transfers} isLoading={false} />
      </>

      <>
        <div className="p-stats__cards">
          {/* <WTotalCard check={check} /> */}

          <div className="statistics-card statistics-card--summary" data-stat-share="summary">
            <div className="statistics-card__header">
              <h3 className="statistics-card__name">Общая сумма</h3>
            </div>
            <div className="statistics-card__total">
              <h3>{formatMoney(totalAmount)}</h3>
            </div>
            <div className="statistics-card__expenses">
              <div className="statistics-card__expenses-title statistics-card__expenses-title--columns">
                <h4 className="statistics-card__expense-info">Наим.</h4>
                <h4 className="statistics-card__expense-quantity statistics-card__expense-quantity--white">Кол-во</h4>
                <h4 className="statistics-card__expense-amount">Сумма</h4>
              </div>
              {items.map((item) => (
                <div key={item.id} className="statistics-card__expense-item statistics-card__expense-item--detailed">
                  <div className="statistics-card__expense-info">
                    <span>{item.title}</span>
                  </div>
                  <div className="statistics-card__expense-quantity">
                    <span>{item.qty} шт</span>
                  </div>
                  <h4 className="statistics-card__expense-amount">{formatMoney(getItemTotal(item))}</h4>
                </div>
              ))}
            </div>
          </div>

          {personStats.map((person) => {
            if (person.expenses.length === 0) return null

            return (
              <div
                key={person.id}
                className="statistics-card"
                data-stat-share="person"
                data-stat-share-label={person.name}
                data-stat-share-id={String(person.id)}
              >
                <div className="statistics-card__top">
                  <div className="statistics-card__header">
                    <h3 className="statistics-card__name">{person.name}</h3>
                  </div>
                  <div className="statistics-card__info">
                    <span>Потратил(а):</span>
                    <h4>{formatMoney(person.paidTotal)}</h4>
                  </div>
                  <h4 className="statistics-card__expenses-title">Детализация расходов:</h4>
                  <div className="statistics-card__expense-items">
                    {person.expenses.map((expense, idx) => (
                      <div key={idx} className="statistics-card__expense-item statistics-card__expense-item--detailed">
                        <div className="statistics-card__expense-info">
                          <span>{expense.title}</span>
                        </div>
                        <div className="statistics-card__expense-quantity">
                          <span>
                            {expense.qty}/{expense.splitCount} шт
                          </span>
                        </div>
                        <h4 className="statistics-card__expense-amount">{formatMoney(expense.amount)}</h4>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="statistics-card__summary">
                  <div className="statistics-card__summary-item">
                    <h4>Итог:</h4>
                    <h4 className="statistics-card__expense-amount">{formatMoney(person.totalExpenses)}</h4>
                  </div>
                  <div className="statistics-card__summary-item">
                    <h4>Баланс:</h4>
                    <h4
                      className={cn(
                        'statistics-card__expense-amount',
                        person.balance > 0 && 'positive',
                        person.balance < 0 && 'negative',
                      )}
                    >
                      {formatMoney(Math.round(person.balance))}
                    </h4>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </>

      <FStatisticsShare isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  )
}
