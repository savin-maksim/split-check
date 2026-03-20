import { Pencil, Trash2, Copy, Minus, Plus } from 'lucide-react'
import PersonButton from '../../Button/PersonButton'
import IconButton from '../../Button/IconButton'
import './cost-card.scss'
import { useState, useRef, useLayoutEffect } from 'react'
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
  paymentMode
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const titleTrackRef = useRef(null)
  const titleInnerRef = useRef(null)

  useLayoutEffect(() => {
    const track = titleTrackRef.current
    const inner = titleInnerRef.current
    if (!track || !inner) return

    const update = () => {
      const overflow = inner.scrollWidth - track.clientWidth
      if (overflow > 1) {
        track.style.setProperty('--scroll', `${overflow}px`)
        track.classList.add('cost-card__title-track--marquee')
      } else {
        track.classList.remove('cost-card__title-track--marquee')
        track.style.removeProperty('--scroll')
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(track)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [title])

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
      ...partial
    })
  }

  const handleEdit = (updatedCost) => {
    onUpdate({
      ...updatedCost,
      paidBy,
      splitBetween,
      distributionType,
      weights
    })
    setIsEditModalOpen(false)
  }

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0'
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const handlePaidByClick = (person) => {
    if (paymentMode === 'manual') {
      patch({
        paidBy: [person]
      })
    }
  }

  const handleSplitBetweenClick = (person) => {
    if (distributionType === 'weighted') return
    const isSelected = splitBetween.some((p) => p.id === person.id)
    const newSplitBetween = isSelected
      ? splitBetween.filter((p) => p.id !== person.id)
      : [...splitBetween, person]

    patch({ splitBetween: newSplitBetween })
  }

  const toggleDistribution = () => {
    if (distributionType === 'weighted') {
      const sb = splitBetweenFromWeights(weights, people)
      patch({
        distributionType: 'equal',
        splitBetween: sb,
        weights: {}
      })
    } else {
      patch({
        distributionType: 'weighted',
        weights: buildWeightsFromSplit(splitBetween, people)
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
      amount: next * ppu
    })
  }

  const qty = Number(quantity) || 1
  const canDecreaseQty = qty - 1 > 0

  return (
    <div className="cost-card">
      <div className="cost-card__header">
        <div ref={titleTrackRef} className="cost-card__title-track">
          <div className="cost-card__title">
            <h3 ref={titleInnerRef} className="cost-card__title-inner">
              {title}
            </h3>
          </div>
        </div>
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
                weights: { ...weights }
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
          <IconButton
            icon={<Trash2 />}
            className="cost-card__action-btn cost-card__action-btn--delete"
            onClick={onDelete}
            title="Удалить"
          />
        </div>
      </div>

      {paymentMode === 'manual' && (
        <div className="cost-card__section">
          <p className="cost-card__label">Кто платил?</p>
          <div className="cost-card__tags">
            {people.map((person) => (
              <PersonButton
                key={person.id}
                className={`cost-card__tag ${paidBy.some((p) => p.id === person.id) ? 'button__person--active' : ''}`}
                onClick={() => handlePaidByClick(person)}
              >
                {person.name}
              </PersonButton>
            ))}
          </div>
        </div>
      )}

      <div className="cost-card__section">
        <div className="cost-card__split-header">
          <p className="cost-card__label cost-card__label--inline">На кого разделить?</p>
          <button type="button" className="cost-card__mode-toggle" onClick={toggleDistribution}>
            {distributionType === 'weighted' ? 'Равные доли' : 'По долям (веса)'}
          </button>
        </div>

        {distributionType === 'equal' ? (
          <div className="cost-card__tags">
            {people.map((person) => (
              <PersonButton
                key={person.id}
                className={`cost-card__tag ${splitBetween.some((p) => p.id === person.id) ? 'button__person--active' : ''}`}
                onClick={() => handleSplitBetweenClick(person)}
              >
                {person.name}
              </PersonButton>
            ))}
          </div>
        ) : (
          <div className="cost-card__weights-grid">
            {people.map((person) => {
              const u = Math.max(0, Math.floor(Number(weights[person.id]) || 0))
              return (
                <div
                  key={person.id}
                  className={`cost-card__weight-row button button__person cost-card__tag${u > 0 ? ' button__person--active' : ''}`}
                >
                  <button
                    type="button"
                    className="cost-card__weight-btn"
                    onClick={() => adjustWeight(person.id, -1)}
                    disabled={u <= 0}
                    aria-label="Меньше"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="cost-card__weight-label">
                    x{u} {person.name}
                  </span>
                  <button
                    type="button"
                    className="cost-card__weight-btn"
                    onClick={() => adjustWeight(person.id, 1)}
                    aria-label="Больше"
                  >
                    <Plus size={18} />
                  </button>
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
              <button
                type="button"
                className="cost-card__qty-btn"
                onClick={() => adjustQuantity(-1)}
                disabled={!canDecreaseQty}
                aria-label="Уменьшить количество"
              >
                <Minus size={18} />
              </button>
              <span className="cost-card__qty-value">{qty}</span>
              <button
                type="button"
                className="cost-card__qty-btn"
                onClick={() => adjustQuantity(1)}
                aria-label="Увеличить количество"
              >
                <Plus size={18} />
              </button>
            </div>
            <span className="cost-card__calculation-formula">
              × {formatAmount(pricePerUnit || 0)}
            </span>
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
          splitBetween
        }}
      />
    </div>
  )
}

export default CostCard
