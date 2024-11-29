import React, { useState, useEffect } from 'react'
import './statistics-section.scss'
import Spinner from '../../components/Spinner/Spinner'

function StatisticsSection({ people, costs, paymentMode, transfers, isCalculating }) {
  const [statistics, setStatistics] = useState({
    peopleStats: [],
    totalStats: {
      totalAmount: 0,
      expenses: []
    }
  })

  useEffect(() => {
    if (transfers.length > 0) {
      const stats = calculateStatistics()
      setStatistics(stats)
    }
  }, [transfers, costs, people])

  const calculateStatistics = () => {
    if (!people?.length || !costs?.length) {
      return {
        peopleStats: [],
        totalStats: {
          totalAmount: 0,
          expenses: []
        }
      }
    }

    const stats = people.map(person => {
      const personExpenses = costs.filter(cost =>
        cost.splitBetween.some(p => p.id === person.id)
      ).map(cost => {
        const splitCount = cost.splitBetween.length;
        const personShare = cost.amount / splitCount;
        const personQuantity = cost.quantity || 1;

        return {
          description: cost.title,
          amount: personShare,
          quantity: personQuantity,
          splitCount: splitCount,
          pricePerUnit: cost.pricePerUnit || cost.amount
        }
      })

      const totalSpent = costs
        .filter(cost => cost.paidBy.some(p => p.id === person.id))
        .reduce((sum, cost) => sum + cost.amount, 0)

      const totalOwed = personExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      const balance = totalSpent - totalOwed

      return {
        id: person.id,
        name: person.name,
        totalAmount: totalSpent,
        balance: balance,
        expenses: personExpenses
      }
    })

    const combinedExpenses = costs.reduce((acc, cost) => {
      const existingExpense = acc.find(exp => exp.title.toLowerCase() === cost.title.toLowerCase());
      
      if (existingExpense) {
        existingExpense.amount += cost.amount;
        existingExpense.quantity += (cost.quantity || 1);
        existingExpense.pricePerUnit = existingExpense.amount / existingExpense.quantity;
      } else {
        acc.push({
          title: cost.title,
          amount: cost.amount,
          quantity: cost.quantity || 1,
          pricePerUnit: cost.pricePerUnit || cost.amount
        });
      }
      return acc;
    }, []);

    const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

    return {
      peopleStats: stats,
      totalStats: {
        totalAmount,
        expenses: combinedExpenses
      }
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatQuantity = (quantity, splitCount) => {
    if (!quantity || !splitCount) return '1';
    
    // Если количество делится нацело на количество участников
    if (quantity % splitCount === 0) {
      return (quantity / splitCount).toString();
    }
    
    // Иначе показываем дробь: количество/количество_участников
    return `${quantity}/${splitCount}`;
  };

  const formatTotalQuantity = (quantity) => {
    if (!quantity) return '1';
    return quantity.toString();
  };

  if (!transfers.length) {
    return null
  }

  return (
    <div className="statistics-section">
      <div className="statistics-section__cards">
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
      </div>
    </div>
  )
}

export default StatisticsSection 