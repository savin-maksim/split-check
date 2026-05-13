import { useEffect, useRef } from 'react'

import type { TItem } from '@entities/check'

import { syncPriceFieldValidity } from './sync-price-field-validity'

type TUseItemFormParams = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initialData?: Partial<TItem>
  initialFocus?: 'title' | 'price'
}

export const useItemForm = ({ isOpen, mode, initialData, initialFocus = 'title' }: TUseItemFormParams) => {
  const formRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)

  const titleDefaultValue = mode === 'edit' && initialData != null ? (initialData.title ?? '') : ''
  const priceDefaultValue =
    mode === 'edit' && initialData != null ? (initialData.price != null ? String(initialData.price / 100) : '') : ''
  const qtyDefaultValue = mode === 'edit' && initialData != null ? String(initialData.qty ?? 1) : '1'

  useEffect(() => {
    if (!isOpen) return

    const tEl = titleInputRef.current
    const pEl = priceInputRef.current
    const qEl = qtyInputRef.current
    if (tEl) tEl.value = titleDefaultValue
    if (pEl) {
      pEl.value = priceDefaultValue
      syncPriceFieldValidity(pEl)
    }
    if (qEl) qEl.value = qtyDefaultValue

    if (initialFocus === 'price') {
      pEl?.select()
    } else {
      tEl?.focus()
    }
  }, [isOpen, titleDefaultValue, priceDefaultValue, qtyDefaultValue, initialFocus])

  const requestSubmit = () => formRef.current?.requestSubmit()

  return {
    formRef,
    titleInputRef,
    priceInputRef,
    qtyInputRef,
    titleDefaultValue,
    priceDefaultValue,
    qtyDefaultValue,
    requestSubmit,
  }
}
