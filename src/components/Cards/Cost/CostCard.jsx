import { Pencil, Trash2, Copy, Minus, Plus, ChartPie } from 'lucide-react'
import IconButton from '../../Button/IconButton'
import Button from '../../Button/Button'
import './cost-card.scss'
import { useState } from 'react'
import MarqueeTitle from '../../MarqueeTitle/MarqueeTitle'
import EditPositionModal from '../../Modal/EditPositionModal'
import { buildWeightsFromSplit, splitBetweenFromWeights } from '../../../utils/costDistribution'

function CostCard({
  id,
  title,
  amount,
  quantity,
  pricePerUnit,
  paidBy,
  splitBetween,
  distributionType = 'equal',
  weights = {},
  onDelete,
  onUpdate,
  onDuplicate,
  people,
  paymentMode,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const patch = (partial) => {
    onUpdate({
      id,
      title,
      amount,
      quantity,
      pricePerUnit,
      paidBy,
      splitBetween,
      distributionType,
      weights,
      ...partial,
    })
  }

  const handleEdit = (updatedCost) => {
    onUpdate({
      ...updatedCost,
      paidBy,
      splitBetween,
      distributionType,
      weights,
    })
    setIsEditModalOpen(false)
  }

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0'
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handlePaidByClick = (person) => {
    if (paymentMode === 'manual') {
      patch({
        paidBy: [person],
      })
    }
  }

  const handleSplitBetweenClick = (person) => {
    if (distributionType === 'weighted') return
    const isSelected = splitBetween.some((p) => p.id === person.id)
    const newSplitBetween = isSelected ? splitBetween.filter((p) => p.id !== person.id) : [...splitBetween, person]

    patch({ splitBetween: newSplitBetween })
  }

  const toggleDistribution = () => {
    if (distributionType === 'weighted') {
      const sb = splitBetweenFromWeights(weights, people)
      patch({
        distributionType: 'equal',
        splitBetween: sb,
        weights: {},
      })
    } else {
      patch({
        distributionType: 'weighted',
        weights: buildWeightsFromSplit(splitBetween, people),
      })
    }
  }

  const adjustWeight = (personId, delta) => {
    const cur = Math.max(0, Math.floor(Number(weights[personId]) || 0))
    const nextVal = Math.max(0, cur + delta)
    const nextWeights = { ...weights, [personId]: nextVal }
    patch({ weights: nextWeights, distributionType: 'weighted' })
  }

  const adjustQuantity = (delta) => {
    const ppu = Number(pricePerUnit) || 0
    const q = Number(quantity) || 1
    const next = q + delta
    if (next <= 0) return
    patch({
      quantity: next,
      amount: next * ppu,
    })
  }

  const qty = Number(quantity) || 1
  const canDecreaseQty = qty - 1 > 0

  return (
    <div className="cost-card">
      <div className="cost-card__header">
        <MarqueeTitle as="h3">{title}</MarqueeTitle>
        <div className="cost-card__actions">
          <IconButton
            icon={<Copy />}
            className="cost-card__action-btn"
            onClick={() =>
              onDuplicate({
                id: Date.now(),
                title,
                amount,
                quantity,
                pricePerUnit,
                paidBy,
                splitBetween: [...splitBetween],
                distributionType,
                weights: { ...weights },
              })
            }
            title="Дублировать"
          />
          <IconButton
            icon={<Pencil />}
            className="cost-card__action-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Редактировать"
          />
          <IconButton icon={<Trash2 />} className="icon-button--danger" onClick={onDelete} title="Удалить" />
        </div>
      </div>

      {paymentMode === 'manual' && (
        <div className="cost-card__section">
          <p className="cost-card__label">Кто платил?</p>
          <div className="cost-card__tags">
            {people.map((person) => (
              <Button
                key={person.id}
                className={`button-new ${paidBy.some((p) => p.id === person.id) ? 'button-new--active' : ''}`}
                onClick={() => handlePaidByClick(person)}
              >
                {person.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="cost-card__section">
        <div className="cost-card__split-header">
          <p className="cost-card__label cost-card__label--inline">На кого разделить?</p>
          <IconButton
            icon={<ChartPie />}
            className={`icon-button${distributionType === 'weighted' ? ' icon-button--active' : ''}`}
            onClick={toggleDistribution}
            ariaLabel={distributionType === 'weighted' ? 'Переключить на равные доли' : 'Переключить на доли по весам'}
          />
        </div>

        {distributionType === 'equal' ? (
          <div className="cost-card__tags">
            {people.map((person) => (
              <Button
                key={person.id}
                className={`button-new ${splitBetween.some((p) => p.id === person.id) ? 'button-new--active' : ''}`}
                onClick={() => handleSplitBetweenClick(person)}
              >
                {person.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="cost-card__weights-grid">
            {people.map((person) => {
              const u = Math.max(0, Math.floor(Number(weights[person.id]) || 0))
              return (
                <div key={person.id} className={`button-new button-new--weight${u > 0 ? ' button-new--active' : ''}`}>
                  <IconButton
                    className="icon-button--wide"
                    icon={<Minus size={18} />}
                    onClick={() => adjustWeight(person.id, -1)}
                    disabled={u <= 0}
                    aria-label="Меньше"
                  />
                  <span className="cost-card__weight-label">
                    x{u} {person.name}
                  </span>
                  <IconButton
                    className="icon-button--wide"
                    icon={<Plus size={18} />}
                    onClick={() => adjustWeight(person.id, 1)}
                    aria-label="Больше"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="cost-card__footer">
        <div className="cost-card__calculation">
          <div className="cost-card__calculation-details">
            <div className="cost-card__qty-stepper" role="group" aria-label="Количество">
              <IconButton
                icon={<Minus size={18} />}
                className="icon-button--qty"
                onClick={() => adjustQuantity(-1)}
                disabled={!canDecreaseQty}
                aria-label="Уменьшить количество"
              />
              <span className="cost-card__qty-value">{qty}</span>
              <IconButton
                icon={<Plus size={18} />}
                className="icon-button--qty"
                onClick={() => adjustQuantity(1)}
                aria-label="Увеличить количество"
              />
            </div>
            <span className="cost-card__calculation-formula">× {formatAmount(pricePerUnit || 0)}</span>
          </div>
          <h3 className="cost-card__amount">{formatAmount(amount)}</h3>
        </div>
      </div>

      <EditPositionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        title="Редактирование"
        initialData={{
          id,
          title,
          amount,
          quantity,
          pricePerUnit,
          paidBy,
          splitBetween,
        }}
      />
    </div>
  )
}

export default CostCard
