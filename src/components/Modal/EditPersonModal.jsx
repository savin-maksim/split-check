import { useState, useEffect } from 'react'
import Button from '../Button/Button'
import Modal from './Modal'
import './modal.scss'
import InputField from '../Input/InputField'

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
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="modal__inputs">
          <InputField
            value={name}
            onChange={(e) => setName(e.target.value)}
            label={'Имя участника'}
            onKeyDown={handleKeyDown}
            autoFocus
            required
          />
        </div>
        <div className="modal__buttons">
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="active" onClick={handleSubmit}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditPersonModal
