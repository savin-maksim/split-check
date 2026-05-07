import { memo, useLayoutEffect, useRef } from 'react'

import { Modal, Button, EButtonVariant } from '@/shared/ui'

type TFConfirmDeleteProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

const FConfirmDeleteComponent = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены?',
}: TFConfirmDeleteProps) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }
    deleteButtonRef.current?.focus()
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} mode="middle">
      <h3 className="modal__title">{title}</h3>
      <div className="modal__inputs">
        <p className="modal__message">{message}</p>
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button ref={deleteButtonRef} variant={EButtonVariant.Danger} onClick={handleConfirm}>
          Удалить
        </Button>
      </div>
    </Modal>
  )
}

export const FConfirmDelete = memo(FConfirmDeleteComponent)
FConfirmDelete.displayName = 'FConfirmDelete'
