import { memo } from 'react'
import { Copy, Pencil, Trash2 } from 'lucide-react'

import type { TItem, TPerson } from '@/entities/check'
import { EPaymentMode, getItemTotal, isSplitDistributionWeightedView } from '@/entities/check'

import { formatMoney } from '@/shared/lib'
import { IconButton, EIconButtonVariant, ItemCard, MarqueeTitle, QtyStepper } from '@/shared/ui'

import { useCostCardHandlers } from '../lib/use-cost-card-handlers'
import { WhoPaidSection } from './who-paid'
import { SplitBetweenSection } from './split-between'

import './w-cost-card.scss'

type TWCostCardProps = {
  checkId: string
  item: TItem
  people: TPerson[]
  paymentMode: EPaymentMode
  onEdit: (item: TItem) => void
  onDelete: (item: TItem) => void
}

const WCostCardComponent = ({ checkId, item, people, paymentMode, onEdit, onDelete }: TWCostCardProps) => {
  const {
    handleTogglePaidByExpanded,
    handlePersonPaidToggle,
    handleSplitPersonToggle,
    handleToggleDistribution,
    handleSelectAllSplit,
    handleAdjustWeight,
    handleAdjustQty,
    handleDuplicate,
    handleEdit,
    handleDelete,
  } = useCostCardHandlers({ checkId, item, people, paymentMode, onEdit, onDelete })

  const total = getItemTotal(item)
  const priceFormatted = formatMoney(item.price)
  const paidByExpanded = item.paidBySectionExpanded ?? false
  const isWeighted = isSplitDistributionWeightedView(item)

  return (
    <ItemCard>
      <div className="w-cost-card__header">
        <MarqueeTitle as="h3">{item.title}</MarqueeTitle>
        <div className="w-cost-card__actions w-cost-card__actions--large-gap">
          <IconButton icon={<Copy />} onClick={handleDuplicate} title="Дублировать" aria-label="Дублировать" />
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
        onSelectAll={handleSelectAllSplit}
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
