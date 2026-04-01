import { Pencil, Trash2, Copy, Minus, Plus, ChartPie, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import IconButton from '../../Button/IconButton'
import Button from '../../Button/Button'
import './cost-card.scss'
import { useState, useCallback } from 'react'
import MarqueeTitle from '../../MarqueeTitle/MarqueeTitle'
import { StorageService } from '../../../services/storage'
import EditPositionModal from '../../Modal/EditPositionModal'
import { buildWeightsFromSplit, splitBetweenFromWeights } from '../../../utils/costDistribution'
import { getTagGridItemClassName } from '../../../utils/tagGrid'

function initialPaidByExpanded(costId, paidBy) {
  const saved = StorageService.getCostCardPaidByExpanded()[String(costId)]
  if (typeof saved === 'boolean') return saved
  return paidBy.length === 0
}

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
  const [paidByTagsExpanded, setPaidByTagsExpanded] = useState(() => initialPaidByExpanded(id, paidBy))

  const setPaidBySectionExpanded = useCallback(
    (expanded) => {
      StorageService.setCostCardPaidByExpanded(id, expanded)
      setPaidByTagsExpanded(expanded)
    },
    [id],
  )

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
      setPaidBySectionExpanded(false)
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
      <div className="header">
        <MarqueeTitle as="h3">{title}</MarqueeTitle>
        <div className="header__actions">
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
          <IconButton icon={<Pencil />} onClick={() => setIsEditModalOpen(true)} title="Редактировать" />
          <IconButton icon={<Trash2 />} variant="danger" onClick={onDelete} title="Удалить" />
        </div>
      </div>

      {paymentMode === 'manual' && (
        <div className="section">
          <div className={`section__label${paidByTagsExpanded ? '' : ' section__label--collapsed'}`}>
            <span>Кто платил?</span>
            {!paidByTagsExpanded && paidBy.length > 0 && (
              <span className="section__label-picked">{paidBy.map((p) => p.name)}</span>
            )}
            <IconButton
              icon={paidByTagsExpanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
              onClick={() => setPaidBySectionExpanded(!paidByTagsExpanded)}
              aria-expanded={paidByTagsExpanded}
              aria-label={paidByTagsExpanded ? 'Скрыть список' : 'Показать список'}
              title={paidByTagsExpanded ? 'Скрыть список' : 'Показать список'}
            />
          </div>
          <div className={`section__tags-collapse${paidByTagsExpanded ? ' section__tags-collapse--open' : ''}`}>
            <div className="section__tags-collapse-inner">
              <div className="section__tags">
                {people.map((person, i) => (
                  <Button
                    key={person.id}
                    className={[
                      'button',
                      getTagGridItemClassName(i, people.length),
                      paidBy.some((p) => p.id === person.id) ? 'button--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handlePaidByClick(person)}
                  >
                    {person.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section__label">
          <p className="">На кого разделить?</p>
          <IconButton
            icon={<ChartPie />}
            variant={distributionType === 'weighted' ? 'active' : ''}
            onClick={toggleDistribution}
            aria-label={distributionType === 'weighted' ? 'Переключить на равные доли' : 'Переключить на доли по весам'}
          />
        </div>

        {distributionType === 'equal' ? (
          <div className="section__tags">
            {people.map((person, i) => (
              <Button
                key={person.id}
                className={[
                  'button',
                  getTagGridItemClassName(i, people.length),
                  splitBetween.some((p) => p.id === person.id) ? 'button--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSplitBetweenClick(person)}
              >
                {person.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="section__weights-tags">
            {people.map((person) => {
              const u = Math.max(0, Math.floor(Number(weights[person.id]) || 0))
              return (
                <div key={person.id} className={`button button--weight${u > 0 ? ' button--active' : ''}`}>
                  <IconButton
                    variant="wide"
                    icon={<Minus size={16} />}
                    onClick={() => adjustWeight(person.id, -1)}
                    disabled={u <= 0}
                    aria-label="Меньше"
                  />
                  <span className="button__label">
                    x{u} {person.name}
                  </span>
                  <IconButton
                    variant="wide"
                    icon={<Plus size={16} />}
                    onClick={() => adjustWeight(person.id, 1)}
                    aria-label="Больше"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="footer">
        <div className="footer__inner">
          <div className="left-column">
            <div className="qty-stepper" role="group" aria-label="Количество">
              <IconButton
                icon={<Minus size={16} />}
                className="icon-button--qty"
                onClick={() => adjustQuantity(-1)}
                disabled={!canDecreaseQty}
                aria-label="Уменьшить количество"
              />
              <span className="qty-stepper__value">{qty}</span>
              <IconButton
                icon={<Plus size={16} />}
                className="icon-button--qty"
                onClick={() => adjustQuantity(1)}
                aria-label="Увеличить количество"
              />
            </div>
            <span className="calculation-formula">× {formatAmount(pricePerUnit || 0)}</span>
          </div>
          <h3 className="total-amount">{formatAmount(amount)}</h3>
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
