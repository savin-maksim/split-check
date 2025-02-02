import Modal from './Modal'
import ActionButton from '../Button/ActionButton'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, message, title }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="delete-confirm-modal"
    >
      <h2 className="modal__title">{title}</h2>
      <p className="delete-confirm-modal__message">
        {message || "Вы уверены, что хотите удалить этот элемент?"}
      </p>

      <div className="modal__buttons">
        <ActionButton onClick={onConfirm} className="button--danger">
          Удалить
        </ActionButton>
        <ActionButton onClick={onClose}>
          Отмена
        </ActionButton>
      </div>
    </Modal>
  )
}

export default DeleteConfirmModal 