// Import components
import { useApp } from '../context/AppContext'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import checkService from '../api/check.service'
import personService from '../api/person.service'
import costService from '../api/cost.service'
import { statsService } from '../api/stats.service.js'
import { transferService } from '../api/transfer.service.js'
import TransferCard from '../components/Cards/Transfer/TransferCard'
import Spinner from '../components/Spinner/Spinner'
import { formatAmount, formatQuantity, formatTotalQuantity } from '../utils/formatters.js'
import { Users, Calculator } from 'lucide-react'
import Arrow from '../components/Arrow/Arrow'

// Import styles
import './statistics-section.scss'
import './transfer-section.scss'

function StatsPage() {
  const { checkId } = useParams()
  const navigate = useNavigate()
  const { paymentMode, setCurrentCheck } = useApp()
  const [check, setCheck] = useState(null)
  const [people, setPeople] = useState([])
  const [costs, setCosts] = useState([])
  const [transfers, setTransfers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [personStats, setPersonStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка чека, участников и расходов
  useEffect(() => {
    loadCheckData()
  }, [checkId])

    const loadCheckData = async () => {
      try {
        setIsLoading(true)
      
      const [
        checkResponse, 
        peopleResponse, 
        costsResponse,
        statsResponse,
        transfersResponse
      ] = await Promise.all([
        checkService.getCheckById(checkId),
        personService.getPeople(checkId),
        costService.getCosts(checkId),
        statsService.getCheckStats(checkId),
        transferService.getCheckTransfers(checkId)
      ])

        setCheck(checkResponse)
      setCurrentCheck(checkResponse)
      setPeople(peopleResponse)
      setCosts(costsResponse)
      setStatistics(statsResponse.totalStats)
      setPersonStats(statsResponse.personStats || [])
      setTransfers(transfersResponse)
      } catch (err) {
      setError(err.message || 'Не удалось загрузить данные')
      if (err.message === 'Check not found') {
        navigate('/')
      }
      } finally {
        setIsLoading(false)
      }
    }

  if (isLoading) {
    console.log('Stats page is loading...')
    return null
  }

  if (error) {
    console.error('Stats page error:', error)
    return null
  }

  if (!people.length) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Users size={48} />
          <h2>Добавьте участников</h2>
          <p>Перейдите на <Link to={`/checks/${checkId}/people`}>страницу участников</Link> и добавьте людей, между которыми нужно разделить расходы</p>
          <Arrow className="arrow--to-people" title={'Страница участников'} />
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
          <p>Перейдите на <Link to={`/checks/${checkId}/costs`}>страницу расходов</Link> и добавьте расходы, которые нужно разделить между участниками</p>
          <Arrow className="arrow--to-cost" title={'Страница расходов'} />
        </div>
      </div>
    )
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

  if (!transfers.length) {
    return (
      <div className="statistics-section">
        <div className="statistics-section__empty">
          <Spinner size={48} />
          <h3>Проверьте позиции</h3>
          <p>Вероятно в одной из них не выбран плательщик и/или участник</p>
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

export default StatsPage 