import { memo, useEffect, useCallback, useRef, useMemo, type FormEvent } from 'react'

import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'
import { createEnterKeyDownHandler } from '@/shared/lib'

const VALUE_PATTERN = '.*\\S.*'

export type ISingleInputModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  label: string
  initialValue?: string
  submitLabel: string
  onSubmit: (value: string) => void
}

const SingleInputModalComponent = ({
  isOpen,
  onClose,
  title,
  label,
  initialValue = '',
  submitLabel,
  onSubmit,
}: ISingleInputModalProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const el = inputRef.current
    if (el) el.value = initialValue
    el?.focus()
  }, [isOpen, initialValue])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const raw = String(new FormData(e.currentTarget).get('value') ?? '')
      onSubmit(raw.trim())
      onClose()
    },
    [onSubmit, onClose],
  )

  const requestFormSubmit = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [])

  const handleKeyDown = useMemo(() => createEnterKeyDownHandler(requestFormSubmit), [requestFormSubmit])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <h3 className="modal__title">{title}</h3>
        <div className="modal__inputs">
          <Input
            ref={inputRef}
            name="value"
            label={label}
            defaultValue={initialValue}
            required
            pattern={VALUE_PATTERN}
            title="Введите текст (не только пробелы)"
            onKeyDown={handleKeyDown}
            clearable
          />
        </div>
        <div className="modal__buttons">
          <Button type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant={EButtonVariant.Active}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export const SingleInputModal = memo(SingleInputModalComponent)
SingleInputModal.displayName = 'SingleInputModal'
