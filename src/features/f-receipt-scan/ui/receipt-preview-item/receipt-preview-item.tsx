import { memo, useCallback } from 'react'
import type { MouseEvent } from 'react'

import { Minus, Plus } from 'lucide-react'

import { IconButton, EIconButtonVariant, AnimatedNumber } from '@/shared/ui'
import { cn, formatItemTitle, formatMoneyRaw, createKeyboardActivationHandler, formatMoney } from '@/shared/lib'

import type { TScannedItem } from '../../model'

import './receipt-preview-item.scss'

type TReceiptPreviewItemProps = {
  item: TScannedItem
  index: number
  qty: number
  isSelected: boolean
  onToggle: (index: number) => void
  onBumpQuantity: (index: number, delta: number) => void
}

const ReceiptPreviewItemComponent = ({
  item,
  index,
  qty,
  isSelected,
  onToggle,
  onBumpQuantity,
}: TReceiptPreviewItemProps) => {
  const handleKeyDown = useCallback(
    createKeyboardActivationHandler(() => onToggle(index)),
    [onToggle, index],
  )

  return (
    <div
      className={cn('receipt-preview-item', isSelected && 'receipt-preview-item--selected')}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onToggle(index)}
      onKeyDown={handleKeyDown}
    >
      <span className="receipt-preview-item__title">{formatItemTitle(item.title)}</span>
      <div className="receipt-preview-item__divider" aria-hidden="true" />
      <div className="receipt-preview-item__footer">
        <div className="receipt-preview-item__qty" aria-label={`Количество для ${item.title}`}>
          <IconButton
            variant={EIconButtonVariant.Qty}
            icon={<Minus size={16} strokeWidth={2.5} aria-hidden="true" />}
            aria-label={`Уменьшить количество для ${item.title}`}
            disabled={qty <= 1}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onBumpQuantity(index, -1)
            }}
          />
          <span className="receipt-preview-item__qty-value">{qty}</span>
          <IconButton
            variant={EIconButtonVariant.Qty}
            icon={<Plus size={16} strokeWidth={2.5} aria-hidden="true" />}
            aria-label={`Увеличить количество для ${item.title}`}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onBumpQuantity(index, 1)
            }}
          />
        </div>
        <span className="receipt-preview-item__unit">× {formatMoneyRaw(item.price)}</span>
        <AnimatedNumber
          value={item.price * qty * 100}
          format={formatMoney}
          className="h4"
          animateEntrance={true}
          duration={0.7}
        />
      </div>
    </div>
  )
}

export const ReceiptPreviewItem = memo(ReceiptPreviewItemComponent)
ReceiptPreviewItem.displayName = 'ReceiptPreviewItem'
