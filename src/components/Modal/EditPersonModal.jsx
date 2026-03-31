import { useState, useEffect } from 'react'
import Button from '../Button/Button'
import Modal from './Modal'
import './modal.scss'

function EditPersonModal({ isOpen, onClose, onSubmit, title = 'Редактировать имя', initialName = '' }) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
    }
  }, [isOpen, initialName])

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">{title}</h2>
      <form
        className="modal__inputs"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Имя участника"
          className="modal__input"
          autoFocus
        />
        <div className="modal__buttons">
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="active" onClick={handleSubmit}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditPersonModal
