import React, { useState, useRef } from 'react'
import Button from '../Button/Button'
import InputField from '../Input/InputField'
import Modal from './Modal'
import { toast } from 'react-hot-toast'
import formatters from '@/utils/formatters'

function EditPositionModal({ isOpen, onClose, onSubmit, title, initialData }) {
  const [purchase, setPurchase] = useState(initialData?.title || '')
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '1')
  const [pricePerUnit, setPricePerUnit] = useState(initialData?.pricePerUnit?.toString() || '')
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const quantityInputRef = useRef(null)
  const priceInputRef = useRef(null)

  React.useEffect(() => {
    if (isOpen && initialData) {
      setPurchase(initialData.title)
      setQuantity(initialData.quantity?.toString() || '1')
      setPricePerUnit(initialData.pricePerUnit?.toString() || '')
    }
  }, [isOpen, initialData])

  const formatTitle = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const handleSubmit = () => {
    if (!purchase.trim()) {
      setError('Введите название покупки')
      return
    }

    const priceNormalized = formatters.normalizeDecimalInput(pricePerUnit)
    if (priceNormalized !== String(pricePerUnit ?? '')) {
      setPricePerUnit(priceNormalized)
    }

    const qtyValue = parseFloat(quantity)
    const priceValue = parseFloat(priceNormalized)

    if (isNaN(qtyValue) || isNaN(priceValue) || qtyValue <= 0 || priceValue <= 0) {
      setError('Введите корректные значения')
      return
    }

    const total = qtyValue * priceValue
    const formattedPrice = formatters.formatAmount(total)

    onSubmit({
      ...initialData,
      title: formatTitle(purchase.trim()),
      amount: total,
      quantity: qtyValue,
      pricePerUnit: priceValue,
    })

    toast.success(`Расход "${formatTitle(purchase.trim())}" - ${formattedPrice} обновлен`)
    onClose()
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputType === 'purchase') {
        quantityInputRef.current?.focus()
      } else if (inputType === 'quantity') {
        priceInputRef.current?.focus()
      } else if (inputType === 'pricePerUnit') {
        handleSubmit()
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">{title}</h2>
      {error && <p className="modal__error">{error}</p>}
      <div className="modal__inputs">
        <InputField
          ref={purchaseInputRef}
          type="text"
          value={purchase}
          onChange={(e) => setPurchase(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'purchase')}
          label="Введите название покупки"
          autoFocus
        />

        <div className="modal__price-inputs">
          <InputField
            ref={quantityInputRef}
            type="text"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, '.').replace(/\.+/g, '.')
              setQuantity(value)
              setError('')
            }}
            onKeyDown={(e) => handleKeyDown(e, 'quantity')}
            label="Количество"
          />
          <InputField
            ref={priceInputRef}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            pattern="[0-9.,]*"
            autoComplete="off"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'pricePerUnit')}
            label="Цена за единицу"
          />
        </div>
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="active" onClick={handleSubmit}>
          Сохранить
        </Button>
      </div>
    </Modal>
  )
}

export default EditPositionModal
