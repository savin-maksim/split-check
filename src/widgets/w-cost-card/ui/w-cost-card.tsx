import { memo } from 'react'
import { Copy, Pencil, Trash2 } from 'lucide-react'

import type { TItem, TPerson } from '@/entities/check'
import { EPaymentMode, getItemTotal } from '@/entities/check'

import { formatMoney } from '@/shared/lib'
import { IconButton, EIconButtonVariant, ItemCard, MarqueeTitle, QtyStepper } from '@/shared/ui'

import { WhoPaidSection } from './sections/who-paid-section'
import { SplitBetweenSection } from './sections/split-between-section'

import './w-cost-card.scss'

type TWCostCardProps = {
  item: TItem
  people: TPerson[]
  paymentMode: EPaymentMode
  paidByExpanded: boolean
  isWeighted: boolean
  onTogglePaidByExpanded: () => void
  onPersonPaidToggle: (person: TPerson) => void
  onSplitPersonToggle: (person: TPerson) => void
  onToggleDistribution: () => void
  onAdjustWeight: (personId: number, delta: number) => void
  onAdjustQty: (delta: number) => void
  onDuplicate?: () => void
  onEdit: () => void
  onDelete: () => void
}

const WCostCardComponent = ({
  item,
  people,
  paymentMode,
  paidByExpanded,
  isWeighted,
  onTogglePaidByExpanded,
  onPersonPaidToggle,
  onSplitPersonToggle,
  onToggleDistribution,
  onAdjustWeight,
  onAdjustQty,
  onDuplicate,
  onEdit,
  onDelete,
}: TWCostCardProps) => {
  const total = getItemTotal(item)
  const priceFormatted = formatMoney(item.price)

  return (
    <ItemCard>
      <div className="w-cost-card__header">
        <MarqueeTitle as="h3">{item.title}</MarqueeTitle>
        <div className="w-cost-card__actions w-cost-card__actions--large-gap">
          {onDuplicate && (
            <IconButton icon={<Copy />} onClick={onDuplicate} title="Дублировать" aria-label="Дублировать" />
          )}
          <IconButton icon={<Pencil />} onClick={onEdit} title="Редактировать" aria-label="Редактировать" />
          <IconButton
            icon={<Trash2 />}
            variant={EIconButtonVariant.Danger}
            onClick={onDelete}
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
          onToggle={onTogglePaidByExpanded}
          onPersonToggle={onPersonPaidToggle}
        />
      )}

      <SplitBetweenSection
        people={people}
        split={item.split}
        isWeighted={isWeighted}
        onTogglePerson={onSplitPersonToggle}
        onToggleDistribution={onToggleDistribution}
        onAdjustWeight={onAdjustWeight}
      />

      <div className="w-cost-card__footer">
        <div className="w-cost-card__footer-inner">
          <QtyStepper
            qty={item.qty}
            canDecreaseQty={item.qty > 1}
            priceFormatted={priceFormatted}
            onAdjust={onAdjustQty}
          />
          <h3 className="w-cost-card__total">{formatMoney(total)}</h3>
        </div>
      </div>
    </ItemCard>
  )
}

export const WCostCard = memo(WCostCardComponent)
