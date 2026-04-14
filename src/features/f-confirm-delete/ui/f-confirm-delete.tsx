import { Modal, Button, EButtonVariant } from '@/shared/ui'

import './f-confirm-delete.scss'

type TFConfirmDeleteProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export const FConfirmDelete = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены?',
}: TFConfirmDeleteProps) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">{title}</h3>
      <div className="modal__inputs">
        <p className="modal__message">{message}</p>
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Danger} onClick={handleConfirm}>
          Удалить
        </Button>
      </div>
    </Modal>
  )
}
