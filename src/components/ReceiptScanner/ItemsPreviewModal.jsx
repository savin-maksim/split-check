import React, { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import ActionButton from '../Button/ActionButton'
import './scanner.scss'

function ItemsPreviewModal({ isOpen, onClose, items, onConfirm }) {
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    if (isOpen) {
      // By default select all items
      setSelectedItems(items.map((_, index) => index))
    }
  }, [isOpen, items])

  const toggleItem = (index) => {
    setSelectedItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleConfirm = () => {
    const itemsToAdd = items.filter((_, index) => selectedItems.includes(index))
    onConfirm(itemsToAdd)
  }

  if (!isOpen) return null

  const totalAmount = items
    .filter((_, index) => selectedItems.includes(index))
    .reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">Распознанные товары</h2>

      <div className="scanner__preview-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`scanner__item ${selectedItems.includes(index) ? 'scanner__item--selected' : ''}`}
            onClick={() => toggleItem(index)}
          >
            <div className="scanner__item-checkbox">
              <input type="checkbox" checked={selectedItems.includes(index)} readOnly />
            </div>
            <div className="scanner__item-details">
              <span className="scanner__item-title">{item.title}</span>
              <span className="scanner__item-meta">
                {item.quantity} x {item.pricePerUnit} ₽
              </span>
            </div>
            <div className="scanner__item-total">{(item.quantity * item.pricePerUnit).toFixed(2)} ₽</div>
          </div>
        ))}
      </div>

      <div className="scanner__summary">
        Итого к добавлению: <strong className="scanner__item-total">{totalAmount.toFixed(2)} ₽</strong>
      </div>

      <div className="modal__buttons">
        <ActionButton onClick={handleConfirm} disabled={selectedItems.length === 0}>
          Добавить ({selectedItems.length})
        </ActionButton>
        <ActionButton onClick={onClose}>Отмена</ActionButton>
      </div>
    </Modal>
  )
}

export default ItemsPreviewModal
