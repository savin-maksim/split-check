import type { ChangeEvent, FormEvent } from 'react'

import { createEnterKeyDownHandler, formatItemTitle, selectInputOnFocus } from '@shared/lib'
import { Input, Button, EButtonVariant } from '@shared/ui'
import type { TItem } from '@entities/check'
import { EPaymentMode } from '@entities/check'

import { calculateExpressionInInput } from '../../lib/calculate-expression-in-input'
import { syncPriceFieldValidity } from '../../lib/sync-price-field-validity'
import { useItemForm } from '../../lib/use-item-form'

const TITLE_PATTERN = '.*\\S.*'

type TManageItemFormProps = {
  mode: 'add' | 'edit'
  isOpen: boolean
  initialData?: Partial<TItem>
  initialFocus?: 'title' | 'price'
  paymentMode: EPaymentMode
  singlePayerId?: number | null
  onSubmit: (item: Omit<TItem, 'id'>) => void
  onClose: () => void
}

export const ManageItemForm = ({
  mode,
  isOpen,
  initialData,
  initialFocus,
  paymentMode,
  singlePayerId = null,
  onSubmit,
  onClose,
}: TManageItemFormProps) => {
  const {
    formRef,
    titleInputRef,
    priceInputRef,
    qtyInputRef,
    titleDefaultValue,
    priceDefaultValue,
    qtyDefaultValue,
    requestSubmit,
  } = useItemForm({ isOpen, mode, initialData, initialFocus })

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const trimmedTitle = String(fd.get('title') ?? '').trim()
    const priceRaw = String(fd.get('price') ?? '')
    const qtyStr = String(fd.get('qty') ?? '1')

    const price = Math.round(calculateExpressionInInput(priceRaw) * 100)
    const qty = parseInt(qtyStr, 10)

    const isInitialSinglePayer = mode === 'add' && paymentMode === EPaymentMode.Single && singlePayerId != null
    const paidBy = isInitialSinglePayer ? singlePayerId : (initialData?.paidBy ?? 0)
    const split = initialData?.split ?? {}

    onSubmit({
      title: formatItemTitle(trimmedTitle),
      price,
      qty,
      paidBy,
      split,
    })

    onClose()
  }

  const handleSubmitEnter = createEnterKeyDownHandler(requestSubmit)

  const focusPriceOnEnter = createEnterKeyDownHandler(() => priceInputRef.current?.focus())

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => syncPriceFieldValidity(e.currentTarget)

  return (
    <form ref={formRef} onSubmit={handleFormSubmit}>
      <h3 className="modal__title">{mode === 'add' ? 'Добавить позицию' : 'Изменить позицию'}</h3>
      <div className="modal__inputs">
        <Input
          ref={titleInputRef}
          name="title"
          label="Название"
          defaultValue={titleDefaultValue}
          pattern={TITLE_PATTERN}
          title="Введите название позиции"
          onKeyDown={focusPriceOnEnter}
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
            onKeyDown={focusPriceOnEnter}
            onFocus={selectInputOnFocus}
            required
            clearable
          />
          <Input
            ref={priceInputRef}
            name="price"
            label="Цена"
            type="text"
            inputMode="decimal"
            defaultValue={priceDefaultValue}
            onChange={handlePriceChange}
            onKeyDown={handleSubmitEnter}
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
  )
}
