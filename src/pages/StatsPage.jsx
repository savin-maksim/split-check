// Import components
import { useApp } from '../context/AppContext'
import { useTransfers } from '../hooks/useTransfers'
import { useStatistics } from '../hooks/useStatistics'
import TransferCard from '../components/Cards/Transfer/TransferCard'
import Spinner from '../components/Spinner/Spinner'
import { formatAmount, formatQuantity, formatTotalQuantity } from '../utils/formatters.js'
import { Link } from 'react-router-dom'
import { Users, Calculator } from 'lucide-react'

// Import styles
import './statistics-section.scss'
import './transfer-section.scss'

function StatsPage() {
  const { people, costs, paymentMode } = useApp()
  const { transfers, isCalculating: isCalculatingTransfers } = useTransfers(people, costs)
  const { statistics, isCalculating: isCalculatingStats } = useStatistics(people, costs)

  if (!people.length) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Users size={48} />
          <h2>Добавьте участников</h2>
          <p>Перейдите на <Link to="/people">страницу участников</Link> и добавьте людей, между которыми нужно разделить расходы</p>
        </div>
      </div>
    )
  }

  if (!costs.length) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Calculator size={48} />
          <h2>Добавьте расходы</h2>
          <p>Перейдите на <Link to="/costs">страницу расходов</Link> и добавьте расходы, которые нужно разделить между участниками</p>
        </div>
      </div>
    )
  }

  if (isCalculatingTransfers || isCalculatingStats) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Spinner size={48} />
        </div>
      </div>
    )
  }

  if (!transfers.length) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Spinner size={48} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="transfer-section">
        <div className="transfer-section__cards">
          <TransferCard transfers={transfers} isLoading={isCalculatingTransfers} />
        </div>
      </div>

      <div className="statistics-section">
        <div className="statistics-section__cards">
          <div className="statistics-card statistics-card--summary">
            <div className="statistics-card__header">
              <h3 className="statistics-card__name">Общая сумма</h3>
              {isCalculatingStats && <Spinner />}
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
                {isCalculatingStats && <Spinner />}
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StatsPage 