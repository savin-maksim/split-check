import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { normalizeDecimalInput, formatItemTitle, createEnterKeyDownHandler, selectInputOnFocus } from '@/shared/lib'
import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'
import type { TItem } from '@/entities/check'
import { EPaymentMode } from '@/entities/check'

import { syncPriceFieldValidity } from '../lib/sync-price-field-validity'

import './f-manage-item.scss'

type TFManageItemProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialData?: Partial<TItem>
  paymentMode: EPaymentMode
  singlePayerId?: number | null
  onSubmit: (item: Omit<TItem, 'id'>) => void
}

const TITLE_PATTERN = '.*\\S.*'

export const FManageItem = ({
  isOpen,
  onClose,
  mode,
  initialData,
  paymentMode,
  singlePayerId = null,
  onSubmit,
}: TFManageItemProps) => {
  const formRef = useRef<HTMLFormElement>(null)
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
    if (pEl) {
      pEl.value = priceStr
      syncPriceFieldValidity(pEl)
    }
    if (qEl) qEl.value = qtyStr

    tEl?.focus()
  }, [isOpen, mode, initialData])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const trimmedTitle = String(fd.get('title') ?? '').trim()
      const priceRaw = String(fd.get('price') ?? '')
      const qtyStr = String(fd.get('qty') ?? '1')

      const price = Math.round(parseFloat(normalizeDecimalInput(priceRaw)) * 100)
      const qty = parseInt(qtyStr, 10)

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
    },
    [mode, paymentMode, singlePayerId, paidBy, split, onSubmit, onClose],
  )

  const requestFormSubmit = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [])

  const handlePriceFocus = useMemo(
    () =>
      createEnterKeyDownHandler(() => {
        priceInputRef.current?.focus()
      }),
    [],
  )

  const handleChangeTitle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    titleValueRef.current = e.target.value
  }, [])

  const handleChangeQty = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    qtyValueRef.current = e.target.value
  }, [])

  const handleChangePrice = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    priceValueRef.current = e.target.value
    syncPriceFieldValidity(e.currentTarget)
  }, [])

  const handleEnterSubmit = useMemo(() => createEnterKeyDownHandler(requestFormSubmit), [requestFormSubmit])

  const modalTitle = mode === 'add' ? 'Добавить позицию' : 'Изменить позицию'
  const titleDefaultValue = mode === 'edit' && initialData != null ? (initialData.title ?? '') : ''
  const priceDefaultValue =
    mode === 'edit' && initialData != null ? (initialData.price != null ? String(initialData.price / 100) : '') : ''
  const qtyDefaultValue = mode === 'edit' && initialData != null ? String(initialData.qty ?? 1) : '1'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <h3 className="modal__title">{modalTitle}</h3>
        <div className="modal__inputs">
          <Input
            ref={titleInputRef}
            name="title"
            label="Название"
            defaultValue={titleDefaultValue}
            pattern={TITLE_PATTERN}
            title="Введите название позиции"
            onChange={handleChangeTitle}
            onKeyDown={handlePriceFocus}
            enterKeyHint="next"
            required
            clearable
          />
          <div className="modal__price-inputs">
            <Input
              ref={qtyInputRef}
              name="qty"
              label="Кол-во"
              type="number"
              inputMode="numeric"
              defaultValue={qtyDefaultValue}
              min={1}
              step={1}
              onChange={handleChangeQty}
              onKeyDown={handlePriceFocus}
              onFocus={selectInputOnFocus}
              required
              clearable
            />
            <Input
              ref={priceInputRef}
              name="price"
              label="Цена"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              defaultValue={priceDefaultValue}
              onChange={handleChangePrice}
              onKeyDown={handleEnterSubmit}
              required
              clearable
            />
          </div>
        </div>

        <div className="modal__buttons">
          <Button type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant={EButtonVariant.Active}>
            {mode === 'add' ? 'Добавить' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

FManageItem.displayName = 'FManageItem'
