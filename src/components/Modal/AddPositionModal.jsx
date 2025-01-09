import React, { useState, useRef } from 'react'
import { create, all } from 'mathjs'
import ActionButton from '../Button/ActionButton'
import { Link } from 'lucide-react'
import './modal.scss'
import { toast } from 'react-hot-toast'
import IconButton from '../Button/IconButton'
import ImportModal from './ImportModal'
import Modal from './Modal'

function AddPositionModal({ isOpen, onClose, onSubmit, title }) {
  const [purchase, setPurchase] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const math = create(all)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(true)

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
    try {
      if (!purchase.trim()) {
        setError('Введите название покупки')
        return
      }

      const calculation = validateAndCalculatePrice(quantity, pricePerUnit)
      if (!calculation) {
        setError('Введите корректные значеия')
        return
      }

      const id = Date.now()
      const formattedTitle = formatTitle(purchase.trim())
      const formattedPrice = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(calculation.total)

      onSubmit({
        id,
        title: formattedTitle,
        amount: calculation.total,
        quantity: calculation.quantity,
        pricePerUnit: calculation.pricePerUnit,
        paidBy: [],
        splitBetween: []
      })

      setPurchase('')
      setQuantity('1')
      setPricePerUnit('')
      setError('')
      purchaseInputRef.current?.focus()
      
      toast.success(`Позиция "${formattedTitle}" - ${formattedPrice} добавлена`)
    } catch (error) {
      console.error('Submit error:', error)
      setError('Произошла ошибка при добавлении')
    }
  }

  const handleKeyDown = (e, inputType) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      switch (inputType) {
        case 'purchase':
          document.querySelector('input[placeholder="Количество"]')?.focus()
          break
        case 'quantity':
          document.querySelector('input[placeholder="Цена за единицу"]')?.focus()
          break
        case 'pricePerUnit':
          handleSubmit()
          break
      }
    }
  }

  const handleImportFromURL = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const url = new URL(clipboardText)
      const params = new URLSearchParams(url.search)
      const costsParam = params.get('c')

      if (!costsParam) {
        throw new Error('В ссылке нет данных о расходах')
      }

      // Декодируем данные из base64
      const decodedString = atob(costsParam)
      const decodedData = decodeURIComponent(decodedString)
      const costs = JSON.parse(decodedData)

      // Импортируем каждый расход напрямую через onSubmit
      for (const cost of costs) {
        const newCost = {
          title: cost[1],
          amount: String(cost[2]),
          quantity: cost[3] || 1,
          pricePerUnit: cost[4] || cost[2],
          paidBy: [],
          splitBetween: []
        }

        onSubmit(newCost)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } catch (error) {
      throw error // Пробрасываем ошибку выше для обработки в ImportModal
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
        <button type="submit" style={{ display: 'none' }} />
      </form>
      <div className="modal__buttons">
        {/* <IconButton
          onClick={() => setIsImportModalOpen(true)}
          icon={<Link size={20} />}
        /> */}
        <ActionButton onClick={handleSubmit}>
          Добавить
        </ActionButton>
        <ActionButton onClick={onClose}>
          Отмена
        </ActionButton>
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportFromURL={handleImportFromURL}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}

export default AddPositionModal 