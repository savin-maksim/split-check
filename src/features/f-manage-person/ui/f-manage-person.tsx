import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'

import './f-manage-person.scss'

type TFManagePersonProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialName?: string
  onSubmit: (name: string) => void
  title?: string
}

export const FManagePerson = ({ isOpen, onClose, mode, initialName = '', onSubmit, title }: TFManagePersonProps) => {
  const [name, setName] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)

  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  const nameRef = useRef(name)
  nameRef.current = name

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
    }
  }, [isOpen, initialName])

  const handleSubmit = useCallback(() => {
    const trimmed = nameRef.current.trim()
    if (!trimmed) return
    callbacksRef.current.onSubmit(trimmed)
    if (mode === 'add') setName('')
    callbacksRef.current.onClose()
  }, [mode])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const modalTitle = title ?? (mode === 'add' ? 'Добавить участника' : 'Изменить имя')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">{modalTitle}</h3>
      <div className="modal__inputs">
        <Input
          ref={inputRef}
          label="Имя"
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          clearable
          autoFocus
        />
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit} disabled={!name.trim()}>
          {mode === 'add' ? 'Добавить' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
}
