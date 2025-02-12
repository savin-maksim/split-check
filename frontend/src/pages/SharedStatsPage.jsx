import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { shareService } from '../api/share.service'
import { Calculator, Users } from 'lucide-react'
import Spinner from '../components/Spinner/Spinner'
import TransferCard from '../components/Cards/Transfer/TransferCard'
import { formatAmount, formatQuantity, formatTotalQuantity } from '../utils/formatters'
import './statistics-section.scss'
import './transfer-section.scss'

function SharedStatsPage() {
  const { token } = useParams()
  const [statistics, setStatistics] = useState(null)
  const [transfers, setTransfers] = useState([])
  const [personStats, setPersonStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSharedData()
  }, [token])

  const loadSharedData = async () => {
    try {
      setIsLoading(true)
      const response = await shareService.getSharedCheck(token)
      
      setStatistics(response.totalStats)
      setPersonStats(response.personStats || [])
      setTransfers(response.transfers || [])
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    console.log('Shared stats page is loading...')
    return null
  }

  if (error) {
    console.error('Shared stats page error:', error)
    return null
  }

  if (!statistics || !transfers) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Spinner size={48} />
          <h3>Загрузка статистики...</h3>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="transfer-section">
        <div className="transfer-section__cards">
          <TransferCard transfers={transfers} isLoading={false} />
        </div>
      </div>

      <div className="statistics-section">
        <div className="statistics-section__cards">
          <div className="statistics-card statistics-card--summary">
            <div className="statistics-card__header">
              <h3 className="statistics-card__name">Общая сумма</h3>
            </div>

            <div className="statistics-card__total">
              <h3 className="">{formatAmount(statistics.totalAmount)} ₽</h3>
            </div>

            <div className="statistics-card__expenses">
              <div className="statistics-card__expenses-title statistics-card__expenses-title--columns">
                <h4 className="">Наим.</h4>
                <h4 className="statistics-card__expense-quantity statistics-card__expense-quantity--white">Кол-во</h4>
                <h4 className="statistics-card__expense-amount">Сумма</h4>
              </div>
              {statistics.expenses.map((expense, index) => (
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

          {personStats.map(person => (
            <div key={person.personId} className="statistics-card">
              <div className="statistics-card__header">
                <h3 className="statistics-card__name">{person.name}</h3>
              </div>

              <div className="statistics-card__info">
                <h4 className="">Потратил(а):</h4>
                <h4 className=''>{formatAmount(person.totalPaid)} ₽</h4>
              </div>

              {person.expenses && person.expenses.length > 0 && (
                <div className="statistics-card__expenses">
                  <div className="statistics-card__expense-items">
                    <div className="statistics-card__expenses-title statistics-card__expenses-title--columns">
                      <h4 className="">Наим.</h4>
                      <h4 className="statistics-card__expense-quantity statistics-card__expense-quantity--white">Кол-во</h4>
                      <h4 className="statistics-card__expense-amount">Сумма</h4>
                    </div>
                    {person.expenses.map((expense, index) => (
                      <div key={index} className="statistics-card__expense-item statistics-card__expense-item--detailed">
                        <div className="statistics-card__expense-info">
                          <span className="statistics-card__expense-title">{expense.title}</span>
                        </div>
                        <div className="statistics-card__expense-quantity">
                          <span>{formatQuantity(expense.quantity, expense.splitCount)} шт</span>
                        </div>
                        <h4 className="statistics-card__expense-amount">{formatAmount(expense.amount)} ₽</h4>
                      </div>
                    ))}
                  </div>

                  <div className="statistics-card__summary">
                    <div className="statistics-card__summary-item">
                      <h4 className="">Итог:</h4>
                      <h4 className="statistics-card__expense-amount">
                        {formatAmount(person.expenses.reduce((sum, exp) => sum + exp.amount, 0))} ₽
                      </h4>
                    </div>
                    <div className="statistics-card__summary-item">
                      <h4 className="">Баланс:</h4>
                      <h4 className={`statistics-card__expense-amount ${person.balance > 0 ? 'positive' : person.balance < 0 ? 'negative' : ''}`}>
                        {formatAmount(person.balance)} ₽
                      </h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default SharedStatsPage 