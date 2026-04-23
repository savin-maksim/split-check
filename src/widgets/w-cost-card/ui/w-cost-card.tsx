import { memo, useCallback } from 'react'
import { Copy, Pencil, Trash2 } from 'lucide-react'

import type { TItem, TPerson } from '@/entities/check'
import {
  EPaymentMode,
  getItemTotal,
  isSplitDistributionWeightedView,
  useCheckStore,
} from '@/entities/check'

import { formatMoney } from '@/shared/lib'
import { IconButton, EIconButtonVariant, ItemCard, MarqueeTitle, QtyStepper } from '@/shared/ui'

import { WhoPaidSection } from './sections/who-paid-section'
import { SplitBetweenSection } from './sections/split-between-section'

import './w-cost-card.scss'

type TWCostCardProps = {
  checkId: string
  item: TItem
  people: TPerson[]
  paymentMode: EPaymentMode
  onEdit: (item: TItem) => void
  onDelete: (item: TItem) => void
}

const WCostCardComponent = ({
  checkId,
  item,
  people,
  paymentMode,
  onEdit,
  onDelete,
}: TWCostCardProps) => {
  const updateItem = useCheckStore((s) => s.updateItem)
  const duplicateItem = useCheckStore((s) => s.duplicateItem)

  const total = getItemTotal(item)
  const priceFormatted = formatMoney(item.price)
  const paidByExpanded = item.paidBySectionExpanded ?? false
  const isWeighted = isSplitDistributionWeightedView(item)

  const handleTogglePaidByExpanded = useCallback(() => {
    if (paymentMode === EPaymentMode.Single) return
    updateItem(checkId, item.id, {
      paidBySectionExpanded: !paidByExpanded,
    })
  }, [checkId, item.id, paidByExpanded, paymentMode, updateItem])

  const handlePersonPaidToggle = useCallback(
    (person: TPerson) => {
      if (paymentMode === EPaymentMode.Single) return
      updateItem(checkId, item.id, { paidBy: [person.id], paidBySectionExpanded: false })
    },
    [checkId, item.id, paymentMode, updateItem],
  )

  const handleSplitPersonToggle = useCallback(
    (person: TPerson) => {
      const current = item.split[person.id] ?? 0
      updateItem(checkId, item.id, {
        split: { ...item.split, [person.id]: current > 0 ? 0 : 1 },
      })
    },
    [checkId, item.id, item.split, updateItem],
  )

  const handleToggleDistribution = useCallback(() => {
    if (isSplitDistributionWeightedView(item)) {
      const newSplit: Record<number, number> = {}
      for (const p of people) {
        newSplit[p.id] = (item.split[p.id] ?? 0) > 0 ? 1 : 0
      }
      updateItem(checkId, item.id, {
        split: newSplit,
        splitDistributionWeighted: false,
      })
    } else {
      updateItem(checkId, item.id, { splitDistributionWeighted: true })
    }
  }, [checkId, item.id, item, people, updateItem])

  const handleAdjustWeight = useCallback(
    (personId: number, delta: number) => {
      const current = item.split[personId] ?? 0
      updateItem(checkId, item.id, {
        split: { ...item.split, [personId]: Math.max(0, current + delta) },
      })
    },
    [checkId, item.id, item.split, updateItem],
  )

  const handleAdjustQty = useCallback(
    (delta: number) => {
      const newQty = Math.max(1, item.qty + delta)
      updateItem(checkId, item.id, { qty: newQty })
    },
    [checkId, item.id, item.qty, updateItem],
  )

  const handleDuplicate = useCallback(() => {
    duplicateItem(checkId, item.id)
  }, [checkId, item.id, duplicateItem])

  const handleEdit = useCallback(() => onEdit(item), [onEdit, item])

  const handleDelete = useCallback(() => onDelete(item), [onDelete, item])

  return (
    <ItemCard>
      <div className="w-cost-card__header">
        <MarqueeTitle as="h3">{item.title}</MarqueeTitle>
        <div className="w-cost-card__actions w-cost-card__actions--large-gap">
          <IconButton
            icon={<Copy />}
            onClick={handleDuplicate}
            title="Дублировать"
            aria-label="Дублировать"
          />
          <IconButton icon={<Pencil />} onClick={handleEdit} title="Редактировать" aria-label="Редактировать" />
          <IconButton
            icon={<Trash2 />}
            variant={EIconButtonVariant.Danger}
            onClick={handleDelete}
            title="Удалить"
            aria-label="Удалить"
          />
        </div>
      </div>

      {paymentMode === EPaymentMode.Manual && (
        <WhoPaidSection
          people={people}
          paidByIds={item.paidBy}
          expanded={paidByExpanded}
          onToggle={handleTogglePaidByExpanded}
          onPersonToggle={handlePersonPaidToggle}
        />
      )}

      <SplitBetweenSection
        people={people}
        split={item.split}
        isWeighted={isWeighted}
        onTogglePerson={handleSplitPersonToggle}
        onToggleDistribution={handleToggleDistribution}
        onAdjustWeight={handleAdjustWeight}
      />

      <div className="w-cost-card__footer">
        <div className="w-cost-card__footer-inner">
          <QtyStepper
            qty={item.qty}
            canDecreaseQty={item.qty > 1}
            priceFormatted={priceFormatted}
            onAdjust={handleAdjustQty}
          />
          <h3 className="w-cost-card__total">{formatMoney(total)}</h3>
        </div>
      </div>
    </ItemCard>
  )
}

export const WCostCard = memo(WCostCardComponent)
WCostCard.displayName = 'WCostCard'
