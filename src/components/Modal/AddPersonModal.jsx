import { useState } from 'react'
import Button from '../Button/Button'
import Modal from './Modal'
import './modal.scss'
import InputField from '../Input/InputField'

function AddPersonModal({ isOpen, onClose, onSubmit, title }) {
  const [newPersonName, setNewPersonName] = useState('')

  const handleSubmit = () => {
    if (newPersonName.trim()) {
      onSubmit(newPersonName)
      setNewPersonName('')
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
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            label={'Имена участников (через запятую)'}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
            required
          />
        </div>
        <div className="modal__buttons">
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" className="button--active" onClick={handleSubmit}>
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddPersonModal
