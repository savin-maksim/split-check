import React, { useState, useRef, useEffect } from 'react'
import ActionButton from '../Button/ActionButton'
import PersonButton from '../Button/PersonButton'
import './modal.scss'
import { toast } from 'react-hot-toast'
import Modal from './Modal'

function AddPositionModal({ isOpen, onClose, onSubmit, title, people, paymentMode = 'manual', singlePayer }) {
  const [purchase, setPurchase] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [paidBy, setPaidBy] = useState([])
  const [splitBetween, setSplitBetween] = useState([])
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const quantityInputRef = useRef(null)
  const priceInputRef = useRef(null)

  useEffect(() => {
    setPaidBy([])
    setSplitBetween([])
  }, [paymentMode])

  useEffect(() => {
    if (paymentMode === 'single' && singlePayer) {
      setPaidBy([singlePayer])
    }
  }, [paymentMode, singlePayer])

  const formatTitle = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const handlePaidByClick = (person) => {
    if (paymentMode === 'manual') {
      setPaidBy(prev => prev.some(p => p.id === person.id) ? [] : [person])
    }
  }

  const handleSplitBetweenClick = (person) => {
    setSplitBetween(prev => 
      prev.some(p => p.id === person.id)
        ? prev.filter(p => p.id !== person.id)
        : [...prev, person]
    )
  }

  const handleSubmit = () => {
    try {
      if (!purchase.trim()) {
        setError('Введите название покупки')
        return
      }

      const qtyValue = parseFloat(quantity)
      const priceValue = parseFloat(pricePerUnit)

      if (isNaN(qtyValue) || isNaN(priceValue) || qtyValue <= 0 || priceValue <= 0) {
        setError('Введите корректные значения')
        return
      }

      const id = Date.now()
      const formattedTitle = formatTitle(purchase.trim())
      const total = qtyValue * priceValue
      const formattedPrice = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(total)

      // Определяем плательщиков в зависимости от режима
      const currentPaidBy = paymentMode === 'single' ? (singlePayer ? [singlePayer] : []) : paidBy

      onSubmit({
        id,
        title: formattedTitle,
        amount: total,
        quantity: qtyValue,
        pricePerUnit: priceValue,
        paidBy: currentPaidBy,
        splitBetween: splitBetween
      })

      setPurchase('')
      setQuantity('1')
      setPricePerUnit('')
      setPaidBy([])
      setSplitBetween([])
      setError('')
      purchaseInputRef.current?.focus()
      
      toast.success(`Позиция "${formattedTitle}" - ${formattedPrice} добавлена`)
    } catch (err) {
      setError(err.message || 'Произошла ошибка')
    }
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      switch (inputType) {
        case 'purchase':
          quantityInputRef.current?.focus()
          break
        case 'quantity':
          priceInputRef.current?.focus()
          break
        case 'pricePerUnit':
          handleSubmit()
          break
      }
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">{title}</h2>
      {error && <p className="modal__error">{error}</p>}
      <form 
        className="modal__inputs" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          ref={purchaseInputRef}
          type="text"
          value={purchase}
          onChange={(e) => setPurchase(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'purchase')}
          placeholder="Название покупки"
          className="modal__input"
          autoFocus
        />
        <div className="modal__price-inputs">
          <input
            ref={quantityInputRef}
            type="text"
            inputMode="numeric"
            enterKeyHint="next"
            pattern="[0-9]*"
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
            ref={priceInputRef}
            type="text"
            inputMode="numeric"
            enterKeyHint="done"
            pattern="[0-9]*"
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
            className="modal__input"
          />
        </div>

        {paymentMode === 'manual' && (
          <div className="modal__section">
            <p className="modal__label">Кто платил? (можно выбрать позже)</p>
            <div className="modal__tags">
              {people?.map((person) => (
                <PersonButton
                  key={person.id}
                  className={`modal__tag ${paidBy.some(p => p.id === person.id) ? 'button__person--active' : ''}`}
                  onClick={() => handlePaidByClick(person)}
                >
                  {person.name}
                </PersonButton>
              ))}
            </div>
          </div>
        )}

        <div className="modal__section">
          <p className="modal__label">На кого разделить? (можно выбрать позже)</p>
          <div className="modal__tags">
            {people?.map((person) => (
              <PersonButton
                key={person.id}
                className={`modal__tag ${splitBetween.some(p => p.id === person.id) ? 'button__person--active' : ''}`}
                onClick={() => handleSplitBetweenClick(person)}
              >
                {person.name}
              </PersonButton>
            ))}
          </div>
        </div>

        <button type="submit" style={{ display: 'none' }} />
      </form>
      <div className="modal__buttons">
        <ActionButton onClick={handleSubmit}>
          Добавить
        </ActionButton>
        <ActionButton onClick={onClose}>
          Отмена
        </ActionButton>
      </div>
    </Modal>
  )
}

export default AddPositionModal 