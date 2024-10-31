import React, { useState, useRef } from 'react'
import { create, all } from 'mathjs'
import ActionButton from '../Button/ActionButton'
import Modal from './Modal'
import { toast } from 'react-hot-toast'

function EditPositionModal({ isOpen, onClose, onSubmit, title, initialData }) {
  const [purchase, setPurchase] = useState(initialData?.title || '')
  const [price, setPrice] = useState(initialData?.amount?.toString() || '')
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const priceInputRef = useRef(null)
  const math = create(all)

  React.useEffect(() => {
    if (isOpen && initialData) {
      setPurchase(initialData.title)
      setPrice(initialData.amount.toString())
    }
  }, [isOpen, initialData])

  const validateAndCalculatePrice = (value) => {
    try {
      const result = math.evaluate(value)
      return result
    } catch {
      return null
    }
  }

  const handleSubmit = () => {
    if (!purchase.trim()) {
      setError('Введите название покупки')
      return
    }

    const calculatedPrice = validateAndCalculatePrice(price)
    if (calculatedPrice === null || calculatedPrice <= 0) {
      setError('Введите корректную сумму')
      return
    }

    const formattedPrice = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(calculatedPrice)

    onSubmit({ 
      ...initialData,
      title: purchase.trim(), 
      amount: calculatedPrice
    })

    toast.success(`Расход "${purchase.trim()}" - ${formattedPrice} обновлен`)
    onClose()
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputType === 'purchase') {
        priceInputRef.current?.focus()
      } else if (inputType === 'price') {
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
        <input
          ref={priceInputRef}
          type="text"
          inputMode="text"
          value={price}
          onChange={(e) => {
            const value = e.target.value
              .replace(/,/g, '.')
              .replace(/\.+/g, '.')
            setPrice(value)
            setError('')
          }}
          onKeyDown={(e) => handleKeyDown(e, 'price')}
          placeholder="Введите сумму"
          className="modal__input"
        />
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