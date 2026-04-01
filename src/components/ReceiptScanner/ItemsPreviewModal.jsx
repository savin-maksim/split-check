import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import IconButton from '../Button/IconButton'
import './scanner.scss'

function formatMoney(value) {
  return `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`
}

function ItemsPreviewModal({ isOpen, onClose, items, onConfirm }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [quantities, setQuantities] = useState([])

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(items.map((_, index) => index))
      setQuantities(items.map((item) => item.quantity))
    }
  }, [isOpen, items])

  const toggleItem = (index) => {
    setSelectedItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const bumpQuantity = (index, delta) => (e) => {
    e.stopPropagation()
    setQuantities((prev) =>
      items.map((item, i) => {
        if (i !== index) return prev[i] ?? item.quantity
        const current = prev[i] ?? item.quantity
        return Math.max(1, current + delta)
      }),
    )
  }

  const handleConfirm = () => {
    const itemsToAdd = selectedItems.map((index) => ({
      ...items[index],
      quantity: quantities[index] ?? items[index].quantity,
    }))
    onConfirm(itemsToAdd)
  }

  if (!isOpen) return null

  const totalAmount = items.reduce((sum, item, index) => {
    if (!selectedItems.includes(index)) return sum
    const q = quantities[index] ?? item.quantity
    return sum + item.pricePerUnit * q
  }, 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">Распознанные товары</h2>

      <div className="scanner__preview-list">
        {items.map((item, index) => {
          const qty = quantities[index] ?? item.quantity
          const lineTotal = qty * item.pricePerUnit
          const isSelected = selectedItems.includes(index)

          return (
            <div
              key={index}
              className={`scanner__item scanner__item--card ${isSelected ? 'scanner__item--selected' : ''}`}
              onClick={() => toggleItem(index)}
            >
              <span className="scanner__item-title">{item.title}</span>
              <div className="scanner__item-divider" aria-hidden />
              <div className="scanner__item-footer">
                <div className="scanner__item-qty">
                  <IconButton
                    className="icon-button--qty"
                    icon={<Minus size={16} strokeWidth={2.5} />}
                    aria-label="Уменьшить количество"
                    disabled={qty <= 1}
                    onClick={bumpQuantity(index, -1)}
                  />
                  <span className="scanner__item-qty-value">{qty}</span>
                  <IconButton
                    className="icon-button--qty"
                    icon={<Plus size={16} strokeWidth={2.5} />}
                    aria-label="Увеличить количество"
                    onClick={bumpQuantity(index, 1)}
                  />
                </div>
                <span className="scanner__item-unit">× {formatMoney(item.pricePerUnit)}</span>
                <span className="scanner__item-total scanner__item-total--line">{formatMoney(lineTotal)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="scanner__summary">
        Итого к добавлению: <strong className="scanner__summary--total">{formatMoney(totalAmount)}</strong>
      </div>

      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button className="button--active" onClick={handleConfirm} disabled={selectedItems.length === 0}>
          Добавить ({selectedItems.length})
        </Button>
      </div>
    </Modal>
  )
}

export default ItemsPreviewModal
