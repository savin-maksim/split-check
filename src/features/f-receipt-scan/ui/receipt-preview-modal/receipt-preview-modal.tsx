import { memo, useCallback, useMemo, useState } from 'react'

import { EPaymentMode, type TItem } from '@entities/check'
import { ManageItemForm } from '@features/f-manage-item'
import { formatMoneyRaw } from '@shared/lib'
import { Modal, Button, EButtonVariant, AnimatedNumber } from '@shared/ui'

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
  onUpdateItem: (index: number, item: TScannedItem) => void
}

const ReceiptPreviewModalComponent = ({
  isOpen,
  items,
  quantities,
  selectedIndexes,
  totalAmount,
  onClose,
  onConfirm,
  onToggleItem,
  onBumpQuantity,
  onUpdateItem,
}: TReceiptPreviewModalProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const selectedCount = selectedIndexes.size
  const editingItem = editingIndex != null ? items[editingIndex] : null

  const handleCloseEdit = useCallback(() => setEditingIndex(null), [])

  const handleSubmitEdit = useCallback(
    (item: Omit<TItem, 'id'>) => {
      if (editingIndex == null) return

      onUpdateItem(editingIndex, {
        title: item.title,
        price: item.price / 100,
        qty: item.qty,
        totalPrice: (item.price / 100) * item.qty,
      })
    },
    [editingIndex, onUpdateItem],
  )

  const editingInitialData = useMemo(
    () =>
      editingItem
        ? {
            title: editingItem.title,
            price: Math.round(editingItem.price * 100),
            qty: quantities[editingIndex ?? -1] ?? editingItem.qty,
          }
        : undefined,
    [editingIndex, editingItem, quantities],
  )

  return (
    <Modal isOpen={isOpen} onClose={editingItem ? handleCloseEdit : onClose} mode="top-0">
      {editingItem ? (
        <ManageItemForm
          isOpen={editingItem != null}
          onClose={handleCloseEdit}
          mode="edit"
          initialData={editingInitialData}
          initialFocus="price"
          paymentMode={EPaymentMode.Manual}
          onSubmit={handleSubmitEdit}
        />
      ) : (
        <>
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
                onEdit={setEditingIndex}
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
        </>
      )}
    </Modal>
  )
}

export const ReceiptPreviewModal = memo(ReceiptPreviewModalComponent)
