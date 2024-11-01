import React, { useState, useEffect } from 'react'
import './statistics-section.scss'
import Spinner from '../../components/Spinner/Spinner'

function StatisticsSection({ people, costs, paymentMode, transfers, isCalculating }) {
  const [statistics, setStatistics] = useState({})

  // Теперь расчет статистики зависит от transfers
  useEffect(() => {
    if (transfers.length > 0) {
      const stats = calculateStatistics()
      setStatistics(stats)
    }
  }, [transfers])

  const calculateStatistics = () => {
    const statistics = {}
    
    // Initialize statistics for each person
    people.forEach(person => {
      statistics[person.name] = {
        spent: 0,
        owned: 0,
        expenses: []
      }
    })

    // Calculate statistics from costs
    costs.forEach(cost => {
      const amountPerPerson = cost.amount / cost.splitBetween.length

      // Add amount to payer's spent total
      if (cost.paidBy.length > 0) {
        const payer = cost.paidBy[0].name
        statistics[payer].spent += cost.amount
      }

      // Add shares to each participant's owned total and expenses list
      cost.splitBetween.forEach(person => {
        statistics[person.name].owned += amountPerPerson
        statistics[person.name].expenses.push({
          description: cost.title,
          amount: amountPerPerson
        })
      })
    })

    return statistics
  }

  const stats = calculateStatistics()

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Если нет transfers, показываем пустой компонент
  if (!transfers.length) {
    return null
  }

  return (
    <div className="statistics-section">
      <div className="statistics-section__cards">
        {Object.entries(statistics).map(([name, stats]) => (
          <div key={name} className="statistics-card">
            <div className="statistics-card__header">
              <h3 className="statistics-card__name">{name}</h3>
              {isCalculating && <Spinner />}
            </div>
            
            {paymentMode === 'single' ? (
              <div className="statistics-card__info">
                <span>Потратил:</span>
                <h4 className=''>{formatAmount(stats.owned)} ₽</h4>
              </div>
            ) : (
              <>
                <div className="statistics-card__info">
                  <span>Потратил(а):</span>
                  <h4 className=''>{formatAmount(stats.spent)} ₽</h4>
                </div>
                <div className="statistics-card__info">
                  <span>Должен(на) заплатить:</span>
                  <h4 className=''>{formatAmount(stats.owned)} ₽</h4>
                </div>
                <div className="statistics-card__info">
                  <span>Баланс:</span>
                  <h4 className=''>{formatAmount(stats.spent - stats.owned)} ₽</h4>
                </div>
              </>
            )}

            {stats.expenses.length > 0 && (
              <div className="statistics-card__expenses">
                <h4 className="statistics-card__expenses-title">
                  Детализация расходов:
                </h4>
                {stats.expenses.map((expense, index) => (
                  <div key={index} className="statistics-card__expense-item">
                    <span>{expense.description}</span>
                    <h4 className=''>{formatAmount(expense.amount)} ₽</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsSection 