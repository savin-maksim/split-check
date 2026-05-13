import { memo, useCallback } from 'react'
import type { MouseEvent } from 'react'

import { Minus, Pencil, Plus } from 'lucide-react'

import { IconButton, EIconButtonVariant, AnimatedNumber } from '@shared/ui'
import { cn, formatItemTitle, formatMoneyRaw, createKeyboardActivationHandler, formatMoney } from '@shared/lib'

import type { TScannedItem } from '../../model'

import './receipt-preview-item.scss'

type TReceiptPreviewItemProps = {
  item: TScannedItem
  index: number
  qty: number
  isSelected: boolean
  onToggle: (index: number) => void
  onBumpQuantity: (index: number, delta: number) => void
  onEdit: (index: number) => void
}

const ReceiptPreviewItemComponent = ({
  item,
  index,
  qty,
  isSelected,
  onToggle,
  onBumpQuantity,
  onEdit,
}: TReceiptPreviewItemProps) => {
  const handleToggle = useCallback(() => onToggle(index), [index, onToggle])
  const handleEditClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onEdit(index)
    },
    [index, onEdit],
  )
  const handleDecrementClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onBumpQuantity(index, -1)
    },
    [index, onBumpQuantity],
  )
  const handleIncrementClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onBumpQuantity(index, 1)
    },
    [index, onBumpQuantity],
  )
  const handleKeyDown = createKeyboardActivationHandler(handleToggle)

  return (
    <div
      className={cn('receipt-preview-item', isSelected && 'receipt-preview-item--selected')}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="receipt-preview-item__title">
        <span className="receipt-preview-item__title-text">{formatItemTitle(item.title)}</span>
        <IconButton
          icon={<Pencil aria-hidden="true" size={'var(--button-icon-size)'} />}
          aria-label={`Редактировать позицию ${item.title}`}
          onClick={handleEditClick}
        />
      </div>
      <div className="receipt-preview-item__divider" aria-hidden="true" />
      <div className="receipt-preview-item__footer">
        <div className="receipt-preview-item__qty" aria-label={`Количество для ${item.title}`}>
          <IconButton
            variant={EIconButtonVariant.Qty}
            icon={<Minus aria-hidden="true" size={'var(--button-icon-size)'} />}
            aria-label={`Уменьшить количество для ${item.title}`}
            disabled={qty <= 1}
            onClick={handleDecrementClick}
          />
          <span className="receipt-preview-item__qty-value">{qty}</span>
          <IconButton
            variant={EIconButtonVariant.Qty}
            icon={<Plus aria-hidden="true" size={'var(--button-icon-size)'} />}
            aria-label={`Увеличить количество для ${item.title}`}
            onClick={handleIncrementClick}
          />
        </div>
        <span className="receipt-preview-item__unit">× {formatMoneyRaw(item.price)}</span>
        <AnimatedNumber value={item.price * qty * 100} format={formatMoney} className="h4" initialEnter={true} />
      </div>
    </div>
  )
}

const areReceiptPreviewItemPropsEqual = (prev: TReceiptPreviewItemProps, next: TReceiptPreviewItemProps) =>
  prev.item === next.item &&
  prev.index === next.index &&
  prev.qty === next.qty &&
  prev.isSelected === next.isSelected &&
  prev.onToggle === next.onToggle &&
  prev.onBumpQuantity === next.onBumpQuantity &&
  prev.onEdit === next.onEdit

export const ReceiptPreviewItem = memo(ReceiptPreviewItemComponent, areReceiptPreviewItemPropsEqual)
ReceiptPreviewItem.displayName = 'ReceiptPreviewItem'
