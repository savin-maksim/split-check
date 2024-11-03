import React, { useState, useRef } from 'react'
import { create, all } from 'mathjs'
import ActionButton from '../Button/ActionButton'
import { Link } from 'lucide-react'
import './modal.scss'
import { toast } from 'react-hot-toast'
import IconButton from '../Button/IconButton'

function AddPositionModal({ isOpen, onClose, onSubmit, title }) {
  const [purchase, setPurchase] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const priceInputRef = useRef(null)
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
    try {
      if (!purchase.trim()) {
        setError('Введите название покупки')
        return
      }

      const calculatedPrice = validateAndCalculatePrice(price)
      if (calculatedPrice === null || calculatedPrice <= 0) {
        setError('Введите корректную сумму')
        return
      }

      // Создаем уникальный ID для расхода
      const id = Date.now()

      onSubmit({
        id,
        title: formatTitle(purchase.trim()),
        amount: calculatedPrice,
        paidBy: [], // Добавляем пустой массив paidBy
        splitBetween: [] // Добавляем пустой массив splitBetween
      })

      onClose()
      setPurchase('')
      setPrice('')
      setError('')
    } catch (error) {
      console.error('Submit error:', error)
      setError('Произошла ошибка при добавлении')
    }
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

  const handleImportFromURL = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const url = new URL(clipboardText)
      const params = new URLSearchParams(url.search)
      const costsParam = params.get('c')

      if (!costsParam) {
        toast.error('В ссылке нет данных о расходах')
        return
      }

      // Декодируем данные из base64
      const decodedString = atob(costsParam)
      const decodedData = decodeURIComponent(decodedString)
      const costs = JSON.parse(decodedData)


      // Импортируем каждый расход напрямую через onSubmit
      for (const cost of costs) {
        const newCost = {
          title: cost[1],
          amount: String(cost[2])
        }

        // Напрямую вызываем onSubmit для каждого расхода
        onSubmit(newCost)

        // Небольшая задержка между добавлениями
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      toast.success(`Импортировано ${costs.length} расходов`)
      onClose()
    } catch (error) {
      console.error('Ошибка импорта:', error)
      toast.error('Ошибка при импорте данных')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal__content">
        <h2>{title}</h2>
        {error && <p className="modal__error">{error}</p>}
        <div className="modal__inputs">
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
            placeholder="Сумма (вычисления доступны)"
            className="modal__input"
          />
        </div>
        <div className="modal__buttons">
          <IconButton
            onClick={handleImportFromURL}
            icon={<Link size={20} />}
          >
          </IconButton>
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