import { Modal, Button, EButtonVariant, AnimatedNumber } from '@/shared/ui'
import { formatMoneyRaw } from '@/shared/lib'

import type { TPreviewQuantities, TScannedItem } from '../../model'
import { ReceiptPreviewItem } from '../receipt-preview-item/receipt-preview-item'

import './receipt-preview-modal.scss'

type TReceiptPreviewModalProps = {
  isOpen: boolean
  items: TScannedItem[]
  quantities: TPreviewQuantities
  selectedIndexes: Set<number>
  totalAmount: number
  onClose: () => void
  onConfirm: () => void
  onToggleItem: (index: number) => void
  onBumpQuantity: (index: number, delta: number) => void
}

export const ReceiptPreviewModal = ({
  isOpen,
  items,
  quantities,
  selectedIndexes,
  totalAmount,
  onClose,
  onConfirm,
  onToggleItem,
  onBumpQuantity,
}: TReceiptPreviewModalProps) => {
  const selectedCount = selectedIndexes.size

  return (
    <Modal isOpen={isOpen} onClose={onClose} mode="top-0">
      <h3 className="modal__title">Распознанные позиции</h3>
      <div className="receipt-preview-modal__list">
        {items.map((item, index) => (
          <ReceiptPreviewItem
            key={`${item.title}-${index}`}
            item={item}
            index={index}
            qty={quantities[index] ?? item.qty}
            isSelected={selectedIndexes.has(index)}
            onToggle={onToggleItem}
            onBumpQuantity={onBumpQuantity}
          />
        ))}
      </div>
      <div className="receipt-preview-modal__summary">
        Итого к добавлению:
        <AnimatedNumber value={totalAmount} format={formatMoneyRaw} className="h4" initialEnter={true} />
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={onConfirm} disabled={selectedCount === 0}>
          Добавить ({selectedCount})
        </Button>
      </div>
    </Modal>
  )
}
