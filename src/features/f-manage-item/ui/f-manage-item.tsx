import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { toast } from 'react-hot-toast'

import { normalizeDecimalInput, formatItemTitle, createEnterKeyDownHandler } from '@/shared/lib'
import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'
import type { TItem } from '@/entities/check'
import { EPaymentMode } from '@/entities/check'

type TFManageItemProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialData?: Partial<TItem>
  paymentMode: EPaymentMode
  singlePayerId?: number | null
  onSubmit: (item: Omit<TItem, 'id'>) => void
}

export const FManageItem = ({
  isOpen,
  onClose,
  mode,
  initialData,
  paymentMode,
  singlePayerId = null,
  onSubmit,
}: TFManageItemProps) => {
  const titleValueRef = useRef('')
  const priceValueRef = useRef('')
  const qtyValueRef = useRef('1')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)

  const [paidBy, setPaidBy] = useState<number[]>([])
  const [split, setSplit] = useState<Record<number, number>>({})

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
  }, [isOpen, mode, initialData])

  const handleSubmit = useCallback(() => {
    const t = titleValueRef.current
    const p = priceValueRef.current
    const q = qtyValueRef.current

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
      mode === 'add' && paymentMode === EPaymentMode.Single && singlePayerId != null ? [singlePayerId] : paidBy

    onSubmit({
      title: formatItemTitle(trimmedTitle),
      price,
      qty,
      paidBy: effectivePaidBy,
      split,
    })

    onClose()
  }, [mode, paymentMode, singlePayerId, paidBy, split, onSubmit, onClose])

  const handleTitleKeyDown = useMemo(
    () =>
      createEnterKeyDownHandler(() => {
        priceInputRef.current?.focus()
      }),
    [],
  )

  const handleQtyFocus = useCallback(() => {
    qtyInputRef.current?.select()
  }, [])

  const handleEnterSubmit = useMemo(() => createEnterKeyDownHandler(handleSubmit), [handleSubmit])

  const modalTitle = mode === 'add' ? 'Добавить позицию' : 'Изменить позицию'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">{modalTitle}</h3>
      <div className="modal__inputs">
        <Input
          ref={titleInputRef}
          name="title"
          label="Название"
          defaultValue=""
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            titleValueRef.current = e.target.value
          }}
          onKeyDown={handleTitleKeyDown}
          enterKeyHint="next"
          clearable
        />
        <div className="modal__price-inputs">
          <Input
            ref={qtyInputRef}
            name="qty"
            label="Кол-во"
            type="number"
            inputMode="numeric"
            defaultValue="1"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              qtyValueRef.current = e.target.value
            }}
            onKeyDown={handleEnterSubmit}
            onFocus={handleQtyFocus}
          />
          <Input
            ref={priceInputRef}
            name="price"
            label="Цена"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            defaultValue=""
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              priceValueRef.current = e.target.value
            }}
            onKeyDown={handleEnterSubmit}
          />
        </div>
      </div>

      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit}>
          {mode === 'add' ? 'Добавить' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
}

FManageItem.displayName = 'FManageItem'
