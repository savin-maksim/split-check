import React from 'react'
import { create, all } from 'mathjs'
import ActionButton from '../Button/ActionButton'
import './modal.scss'
import { toast } from 'react-hot-toast'

function AddPositionModal({ isOpen, onClose, onSubmit, title }) {
  const [purchase, setPurchase] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [error, setError] = React.useState('')
  const purchaseInputRef = React.useRef(null)
  const priceInputRef = React.useRef(null)
  const math = create(all)

  const validateAndCalculatePrice = (value) => {
    try {
      const result = math.evaluate(value)
      return result
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
      title: formatTitle(purchase.trim()), 
      amount: calculatedPrice
    })

    toast.success(`Расход "${formatTitle(purchase.trim())}" - ${formattedPrice} добавлен`)

    setPurchase('')
    setPrice('')
    setError('')
    purchaseInputRef.current?.focus()
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (inputType === 'purchase') {
        // Если Enter нажат в поле purchase - переходим к полю price
        priceInputRef.current?.focus()
      } else if (inputType === 'price') {
        // Если Enter нажат в поле price - подтверждаем создание
        handleSubmit()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal__content">
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
                .replace(/,/g, '.') // заменяем все запятые на точки
                .replace(/\.+/g, '.') // заменяем множественные точки на одну точку
              setPrice(value)
              setError('')
            }}
            onKeyDown={(e) => handleKeyDown(e, 'price')}
            placeholder="Введите сумму (можно использовать математические выражения)"
            className="modal__input"
          />
        </div>
        <div className="modal__buttons">
          <ActionButton onClick={handleSubmit}>
            Добавить
          </ActionButton>
          <ActionButton onClick={onClose}>
            Отмена
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

export default AddPositionModal 