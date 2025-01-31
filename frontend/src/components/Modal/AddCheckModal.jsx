import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import ActionButton from '../Button/ActionButton';
import './modal.scss'

function AddCheckModal({ isOpen, onClose, onSubmit, initialTitle = '', isEditing = false }) {
  const [newCheckTitle, setNewCheckTitle] = useState(initialTitle)

  useEffect(() => {
    if (isOpen) {
      setNewCheckTitle(initialTitle)
    }
  }, [isOpen, initialTitle])

  const handleSubmit = () => {
    if (newCheckTitle.trim()) {
      onSubmit(newCheckTitle)
      setNewCheckTitle('')
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
      <h2 className='modal__title'>{isEditing ? 'Редактировать чек' : 'Создать новый чек'}</h2>
      <div
        className="modal__inputs"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <input
          type="text"
          value={newCheckTitle}
          onChange={(e) => setNewCheckTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Название чека"
          className="modal__input"
          autoFocus
        />
      </div>
      <div className="modal__buttons">
        <ActionButton
          type="submit"
          className="button button--primary"
          disabled={!newCheckTitle.trim()}
          onClick={handleSubmit}
        >
          {isEditing ? 'Сохранить' : 'Создать'}
        </ActionButton>
        <ActionButton
          type="button"
          onClick={onClose}
          className="button"
        >
          Отмена
        </ActionButton>
      </div>
    </Modal>
  )
}

export default AddCheckModal 