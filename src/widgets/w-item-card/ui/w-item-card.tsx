import { memo } from 'react'
import { Copy, Pencil, Trash2 } from 'lucide-react'

import type { TItem, TPerson } from '@entities/check'
import { EPaymentMode, getItemTotal, isSplitDistributionWeightedView } from '@entities/check'

import { formatMoney } from '@shared/lib'
import { AnimatedNumber, IconButton, EIconButtonVariant, ItemCard, CardHeader, QtyStepper } from '@shared/ui'

import { useItemCardHandlers } from '../lib/use-item-card-handlers'
import { WhoPaidSection } from './who-paid'
import { SplitBetweenSection } from './split-between'

import './w-item-card.scss'

type TWItemCardProps = {
  checkId: string
  item: TItem
  people: TPerson[]
  paymentMode: EPaymentMode
  onEdit: (item: TItem) => void
  onDelete: (item: TItem) => void
}

const WItemCardComponent = ({ checkId, item, people, paymentMode, onEdit, onDelete }: TWItemCardProps) => {
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
  } = useItemCardHandlers({ checkId, item, people, paymentMode, onEdit, onDelete })

  const total = getItemTotal(item)
  const priceFormatted = formatMoney(item.price)
  const paidByExpanded = item.paidBySectionExpanded ?? false
  const isWeighted = isSplitDistributionWeightedView(item)

  return (
    <ItemCard>
      <CardHeader
        title={item.title}
        actions={
          <>
            <IconButton icon={<Copy />} onClick={handleDuplicate} title="Дублировать" aria-label="Дублировать" />
            <IconButton icon={<Pencil />} onClick={handleEdit} title="Редактировать" aria-label="Редактировать" />
            <IconButton
              icon={<Trash2 />}
              variant={EIconButtonVariant.Danger}
              onClick={handleDelete}
              title="Удалить"
              aria-label="Удалить"
            />
          </>
        }
      />

      {paymentMode === EPaymentMode.Manual && (
        <WhoPaidSection
          people={people}
          paidById={item.paidBy}
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

      <div className="w-item-card__footer">
        <div className="w-item-card__footer-inner">
          <QtyStepper
            qty={item.qty}
            canDecreaseQty={item.qty > 1}
            priceFormatted={priceFormatted}
            onAdjust={handleAdjustQty}
            isPriceHidden={false}
          />
          <h3 className="w-item-card__total">
            <AnimatedNumber initialEnter={false} value={total} format={formatMoney} className={'h3'} />
          </h3>
        </div>
      </div>
    </ItemCard>
  )
}

export const WItemCard = memo(WItemCardComponent)
WItemCard.displayName = 'WItemCard'
