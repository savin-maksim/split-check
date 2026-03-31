import { useState, useRef, useEffect } from 'react'
import { Minus, Plus, ChartPie } from 'lucide-react'
import Button from '../Button/Button'
import PersonButton from '../Button/PersonButton'
import './modal.scss'
import { toast } from 'react-hot-toast'
import Modal from './Modal'
import IconButton from '../Button/IconButton'
import { buildWeightsFromSplit, splitBetweenFromWeights } from '../../utils/costDistribution'

function AddPositionModal({ isOpen, onClose, onSubmit, title, people, paymentMode = 'manual' }) {
  const [purchase, setPurchase] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [paidBy, setPaidBy] = useState([])
  const [splitBetween, setSplitBetween] = useState([])
  const [distributionType, setDistributionType] = useState('equal')
  const [weights, setWeights] = useState({})
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const quantityInputRef = useRef(null)
  const priceInputRef = useRef(null)

  useEffect(() => {
    setPaidBy([])
    setSplitBetween([])
    setDistributionType('equal')
    setWeights({})
  }, [paymentMode])

  useEffect(() => {
    if (isOpen) {
      setPaidBy([])
      setSplitBetween([])
      setDistributionType('equal')
      setWeights({})
    }
  }, [isOpen])

  const formatTitle = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const handlePaidByClick = (person) => {
    if (paymentMode === 'manual') {
      setPaidBy((prev) => (prev.some((p) => p.id === person.id) ? [] : [person]))
    }
  }

  const handleSplitBetweenClick = (person) => {
    if (distributionType === 'weighted') return
    setSplitBetween((prev) =>
      prev.some((p) => p.id === person.id) ? prev.filter((p) => p.id !== person.id) : [...prev, person],
    )
  }

  const toggleDistribution = () => {
    if (distributionType === 'weighted') {
      setSplitBetween(splitBetweenFromWeights(weights, people || []))
      setWeights({})
      setDistributionType('equal')
    } else {
      setWeights(buildWeightsFromSplit(splitBetween, people || []))
      setDistributionType('weighted')
    }
  }

  const adjustWeight = (personId, delta) => {
    const cur = Math.max(0, Math.floor(Number(weights[personId]) || 0))
    const nextVal = Math.max(0, cur + delta)
    setWeights((prev) => ({ ...prev, [personId]: nextVal }))
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
        currency: 'RUB',
      }).format(total)

      onSubmit({
        id,
        title: formattedTitle,
        amount: total,
        quantity: qtyValue,
        pricePerUnit: priceValue,
        paidBy,
        splitBetween,
        distributionType,
        weights,
      })

      setPurchase('')
      setQuantity('1')
      setPricePerUnit('')
      setPaidBy([])
      setSplitBetween([])
      setDistributionType('equal')
      setWeights({})
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
          e.preventDefault()
          handleSubmit()
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
              const value = e.target.value.replace(/,/g, '.').replace(/\.+/g, '.')
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
              const value = e.target.value.replace(/,/g, '.').replace(/\.+/g, '.')
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
            <p className="modal__label">Кто платил?</p>
            <div className="modal__tags">
              {people?.map((person) => (
                <Button
                  key={person.id}
                  className={`button-new ${paidBy.some((p) => p.id === person.id) ? 'button-new--active' : ''}`}
                  onClick={() => handlePaidByClick(person)}
                >
                  {person.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="modal__section">
          <div className="modal__split-header">
            <p className="modal__label">На кого разделить?</p>
            <IconButton icon={<ChartPie />} onClick={toggleDistribution} className={`icon-button${distributionType === 'weighted' ? ' icon-button--active' : ''}`}/>
          </div>
          {distributionType === 'equal' ? (
            <div className="modal__tags">
              {people?.map((person) => (
                <Button
                  key={person.id}
                  className={`button-new ${splitBetween.some((p) => p.id === person.id) ? 'button-new--active' : ''}`}
                  onClick={() => handleSplitBetweenClick(person)}
                >
                  {person.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="modal__weights-grid">
              {people?.map((person) => {
                const u = Math.max(0, Math.floor(Number(weights[person.id]) || 0))
                return (
                  <div key={person.id} className={`button-new button-new--weight${u > 0 ? ' button-new--active' : ''}`}>
                    <IconButton
                      className="icon-button--wide"
                      onClick={() => adjustWeight(person.id, -1)}
                      disabled={u <= 0}
                      aria-label="Меньше"
                      icon={<Minus size={18} />}
                    />
                    <span className="modal__weight-label">
                      x{u} {person.name}
                    </span>
                    <IconButton
                      className="icon-button--wide"
                      onClick={() => adjustWeight(person.id, 1)}
                      aria-label="Больше"
                      icon={<Plus size={18} />}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button type="submit" style={{ display: 'none' }} />
      </form>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="active" onClick={handleSubmit}>
          Добавить
        </Button>
      </div>
    </Modal>
  )
}

export default AddPositionModal
