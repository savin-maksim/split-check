import React, { useState, useRef } from 'react'
import { create, all } from 'mathjs'
import ActionButton from '../Button/ActionButton'
import Modal from './Modal'
import { toast } from 'react-hot-toast'

function EditPositionModal({ isOpen, onClose, onSubmit, title, initialData }) {
  const [purchase, setPurchase] = useState(initialData?.title || '')
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '1')
  const [pricePerUnit, setPricePerUnit] = useState(initialData?.pricePerUnit?.toString() || '')
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const math = create(all)

  React.useEffect(() => {
    if (isOpen && initialData) {
      setPurchase(initialData.title)
      setQuantity(initialData.quantity?.toString() || '1')
      setPricePerUnit(initialData.pricePerUnit?.toString() || '')
    }
  }, [isOpen, initialData])

  const validateAndCalculatePrice = (qty, price) => {
    try {
      const qtyValue = math.evaluate(qty)
      const priceValue = math.evaluate(price)
      if (qtyValue > 0 && priceValue > 0) {
        return {
          quantity: qtyValue,
          pricePerUnit: priceValue,
          total: qtyValue * priceValue
        }
      }
      return null
    } catch {
      return null
    }
  }

  const formatTitle = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const handleSubmit = () => {
    if (!purchase.trim()) {
      setError('Введите название покупки')
      return
    }

    const calculation = validateAndCalculatePrice(quantity, pricePerUnit)
    if (!calculation) {
      setError('Введите корректные значения')
      return
    }

    const formattedPrice = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(calculation.total)

    onSubmit({ 
      ...initialData,
      title: formatTitle(purchase.trim()), 
      amount: calculation.total,
      quantity: calculation.quantity,
      pricePerUnit: calculation.pricePerUnit
    })

    toast.success(`Расход "${formatTitle(purchase.trim())}" - ${formattedPrice} обновлен`)
    onClose()
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputType === 'purchase') {
        document.querySelector('input[placeholder="Количество"]')?.focus()
      } else if (inputType === 'quantity') {
        document.querySelector('input[placeholder="Цена за единицу"]')?.focus()
      } else if (inputType === 'pricePerUnit') {
        handleSubmit()
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className=''>{title}</h2>
      {error && <p className="modal__error">{error}</p>}
      <div className="modal__inputs">
        <input
          ref={purchaseInputRef}
          type="text"
          value={purchase}
          onChange={(e) => setPurchase(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'purchase')}
          placeholder="Введите название покупки"
          className="modal__input"
          autoFocus
        />
        <div className="modal__price-inputs">
          <input
            type="text"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value
                .replace(/,/g, '.')
                .replace(/\.+/g, '.')
              setQuantity(value)
              setError('')
            }}
            onKeyDown={(e) => handleKeyDown(e, 'quantity')}
            placeholder="Количество"
            className="modal__input modal__input--half"
          />
          <input
            type="text"
            value={pricePerUnit}
            onChange={(e) => {
              const value = e.target.value
                .replace(/,/g, '.')
                .replace(/\.+/g, '.')
              setPricePerUnit(value)
              setError('')
            }}
            onKeyDown={(e) => handleKeyDown(e, 'pricePerUnit')}
            placeholder="Цена за единицу"
            className="modal__input modal__input--half"
          />
        </div>
      </div>
      <div className="modal__buttons">
        <ActionButton onClick={handleSubmit}>
          Сохранить
        </ActionButton>
        <ActionButton onClick={onClose}>
          Отмена
        </ActionButton>
      </div>
    </Modal>
  )
}

export default EditPositionModal