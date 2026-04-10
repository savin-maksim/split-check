import { User, Users, Calculator, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

// Import components
import Button from '@/components/Button/Button'
import Modal from '@/components/Modal/Modal'
import CostCard from '@/components/Cards/Cost/CostCard'
import AddPositionModal from '@/components/Modal/AddPositionModal'
import Arrow from '@/components/Arrow/Arrow'
import ReceiptScanner from '@/components/ReceiptScanner/ReceiptScanner'
import PageSectionHeader from '@/components/PageSectionHeader/PageSectionHeader'
import PageEmptyState from '@/components/PageEmptyState/PageEmptyState'

// Import styles
import './cost-section.scss'
import PersonGrid from '@/components/Cards/Cost/PersonGrid/PersonGrid'
import InputField from '@/components/Input/InputField'

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
        <PageEmptyState
          icon={<Users size={48} aria-hidden />}
          title="Добавьте участников"
          actions={<Arrow className="arrow--to-people" />}
        >
          <p>
            Перейдите на <Link to="/people">страницу участников</Link> и добавьте людей, между которыми нужно разделить
            расходы
          </p>
        </PageEmptyState>
      </div>
    )
  }

  if (!costs.length) {
    return (
      <div className="cost-section">
        <PageEmptyState
          icon={<Calculator size={48} aria-hidden />}
          title="Добавьте расходы"
          actions={
            <>
              <ReceiptScanner onAddCosts={addCosts} paymentMode={paymentMode} singlePayer={singlePayer} />
              {people.length > 0 ? <Arrow /> : null}
            </>
          }
        >
          <p>
            Нажмите на кнопку в навигационной панели, чтобы добавить расходы, которые нужно разделить между участниками
          </p>
          <p>
            Или воспользуйтесь <span className="gemini-text-span">ИИ распознаванием</span>
          </p>
        </PageEmptyState>
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
        icon={<Calculator size={40} aria-hidden />}
        title="Расходы"
        action={
          <Button variant="danger" onClick={() => setIsClearCostsModalOpen(true)}>
            Удалить позиции
          </Button>
        }
      />
      <div className="payment-mode">
        <h3 className="">Режим плательщиков</h3>

        <div className="payment-mode__icons">
          <Button
            icon={<User />}
            onClick={() => changePaymentMode('single')}
            variant={paymentMode === 'single' ? 'active' : ''}
            title="Единый плательщик"
          >
            Единственный
          </Button>
          <Button
            icon={<Users />}
            onClick={() => changePaymentMode('manual')}
            className={paymentMode === 'manual' ? 'button--active' : ''}
            title="Множество плательщиков"
          >
            Множество
          </Button>
        </div>

        <div className="cost-section__search">
          <InputField
            type="text"
            icon={<Search size={20} aria-hidden />}
            clearable
            label="Поиск наименование/имя"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ReceiptScanner onAddCosts={addCosts} paymentMode={paymentMode} singlePayer={singlePayer} />
        </div>

        {paymentMode === 'single' && (
          <div className="payment-mode__single-payer">
            <h3>Выберите плательщика</h3>
            <PersonGrid people={people} selected={singlePayer ? [singlePayer] : []} onToggle={selectSinglePayer} />
          </div>
        )}
      </div>

      <div className="list-layout">
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
          <Button onClick={() => setIsClearCostsModalOpen(false)}>Отмена</Button>
          <Button variant="danger" onClick={confirmRemoveAllCosts}>
            Удалить все
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default CostsPage
