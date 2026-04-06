import { useState, useRef, useEffect } from 'react'
import Button from '../Button/Button'
import './modal.scss'
import { toast } from 'react-hot-toast'
import Modal from './Modal'
import WhoPaidSection from '@/components/Cards/Cost/WhoPaidSection/WhoPaidSection'
import SplitBetweenSection from '@/components/Cards/Cost/SplitBetweenSection/SplitBetweenSection'
import { buildWeightsFromSplit, splitBetweenFromWeights } from '../../utils/costDistribution'
import { togglePaidByManual } from '../../utils/togglePaidBy'
import InputField from '../Input/InputField'

function AddPositionModal({ isOpen, onClose, onSubmit, title, people, paymentMode = 'manual' }) {
  const [purchase, setPurchase] = useState('')
  const [quantity, setQuantity] = useState()
  const [pricePerUnit, setPricePerUnit] = useState(0)
  const [paidBy, setPaidBy] = useState([])
  const [splitBetween, setSplitBetween] = useState([])
  const [distributionType, setDistributionType] = useState('equal')
  const [weights, setWeights] = useState({})
  const [error, setError] = useState('')
  const purchaseInputRef = useRef(null)
  const quantityInputRef = useRef(null)
  const priceInputRef = useRef(null)

  useEffect(() => {
    resetPeopleState()
  }, [paymentMode])

  // useEffect(() => {
  //   if (isOpen) {
  //     resetPeopleState()
  //   }
  // }, [isOpen])

  const [paidByExpanded, setPaidByExpanded] = useState(true)

  const resetPeopleState = () => {
    setPaidBy([])
    setSplitBetween([])
    setDistributionType('equal')
    setWeights({})
    setPaidByExpanded(true)
  }

  const formatTitle = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const handlePaidByClick = (person) => {
    togglePaidByManual({
      person,
      onPick: (selected) => setPaidBy(selected),
      onCollapse: () => setPaidByExpanded(false),
    })
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
    setWeights((prev) => {
      const cur = Math.max(0, Math.floor(Number(prev[personId]) || 0))
      return { ...prev, [personId]: Math.max(0, cur + delta) }
    })
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
      setQuantity(1)
      setPricePerUnit('')
      resetPeopleState()
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

  // if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">{title}</h2>
      {/* {error && <p className="modal__error">{error}</p>} */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="modal__inputs">
          <InputField
            // ref={purchaseInputRef}
            value={purchase}
            onChange={(e) => setPurchase(e.target.value)}
            // onKeyDown={(e) => handleKeyDown(e, 'purchase')}
            autoComplete="off"
            label="Название покупки"
            autoFocus
            // required
          />
          <div className="modal__price-inputs">
            <InputField
              type="number"
              // ref={quantityInputRef}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              // onKeyDown={(e) => handleKeyDown(e, 'quantity')}
              autoComplete="off"
              label="Количество"
            />
            <InputField
              // ref={priceInputRef}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              // onKeyDown={(e) => handleKeyDown(e, 'pricePerUnit')}
              autoComplete="off"
              label="Цена за единицу"
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              pattern="[0-9]*"
            />
          </div>
        </div>

        {paymentMode === 'manual' && (
          <WhoPaidSection
            people={people}
            paidBy={paidBy}
            expanded={paidByExpanded}
            onToggle={() => setPaidByExpanded((p) => !p)}
            onPersonToggle={handlePaidByClick}
          />
        )}

        <SplitBetweenSection
          people={people}
          distributionType={distributionType}
          splitBetween={splitBetween}
          weights={weights}
          onToggle={handleSplitBetweenClick}
          onToggleDistribution={toggleDistribution}
          onAdjustWeight={adjustWeight}
        />

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
