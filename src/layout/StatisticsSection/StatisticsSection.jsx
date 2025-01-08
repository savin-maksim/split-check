import React from 'react'
import './statistics-section.scss'
import Spinner from '../../components/Spinner/Spinner'
import { useStatistics } from '../../hooks/useStatistics'
import { formatAmount, formatQuantity, formatTotalQuantity } from '../../utils/formatters'

function StatisticsSection({ people, costs, paymentMode, transfers, isCalculating }) {
  const statistics = useStatistics(people, costs)

  if (!transfers.length) {
    return null
  }

  return (
    <div className="statistics-section">
      <div className="statistics-section__cards">
        <div className="statistics-card statistics-card--summary">
          <div className="statistics-card__header">
            <h3 className="statistics-card__name">Общая сумма</h3>
            {isCalculating && <Spinner />}
          </div>

          <div className="statistics-card__total">
            <h3 className="">{formatAmount(statistics.totalStats.totalAmount)} ₽</h3>
          </div>

          <div className="statistics-card__expenses">
            <div className="statistics-card__expenses-title statistics-card__expenses-title--columns">
              <h4 className="">Наим.</h4>
              <h4 className="statistics-card__expense-quantity statistics-card__expense-quantity--white">Кол-во</h4>
              <h4 className="statistics-card__expense-amount">Сумма</h4>
            </div>
            {statistics.totalStats.expenses.map((expense, index) => (
              <div key={index} className="statistics-card__expense-item statistics-card__expense-item--detailed">
                <div className="statistics-card__expense-info">
                  <span className="statistics-card__expense-title">{expense.title}</span>
                </div>
                <div className="statistics-card__expense-quantity">
                  <span>{formatTotalQuantity(expense.quantity)} шт</span>
                </div>
                <h4 className="statistics-card__expense-amount">{formatAmount(expense.amount)} ₽</h4>
              </div>
            ))}
          </div>
        </div>
        {statistics.peopleStats.map(person => (
          <div key={person.id} className="statistics-card">
            <div className="statistics-card__header">
              <h3 className="statistics-card__name">{person.name}</h3>
              {isCalculating && <Spinner />}
            </div>

            {paymentMode === 'single' ? (
              <div className="statistics-card__info">
                <span>Потратил:</span>
                <h4 className=''>{formatAmount(person.totalAmount)} ₽</h4>
              </div>
            ) : (
              <div className="statistics-card__info">
                <span>Потратил(а):</span>
                <h4 className=''>{formatAmount(person.totalAmount)} ₽</h4>
              </div>
            )}

            {person.expenses.length > 0 && (
              <div className="statistics-card__expenses">
                <h4 className="statistics-card__expenses-title">
                  Детализация расходов:
                </h4>
                {person.expenses.map((expense, index) => (
                  <div key={index} className="statistics-card__expense-item statistics-card__expense-item--detailed">
                    <div className="statistics-card__expense-info">
                      <span className="statistics-card__expense-title">{expense.description}</span>
                    </div>
                    <div className="statistics-card__expense-quantity">
                      <span>{formatQuantity(expense.quantity, expense.splitCount)} шт</span>
                    </div>
                    <h4 className="statistics-card__expense-amount">{formatAmount(expense.amount)} ₽</h4>
                  </div>
                ))}
                <div className="statistics-card__expense-item statistics-card__expense-item--total">
                  <div className="statistics-card__expense-info">
                    <h4 className="statistics-card__expense-title">Итого</h4>
                  </div>
                  <div className="statistics-card__expense-quantity"></div>
                  <h4 className="statistics-card__expense-amount">
                    {formatAmount(person.expenses.reduce((sum, exp) => sum + exp.amount, 0))} ₽
                  </h4>
                </div>
                {paymentMode === 'manual' && (
                  <div className="statistics-card__expense-item statistics-card__expense-item--balance">
                    <div className="statistics-card__expense-info">
                      <h4 className="statistics-card__expense-title">Баланс</h4>
                    </div>
                    <div className="statistics-card__expense-quantity"></div>
                    <h4 className="statistics-card__expense-amount">
                      {formatAmount(person.balance)} ₽
                    </h4>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsSection 