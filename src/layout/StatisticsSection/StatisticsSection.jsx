import React from 'react'
import './statistics-section.scss'

function StatisticsSection({ people, costs, paymentMode }) {
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

  return (
    <div className="statistics-section">
      <div className="statistics-section__cards">
        {people.map(person => {
          const personStats = stats[person.name]
          const balance = personStats.spent - personStats.owned

          return (
            <div key={person.id} className="statistics-card">
              <h3 className="statistics-card__name">{person.name}</h3>
              
              {paymentMode === 'single' ? (
                <div className="statistics-card__info">
                  <span>Потратил:</span>
                  <h4>{personStats.owned.toFixed(2)} ₽</h4>
                </div>
              ) : (
                <>
                  <div className="statistics-card__info">
                    <span>Потратил(а):</span>
                    <h4 className=''>{personStats.spent.toFixed(2)} ₽</h4>
                  </div>
                  <div className="statistics-card__info">
                    <span>Должен(на) заплатить:</span>
                    <h4 className=''>{personStats.owned.toFixed(2)} ₽</h4>
                  </div>
                  <div className="statistics-card__info">
                    <span>Баланс:</span>
                    <h4 className=''>{balance.toFixed(2)} ₽</h4>
                  </div>
                </>
              )}

              {personStats.expenses.length > 0 && (
                <div className="statistics-card__expenses">
                  <h4 className="statistics-card__expenses-title">
                    Детализация расходов:
                  </h4>
                  {personStats.expenses.map((expense, index) => (
                    <div key={index} className="statistics-card__expense-item">
                      <span>{expense.description}</span>
                      <h4 className=''>{expense.amount.toFixed(2)} ₽</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatisticsSection 