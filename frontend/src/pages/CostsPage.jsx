import { User, Users, Calculator } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import checkService from '../api/check.service'
import costService from '../api/cost.service'
import personService from '../api/person.service'

// Import components
import IconButton from '../components/Button/IconButton'
import PersonButton from '../components/Button/PersonButton'
import CostCard from '../components/Cards/Cost/CostCard'
import AddPositionModal from '../components/Modal/AddPositionModal'
import DeleteConfirmModal from '../components/Modal/DeleteConfirmModal'
import Arrow from '../components/Arrow/Arrow'
import Spinner from '../components/Spinner/Spinner'
import SearchInput from '../components/Input/SearchInput'

// Import styles
import './cost-section.scss'

function CostsPage() {
  const { checkId } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [check, setCheck] = useState(null)
  const [people, setPeople] = useState([])
  const [costs, setCosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const {
    paymentMode,
    singlePayer,
    changePaymentMode,
    selectSinglePayer,
    isModalOpen,
    setIsModalOpen,
    setCurrentCheck
  } = useApp()
  const [costToDelete, setCostToDelete] = useState(null)

  // Загрузка чека, участников и расходов
  useEffect(() => {
    loadCheckData()
  }, [checkId])

  // Обновление расходов при смене единого плательщика
  useEffect(() => {
    const updateCostsForSinglePayer = async () => {
      if (paymentMode === 'single' && singlePayer && costs.length > 0) {
        try {
          // Обновляем каждый расход с новым плательщиком
          const updatePromises = costs.map(cost => {
            const costData = {
              paidBy: {
                set: [{ id: singlePayer.id }]
              }
            }
            return costService.updateCost(checkId, cost.id, costData)
          })

          const updatedCosts = await Promise.all(updatePromises)
          setCosts(updatedCosts)
        } catch (err) {
          setError(err.message || 'Не удалось обновить плательщика в расходах')
        }
      }
    }

    updateCostsForSinglePayer()
  }, [singlePayer, paymentMode])

  const loadCheckData = async () => {
    try {
      setIsLoading(true)
      const [checkResponse, peopleResponse, costsResponse] = await Promise.all([
        checkService.getCheckById(checkId),
        personService.getPeople(checkId),
        costService.getCosts(checkId)
      ])
      console.log('API Responses:', {
        check: checkResponse,
        people: peopleResponse,
        costs: costsResponse
      })
      setCheck(checkResponse)
      setCurrentCheck(checkResponse)
      setPeople(peopleResponse)
      setCosts(costsResponse)
    } catch (err) {
      console.error('Load data error:', err)
      setError(err.message || 'Не удалось загрузить данные')
      if (err.message === 'Check not found') {
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCosts = Array.isArray(costs) ? costs.filter(cost => {
    const query = searchQuery.toLowerCase()
    // Поиск по названию позиции
    const titleMatch = cost.title.toLowerCase().includes(query)
    // Поиск по именам плательщиков
    const payerMatch = cost.paidBy && Array.isArray(cost.paidBy) && cost.paidBy.some(payer =>
      people.find(p => p.id === payer.id)?.name.toLowerCase().includes(query)
    )
    return titleMatch || payerMatch
  }) : [];

  const handleAddPosition = async (position) => {
    try {
      // Проверяем наличие плательщика в режиме single
      if (paymentMode === 'single' && !singlePayer) {
        setError('Выберите плательщика')
        return
      }

      // Преобразуем объекты в массивы ID для бэкенда
      const costData = {
        title: position.title,
        quantity: position.quantity,
        pricePerUnit: position.pricePerUnit,
        paidByIds: paymentMode === 'single'
          ? [singlePayer.id]
          : position.paidBy?.map(person => person.id) || [],
        splitBetweenIds: (position.splitBetween || []).map(person => person.id)
      }

      const response = await costService.createCost(checkId, costData)
      setCosts(prevCosts => [...prevCosts, response])
      setIsModalOpen(null)
    } catch (err) {
      setError(err.message || 'Не удалось добавить расход')
    }
  }

  const handleUpdateCost = async (costId, updatedCost) => {
    try {
      const costData = {}

      // Если изменились плательщики
      if (updatedCost.paidBy !== undefined) {
        costData.paidBy = {
          set: updatedCost.paidBy.map(person => ({ id: person.id }))
        }
      }

      // Если изменились участники для разделения
      if (updatedCost.splitBetween !== undefined) {
        costData.splitBetween = {
          set: updatedCost.splitBetween.map(person => ({ id: person.id }))
        }
      }

      // Если изменились другие поля
      if (updatedCost.title !== undefined) costData.title = updatedCost.title
      if (updatedCost.quantity !== undefined) costData.quantity = updatedCost.quantity
      if (updatedCost.pricePerUnit !== undefined) costData.pricePerUnit = updatedCost.pricePerUnit

      const response = await costService.updateCost(checkId, costId, costData)
      setCosts(prevCosts => prevCosts.map(cost => cost.id === costId ? response : cost))
    } catch (err) {
      setError(err.message || 'Не удалось обновить расход')
    }
  }

  const handleDeleteCost = async (costId) => {
    try {
      await costService.deleteCost(checkId, costId)
      setCosts(costs.filter(cost => cost.id !== costId))
      setCostToDelete(null)
    } catch (err) {
      setError(err.message || 'Не удалось удалить расход')
    }
  }

  const handleStartDelete = (cost) => {
    setCostToDelete(cost)
  }

  const handleDuplicateCost = async (costData, index) => {
    try {
      const response = await costService.createCost(checkId, {
        title: costData.title,
        quantity: costData.quantity || 1,
        pricePerUnit: costData.pricePerUnit || 0,
        paidByIds: paymentMode === 'single' && singlePayer ? [singlePayer.id] : [],
        splitBetweenIds: []
      });

      // Вставляем новую позицию сразу после текущей
      setCosts(prevCosts => {
        const newCosts = [...prevCosts];
        newCosts.splice(index + 1, 0, response);
        return newCosts;
      });
    } catch (err) {
      setError(err.message || 'Не удалось дублировать позицию');
    }
  };

  if (isLoading) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <Spinner size={48} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <div className="error-message">{error}</div>
          <button onClick={loadCheckData} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!people.length) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <Users size={48} />
          <h2>Добавьте участников</h2>
          <p>Перейдите на <Link to={`/checks/${checkId}/people`}>страницу участников</Link> и добавьте людей, между которыми нужно разделить расходы</p>
          <Arrow className="arrow--to-people" title={'Страница участников'} />
        </div>
      </div>
    )
  }

  return (
    <div className="cost-section">
      <div className="payment-mode flex-center flex-center__column">
        <div className="payment-mode__selector">
          <h3>Режим оплаты</h3>
          <div className="payment-mode__icons">
            <IconButton
              icon={<User />}
              onClick={() => changePaymentMode('single')}
              className={`payment-mode__icon ${paymentMode === 'single' ? 'button--icon-active' : ''}`}
              title="Единый плательщик"
            />
            <IconButton
              icon={<Users />}
              onClick={() => changePaymentMode('manual')}
              className={`payment-mode__icon ${paymentMode === 'manual' ? 'button--icon-active' : ''}`}
              title="Множество плательщиков"
            />
          </div>
          <span className="payment-mode__label">
            {paymentMode === 'single' ? 'Единый плательщик' : 'Множество плательщиков'}
          </span>
        </div>

        <div className="cost-section__search">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск..."
          />
        </div>

        {paymentMode === 'single' && (
          <div className="payment-mode__single-payer">
            <h3>Выберите плательщика</h3>
            <div className="payment-mode__people">
              {people.map(person => (
                <PersonButton
                  key={person.id}
                  onClick={() => selectSinglePayer(person)}
                  className={singlePayer?.id === person.id ? 'button__person--active' : ''}
                >
                  {person.name}
                </PersonButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {!costs.length ? (
        <div className="cost-section__empty">
          <Calculator size={48} />
          <h2>Добавьте расходы</h2>
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить расходы, которые нужно разделить между участниками</p>
          {people.length > 0 && <Arrow title={'Тык'} />}
        </div>
      ) : (
        <div className="cost-section__cards">
          {filteredCosts.map((cost, index) => (
            <CostCard
              key={cost.id}
              id={cost.id}
              title={cost.title}
              amount={cost.amount}
              quantity={cost.quantity}
              pricePerUnit={cost.pricePerUnit}
              paidBy={cost.paidBy}
              splitBetween={cost.splitBetween}
              people={people}
              paymentMode={paymentMode}
              onDelete={() => handleStartDelete(cost)}
              onUpdate={(updatedCost) => handleUpdateCost(cost.id, updatedCost)}
              onDuplicate={(costData) => handleDuplicateCost(costData, index)}
            />
          ))}
        </div>
      )}

      <AddPositionModal
        isOpen={isModalOpen === 'addCost'}
        onClose={() => setIsModalOpen(null)}
        onSubmit={handleAddPosition}
        title="Добавить позицию"
        people={people}
        paymentMode={paymentMode}
        singlePayer={singlePayer}
      />

      {costToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setCostToDelete(null)}
          onConfirm={() => handleDeleteCost(costToDelete.id)}
          title="Удаление позиции"
          message={`Вы уверены, что хотите удалить позицию "${costToDelete.title}"?`}
        />
      )}
    </div>
  )
}

export default CostsPage 