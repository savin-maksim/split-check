import { User, Users, Calculator, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

// Import components
import ActionButton from '../components/Button/ActionButton'
import IconButton from '../components/Button/IconButton'
import Modal from '../components/Modal/Modal'
import PersonButton from '../components/Button/PersonButton'
import CostCard from '../components/Cards/Cost/CostCard'
import AddPositionModal from '../components/Modal/AddPositionModal'
import Arrow from '../components/Arrow/Arrow'
import ReceiptScanner from '../components/ReceiptScanner/ReceiptScanner'
import PageSectionHeader from '../components/PageSectionHeader/PageSectionHeader'

// Import styles
import './cost-section.scss'

function CostsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isClearCostsModalOpen, setIsClearCostsModalOpen] = useState(false)
  const {
    people,
    costs,
    paymentMode,
    singlePayer,
    addCost,
    addCosts,
    updateCost,
    duplicateCost,
    deleteCost,
    removeAllCosts,
    changePaymentMode,
    selectSinglePayer,
    isModalOpen,
    setIsModalOpen,
  } = useApp()

  const filteredCosts = costs.filter((cost) => {
    const query = searchQuery.toLowerCase()
    // Поиск по названию позиции
    const titleMatch = cost.title.toLowerCase().includes(query)
    // Поиск по именам плательщиков
    const payerMatch = cost.paidBy.some((payer) =>
      people
        .find((p) => p.id === payer.id)
        ?.name.toLowerCase()
        .includes(query),
    )
    return titleMatch || payerMatch
  })

  const handleAddPosition = (position) => {
    addCost({
      ...position,
      id: Date.now(),
      distributionType: position.distributionType ?? 'equal',
      weights: position.weights ?? {},
      paidBy: paymentMode === 'single' ? (singlePayer ? [singlePayer] : []) : position.paidBy,
      splitBetween: position.splitBetween,
    })
  }

  const confirmRemoveAllCosts = () => {
    removeAllCosts()
    setIsClearCostsModalOpen(false)
  }

  if (!people.length) {
    return (
      <div className="cost-section">
        <div className="cost-section__empty">
          <Users size={48} />
          <h2>Добавьте участников</h2>
          <p>
            Перейдите на <Link to="/people">страницу участников</Link> и добавьте людей, между которыми нужно разделить
            расходы
          </p>
          <Arrow className="arrow--to-people" />
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
          <p>
            Нажмите на кнопку в навигационной панели, чтобы добавить расходы, которые нужно разделить между участниками
          </p>
          <p>
            Или воспользуйтесь <span className="gemini-text-span">ИИ распознаванием</span>
          </p>
          <div style={{ marginTop: '20px' }}>
            <ReceiptScanner onAddCosts={addCosts} people={people} paymentMode={paymentMode} singlePayer={singlePayer} />
          </div>
          {people.length > 0 && <Arrow />}
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
      <PageSectionHeader
        icon={<Calculator size={28} aria-hidden />}
        title="Расходы"
        action={
          <button type="button" className="cost-section__btn-clear-all" onClick={() => setIsClearCostsModalOpen(true)}>
            Удалить все позиции
          </button>
        }
      />
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
          <div className="search-container">
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Поиск наименование/имя"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ReceiptScanner onAddCosts={addCosts} people={people} paymentMode={paymentMode} singlePayer={singlePayer} />
          </div>
        </div>

        {paymentMode === 'single' && (
          <div className="payment-mode__single-payer">
            <h3>Выберите плательщика</h3>
            <div className="payment-mode__people">
              {people.map((person) => (
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
        {filteredCosts.map((cost) => (
          <CostCard
            key={cost.id}
            id={cost.id}
            title={cost.title}
            amount={cost.amount}
            quantity={cost.quantity}
            pricePerUnit={cost.pricePerUnit}
            paidBy={cost.paidBy}
            splitBetween={cost.splitBetween}
            distributionType={cost.distributionType ?? 'equal'}
            weights={cost.weights ?? {}}
            people={people}
            paymentMode={paymentMode}
            onDelete={() => deleteCost(cost.id)}
            onUpdate={(updatedCost) => updateCost(cost.id, updatedCost)}
            onDuplicate={(newCost) => duplicateCost(cost.id, newCost)}
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

      <Modal isOpen={isClearCostsModalOpen} onClose={() => setIsClearCostsModalOpen(false)}>
        <h2 className="modal__title">Удалить все позиции?</h2>
        <p className="cost-section__modal-text">
          Все расходы в текущем чеке будут удалены. Участники останутся. Действие нельзя отменить.
        </p>
        <div className="modal__buttons">
          <ActionButton onClick={() => setIsClearCostsModalOpen(false)}>Отмена</ActionButton>
          <ActionButton onClick={confirmRemoveAllCosts} className="cost-section__modal-btn-danger">
            Удалить все
          </ActionButton>
        </div>
      </Modal>
    </div>
  )
}

export default CostsPage
