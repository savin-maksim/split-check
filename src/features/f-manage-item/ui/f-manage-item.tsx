import { useState, useEffect, useCallback, useRef, memo } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { toast } from 'react-hot-toast'

import { normalizeDecimalInput, formatItemTitle } from '@/shared/lib'
import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'
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

const FManageItemComponent = ({
  isOpen,
  onClose,
  mode,
  initialData,
  people,
  paymentMode,
  singlePayerId = null,
  onSubmit,
}: TFManageItemProps) => {
  const handleClose = useCallback(() => onClose(), [onClose])

  const titleValueRef = useRef('')
  const priceValueRef = useRef('')
  const qtyValueRef = useRef('1')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)

  const [paidBy, setPaidBy] = useState<number[]>([])
  const [split, setSplit] = useState<Record<number, number>>({})

  const paidBySplitRef = useRef({ paidBy, split })
  paidBySplitRef.current = { paidBy, split }

  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  const submitContextRef = useRef({ mode, paymentMode, singlePayerId })
  submitContextRef.current = { mode, paymentMode, singlePayerId }

  useEffect(() => {
    if (!isOpen) return

    let titleStr = ''
    let priceStr = ''
    let qtyStr = '1'

    if (mode === 'edit' && initialData) {
      titleStr = initialData.title ?? ''
      priceStr = initialData.price != null ? String(initialData.price / 100) : ''
      qtyStr = String(initialData.qty ?? 1)
      setPaidBy(initialData.paidBy ?? [])
      setSplit(initialData.split ?? {})
    } else {
      setPaidBy([])
      setSplit({})
    }

    titleValueRef.current = titleStr
    priceValueRef.current = priceStr
    qtyValueRef.current = qtyStr

    const tEl = titleInputRef.current
    const pEl = priceInputRef.current
    const qEl = qtyInputRef.current
    if (tEl) tEl.value = titleStr
    if (pEl) pEl.value = priceStr
    if (qEl) qEl.value = qtyStr

    tEl?.focus()
  }, [isOpen, mode, initialData, people])

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    titleValueRef.current = e.target.value
  }, [])

  const handlePriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    priceValueRef.current = e.target.value
  }, [])

  const handleQtyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    qtyValueRef.current = e.target.value
  }, [])

  const handleSubmit = useCallback(() => {
    const t = titleValueRef.current
    const p = priceValueRef.current
    const q = qtyValueRef.current
    const { paidBy: pb, split: sp } = paidBySplitRef.current
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

    const effectivePaidBy = submitMode === 'add' && pm === EPaymentMode.Single && spId != null ? [spId] : pb

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

  const modalTitle = mode === 'add' ? 'Добавить позицию' : 'Изменить позицию'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h3 className="modal__title">{modalTitle}</h3>
      <div className="modal__inputs">
        <Input
          ref={titleInputRef}
          name="title"
          label="Название"
          defaultValue=""
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          clearable
          autoFocus
        />
        <div className="modal__price-inputs">
          <Input
            ref={qtyInputRef}
            name="qty"
            label="Кол-во"
            type="number"
            inputMode="numeric"
            defaultValue="1"
            onChange={handleQtyChange}
            onKeyDown={handleKeyDown}
          />
          <Input
            ref={priceInputRef}
            name="price"
            label="Цена"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            defaultValue=""
            onChange={handlePriceChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="modal__buttons">
        <Button onClick={handleClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit}>
          {mode === 'add' ? 'Добавить' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
}

export const FManageItem = memo(FManageItemComponent)
FManageItem.displayName = 'FManageItem'
