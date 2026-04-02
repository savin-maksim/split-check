import CardHeader from './CardHeader'
import WhoPaidSection from './WhoPaidSection/WhoPaidSection'
import SplitBetweenSection from './SplitBetweenSection/SplitBetweenSection'
import QtyStepper from './QtyStepper/QtyStepper'
import { useState, useCallback } from 'react'
import { StorageService } from '../../../services/storage'
import EditPositionModal from '../../Modal/EditPositionModal'
import { buildWeightsFromSplit, splitBetweenFromWeights } from '../../../utils/costDistribution'
import { togglePaidByManual } from '../../../utils/togglePaidBy'
import CardTotalAmount from './CardTotalAmount'
import CardFooter from './CardFooter'
import Card from './Card'

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
    togglePaidByManual({
      person,
      onPick: (selected) => patch({ paidBy: selected }),
      onCollapse: () => setPaidBySectionExpanded(false),
    })
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
    <Card>
      <CardHeader
        as="h3"
        title={title}
        onDuplicate={
          onDuplicate
            ? () =>
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
            : null
        }
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={onDelete}
        variantActions="largeGap"
      />

      {paymentMode === 'manual' && (
        <WhoPaidSection
          people={people}
          paidBy={paidBy}
          expanded={paidByTagsExpanded}
          onToggle={() => setPaidBySectionExpanded(!paidByTagsExpanded)}
          onPersonToggle={handlePaidByClick}
        />
      )}

      <SplitBetweenSection
        people={people}
        distributionType={distributionType}
        splitBetween={splitBetween}
        weights={weights}
        onToggle={handleSplitBetweenClick}
        onToggleDistribution={toggleDistribution}
        onAdjustWeight={adjustWeight}
      />

      <CardFooter>
        <QtyStepper
          qty={qty}
          canDecreaseQty={canDecreaseQty}
          pricePerUnit={pricePerUnit}
          formatAmount={formatAmount}
          adjustQuantity={adjustQuantity}
        />
        <CardTotalAmount amount={formatAmount(amount)} />
      </CardFooter>

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
    </Card>
  )
}

export default CostCard
