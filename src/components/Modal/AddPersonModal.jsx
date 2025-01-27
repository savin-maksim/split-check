import React, { useState } from 'react'
import ActionButton from '../Button/ActionButton'
import Modal from './Modal'
import './modal.scss'

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
      <h2 className='modal__title'>{title}</h2>
      <form 
        className="modal__inputs"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите имена через запятую"
          className="modal__input"
          autoFocus
        />
        <div className="modal__buttons">
          <ActionButton onClick={handleSubmit}>
            Добавить
          </ActionButton>
          <ActionButton onClick={onClose}>
            Отмена
          </ActionButton>
        </div>
      </form>
    </Modal>
  )
}

export default AddPersonModal 