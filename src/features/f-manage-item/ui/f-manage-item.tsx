import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { toast } from 'react-hot-toast'

import { normalizeDecimalInput, formatItemTitle } from '@/shared/lib'
import { Modal, Input, Button, EButtonVariant, PersonGrid } from '@/shared/ui'
import type { TItem, TPerson } from '@/entities/check'
import { EPaymentMode } from '@/entities/check'

import './f-manage-item.scss'

type TFManageItemProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialData?: Partial<TItem>
  people: TPerson[]
  paymentMode: EPaymentMode
  /** В режиме single подставляется в paidBy при добавлении/сохранении, если задан */
  singlePayerId?: number | null
  onSubmit: (item: Omit<TItem, 'id'>) => void
}

export const FManageItem = ({
  isOpen,
  onClose,
  mode,
  initialData,
  people,
  paymentMode,
  singlePayerId = null,
  onSubmit,
}: TFManageItemProps) => {
  const [title, setTitle] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [qtyStr, setQtyStr] = useState('1')
  const [paidBy, setPaidBy] = useState<number[]>([])
  const [split, setSplit] = useState<Record<number, number>>({})

  const formRef = useRef({ title, priceStr, qtyStr, paidBy, split })
  formRef.current = { title, priceStr, qtyStr, paidBy, split }

  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  const submitContextRef = useRef({ mode, paymentMode, singlePayerId })
  submitContextRef.current = { mode, paymentMode, singlePayerId }

  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title ?? '')
      setPriceStr(initialData.price != null ? String(initialData.price / 100) : '')
      setQtyStr(String(initialData.qty ?? 1))
      setPaidBy(initialData.paidBy ?? [])
      setSplit(initialData.split ?? {})
    } else {
      setTitle('')
      setPriceStr('')
      setQtyStr('1')
      setPaidBy([])
      setSplit({})
    }
  }, [isOpen, mode, initialData, people])

  const handleTogglePaidBy = useCallback((person: TPerson) => {
    setPaidBy([person.id])
  }, [])

  const handleToggleSplit = useCallback((person: TPerson) => {
    setSplit((prev) => ({
      ...prev,
      [person.id]: (prev[person.id] ?? 0) > 0 ? 0 : 1,
    }))
  }, [])

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  const handlePriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPriceStr(e.target.value)
  }, [])

  const handleQtyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQtyStr(e.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    const { title: t, priceStr: p, qtyStr: q, paidBy: pb, split: sp } = formRef.current
    const { onSubmit: submit, onClose: close } = callbacksRef.current
    const { mode: submitMode, paymentMode: pm, singlePayerId: spId } = submitContextRef.current

    const trimmedTitle = t.trim()
    if (!trimmedTitle) {
      toast.error('Введите название позиции')
      return
    }

    const price = Math.round(parseFloat(normalizeDecimalInput(p)) * 100)
    if (Number.isNaN(price) || price < 0) {
      toast.error('Введите корректную цену')
      return
    }

    const qty = parseInt(q, 10)
    if (Number.isNaN(qty) || qty < 1) {
      toast.error('Количество должно быть больше 0')
      return
    }

    const effectivePaidBy =
      submitMode === 'add' && pm === EPaymentMode.Single && spId != null ? [spId] : pb

    submit({
      title: formatItemTitle(trimmedTitle),
      price,
      qty,
      paidBy: effectivePaidBy,
      split: sp,
    })

    close()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const selectedPaidBy = useMemo(() => people.filter((p) => paidBy.includes(p.id)), [people, paidBy])

  const selectedSplit = useMemo(() => people.filter((p) => (split[p.id] ?? 0) > 0), [people, split])

  const modalTitle = mode === 'add' ? 'Добавить позицию' : 'Изменить позицию'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">{modalTitle}</h3>
      <div className="modal__inputs">
        <Input
          name="title"
          label="Название"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          clearable
          autoFocus
        />
        <div className="modal__price-inputs">
          <Input
            name="qty"
            label="Кол-во"
            type="number"
            inputMode="numeric"
            value={qtyStr}
            onChange={handleQtyChange}
            onKeyDown={handleKeyDown}
          />
          <Input
            name="price"
            label="Цена"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            value={priceStr}
            onChange={handlePriceChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {paymentMode === EPaymentMode.Manual && people.length > 0 && (
        <div className="modal__section">
          <span className="modal__label">Кто платил</span>
          <div className="modal__tags">
            <PersonGrid people={people} selected={selectedPaidBy} onToggle={handleTogglePaidBy} />
          </div>
        </div>
      )}

      {people.length > 0 && (
        <div className="modal__section">
          <span className="modal__label">Разделить между</span>
          <div className="modal__tags">
            <PersonGrid people={people} selected={selectedSplit} onToggle={handleToggleSplit} />
          </div>
        </div>
      )}

      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit}>
          {mode === 'add' ? 'Добавить' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
}
