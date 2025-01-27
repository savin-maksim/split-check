import { User, Users, Calculator } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

// Import components
import IconButton from '../components/Button/IconButton'
import PersonButton from '../components/Button/PersonButton'
import CostCard from '../components/Cards/Cost/CostCard'
import AddPositionModal from '../components/Modal/AddPositionModal'

// Import styles
import './cost-section.scss'

function CostsPage() {
  const { 
    people,
    costs,
    paymentMode,
    singlePayer,
    addCost,
    updateCost,
    deleteCost,
    changePaymentMode,
    selectSinglePayer,
    isModalOpen,
    setIsModalOpen
  } = useApp()

  const handleAddPosition = (position) => {
    addCost({
      ...position,
      id: Date.now(),
      // В режиме single используем singlePayer, в режиме manual используем выбранного в модальном окне
      paidBy: paymentMode === 'single' ? (singlePayer ? [singlePayer] : []) : position.paidBy,
      // Всегда используем выбранных в модальном окне участников
      splitBetween: position.splitBetween
    })
  }

  if (!people.length) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <Users size={48} />
          <h2>Добавьте участников</h2>
          <p>Перейдите на <Link to="/people">страницу участников</Link> и добавьте людей, между которыми нужно разделить расходы</p>
        </div>
        <AddPositionModal 
          isOpen={isModalOpen === 'addCost'}
          onClose={() => setIsModalOpen(null)}
          onSubmit={handleAddPosition}
          title="Добавить расход"
          people={people}
          paymentMode={paymentMode}
        />
      </div>
    )
  }

  if (!costs.length) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <Calculator size={48} />
          <h2>Добавьте расходы</h2>
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить расходы, которые нужно разделить между участниками</p>
        </div>
        <AddPositionModal 
          isOpen={isModalOpen === 'addCost'}
          onClose={() => setIsModalOpen(null)}
          onSubmit={handleAddPosition}
          title="Добавить расход"
          people={people}
          paymentMode={paymentMode}
        />
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

      <div className="cost-section__cards">
        {costs.map(cost => (
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
            onDelete={() => deleteCost(cost.id)}
            onUpdate={(updatedCost) => updateCost(cost.id, updatedCost)}
          />
        ))}
      </div>

      <AddPositionModal 
        isOpen={isModalOpen === 'addCost'}
        onClose={() => setIsModalOpen(null)}
        onSubmit={handleAddPosition}
        title="Добавить расход"
        people={people}
        paymentMode={paymentMode}
      />
    </div>
  )
}

export default CostsPage 