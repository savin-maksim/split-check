import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { Modal, Input, Button, EButtonVariant } from '@/shared/ui'

import './f-create-check.scss'

type TFCreateCheckProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string) => void
}

export const FCreateCheck = ({ isOpen, onClose, onSubmit }: TFCreateCheckProps) => {
  const [title, setTitle] = useState('')

  const callbacksRef = useRef({ onSubmit, onClose })
  callbacksRef.current = { onSubmit, onClose }

  const titleRef = useRef(title)
  titleRef.current = title

  useEffect(() => {
    if (isOpen) setTitle('')
  }, [isOpen])

  const handleSubmit = useCallback(() => {
    const trimmed = titleRef.current.trim()
    if (!trimmed) return
    callbacksRef.current.onSubmit(trimmed)
    callbacksRef.current.onClose()
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

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">Новый чек</h3>
      <div className="modal__inputs">
        <Input
          name="title"
          label="Название чека"
          value={title}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          clearable
          autoFocus
        />
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit} disabled={!title.trim()}>
          Создать
        </Button>
      </div>
    </Modal>
  )
}
