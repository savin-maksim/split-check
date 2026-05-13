import { memo, useEffect, useCallback, useRef, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'

import { Button, EButtonVariant } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { createEnterKeyDownHandler } from '@shared/lib'

import { Modal } from './modal'

const VALUE_PATTERN = '.*\\S.*'

export type TSingleInputModalSubmitResult = void | string | { error?: string | null }

export type TSingleInputModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  label: string
  initialValue?: string
  emptyError?: string
  submitLabel: string
  onSubmit: (value: string) => TSingleInputModalSubmitResult
}

const SingleInputModalComponent = ({
  isOpen,
  onClose,
  title,
  label,
  initialValue = '',
  emptyError = 'Введите текст',
  submitLabel,
  onSubmit,
}: TSingleInputModalProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const el = inputRef.current
    if (el) el.value = initialValue
    setError(null)
    el?.focus()
  }, [isOpen, initialValue])

  const handleClose = useCallback(() => {
    setError(null)
    onClose()
  }, [onClose])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const raw = String(new FormData(e.currentTarget).get('value') ?? '')
      const result = onSubmit(raw.trim())
      const nextError = typeof result === 'string' ? result : result?.error

      if (nextError) {
        setError(nextError)
        inputRef.current?.focus()
        return
      }

      setError(null)
      onClose()
    },
    [onSubmit, onClose],
  )

  const requestFormSubmit = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [])

  const handleKeyDown = useMemo(() => createEnterKeyDownHandler(requestFormSubmit), [requestFormSubmit])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) setError(null)
  }, [])

  const handleInvalid = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.preventDefault()
      setError(e.currentTarget.value.trim() ? e.currentTarget.validationMessage : emptyError)
      inputRef.current?.focus()
    },
    [emptyError],
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
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
            onChange={handleChange}
            onInvalid={handleInvalid}
            error={error ?? undefined}
            clearable
          />
        </div>
        <div className="modal__buttons">
          <Button type="button" onClick={handleClose}>
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
